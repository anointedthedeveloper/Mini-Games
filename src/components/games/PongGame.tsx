import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getGameSlot, replaceGameSlot, type Room } from "./types";
import type { RealtimeChannel } from "@supabase/supabase-js";

const W = 600;
const H = 360;
const PADDLE_H = 70;
const PADDLE_W = 10;
const BALL_R = 7;
const PADDLE_SPEED = 6;
const WIN_SCORE = 5;
const SMOOTH = 0.25; // remote interpolation factor (0..1)
const GID = "pong";

interface PongPersistedState {
  scores?: { left: number; right: number };
  winner?: "left" | "right" | null;
}

export function PongGame({
  room,
  playerId,
  players,
}: {
  room: Room;
  playerId: string;
  players: { player_id: string; name: string }[];
}) {
  const persisted = getGameSlot<PongPersistedState>(room, GID);
  const left = players[0];
  const right = players[1];
  const side: "left" | "right" | "spectator" =
    left?.player_id === playerId ? "left" : right?.player_id === playerId ? "right" : "spectator";
  const isHost = room.host_id === playerId;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Authoritative (host) or local-render state
  const stateRef = useRef({
    leftY: H / 2 - PADDLE_H / 2,
    rightY: H / 2 - PADDLE_H / 2,
    ballX: W / 2,
    ballY: H / 2,
    vx: 4,
    vy: 2,
    scores: persisted.scores ?? { left: 0, right: 0 },
    winner: persisted.winner ?? null,
  });
  // Smoothing target for non-host clients
  const targetRef = useRef({ ...stateRef.current });
  const inputsRef = useRef({ leftDir: 0, rightDir: 0 });
  const [, force] = useState(0);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Realtime channel — single subscription with both event handlers
  useEffect(() => {
    const ch = supabase.channel(`pong:${room.id}`, { config: { broadcast: { self: false } } });
    channelRef.current = ch;

    ch.on("broadcast", { event: "input" }, ({ payload }) => {
      if (!isHost) return;
      if (typeof payload.absY === "number") {
        if (payload.side === "left") stateRef.current.leftY = payload.absY;
        else if (payload.side === "right") stateRef.current.rightY = payload.absY;
        return;
      }
      if (payload.side === "left") inputsRef.current.leftDir = payload.dir;
      else if (payload.side === "right") inputsRef.current.rightDir = payload.dir;
    });

    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      if (isHost) return;
      // Update target for smoothing
      targetRef.current.leftY = payload.leftY;
      targetRef.current.rightY = payload.rightY;
      targetRef.current.ballX = payload.ballX;
      targetRef.current.ballY = payload.ballY;
      stateRef.current.scores = payload.scores;
      stateRef.current.winner = payload.winner;
    });

    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [room.id, isHost]);

  // Keyboard input
  useEffect(() => {
    if (side === "spectator") return;
    const dir = { up: false, down: false };
    const sendInput = () => {
      const v = dir.up ? -1 : dir.down ? 1 : 0;
      if (isHost) {
        if (side === "left") inputsRef.current.leftDir = v;
        else inputsRef.current.rightDir = v;
      } else {
        channelRef.current?.send({ type: "broadcast", event: "input", payload: { side, dir: v } });
      }
    };
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") dir.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") dir.down = true;
      sendInput();
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") dir.up = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") dir.down = false;
      sendInput();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [side, isHost]);

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (side === "spectator") return;
    setShowHint(false);
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    const y = Math.max(0, Math.min(H - PADDLE_H, ratio * H - PADDLE_H / 2));
    if (isHost) {
      if (side === "left") stateRef.current.leftY = y;
      else stateRef.current.rightY = y;
    } else {
      channelRef.current?.send({ type: "broadcast", event: "input", payload: { side, dir: 0, absY: y } });
    }
  };

  // Game loop
  useEffect(() => {
    let raf = 0;
    let lastBroadcast = 0;
    const tick = (t: number) => {
      const s = stateRef.current;

      if (isHost && !s.winner && players.length >= 2) {
        s.leftY = clamp(s.leftY + inputsRef.current.leftDir * PADDLE_SPEED, 0, H - PADDLE_H);
        s.rightY = clamp(s.rightY + inputsRef.current.rightDir * PADDLE_SPEED, 0, H - PADDLE_H);
        s.ballX += s.vx;
        s.ballY += s.vy;
        if (s.ballY < BALL_R || s.ballY > H - BALL_R) s.vy *= -1;
        if (s.ballX - BALL_R < PADDLE_W && s.ballY > s.leftY && s.ballY < s.leftY + PADDLE_H) {
          s.vx = Math.abs(s.vx) * 1.04;
          s.vy += (s.ballY - (s.leftY + PADDLE_H / 2)) * 0.08;
        }
        if (s.ballX + BALL_R > W - PADDLE_W && s.ballY > s.rightY && s.ballY < s.rightY + PADDLE_H) {
          s.vx = -Math.abs(s.vx) * 1.04;
          s.vy += (s.ballY - (s.rightY + PADDLE_H / 2)) * 0.08;
        }
        if (s.ballX < 0) {
          s.scores = { ...s.scores, right: s.scores.right + 1 };
          resetBall(s, -1);
        } else if (s.ballX > W) {
          s.scores = { ...s.scores, left: s.scores.left + 1 };
          resetBall(s, 1);
        }
        if (s.scores.left >= WIN_SCORE) s.winner = "left";
        else if (s.scores.right >= WIN_SCORE) s.winner = "right";

        if (t - lastBroadcast > 33) {
          lastBroadcast = t;
          channelRef.current?.send({
            type: "broadcast",
            event: "state",
            payload: {
              leftY: s.leftY,
              rightY: s.rightY,
              ballX: s.ballX,
              ballY: s.ballY,
              scores: s.scores,
              winner: s.winner,
            },
          });
        }

        if (s.winner) {
          supabase
            .from("rooms")
            .update({ state: replaceGameSlot(room, GID, { scores: s.scores, winner: s.winner }) })
            .eq("id", room.id);
        }
      } else if (!isHost) {
        // Smoothly interpolate toward target
        const tg = targetRef.current;
        s.leftY += (tg.leftY - s.leftY) * SMOOTH;
        s.rightY += (tg.rightY - s.rightY) * SMOOTH;
        s.ballX += (tg.ballX - s.ballX) * SMOOTH;
        s.ballY += (tg.ballY - s.ballY) * SMOOTH;
      }

      draw();
      force((n) => (n + 1) % 1000000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isHost, room, players.length]);

  const draw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "white";
    ctx.fillRect(0, s.leftY, PADDLE_W, PADDLE_H);
    ctx.fillRect(W - PADDLE_W, s.rightY, PADDLE_W, PADDLE_H);
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "bold 32px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(String(s.scores.left), W / 2 - 40, 40);
    ctx.fillText(String(s.scores.right), W / 2 + 40, 40);
  };

  const playAgain = async () => {
    if (!isHost) return;
    stateRef.current.scores = { left: 0, right: 0 };
    stateRef.current.winner = null;
    resetBall(stateRef.current, Math.random() > 0.5 ? 1 : -1);
    await supabase
      .from("rooms")
      .update({ state: replaceGameSlot(room, GID, { scores: { left: 0, right: 0 }, winner: null }) })
      .eq("id", room.id);
  };

  const winner = stateRef.current.winner;
  const winnerName = winner === "left" ? left?.name : winner === "right" ? right?.name : null;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Pong</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {left?.name ?? "—"} vs {right?.name ?? "waiting…"} · First to {WIN_SCORE}
        </p>
      </div>

      {players.length < 2 ? (
        <p className="text-center text-sm text-muted-foreground">Waiting for another player…</p>
      ) : (
        <>
          <div className="relative rounded-lg overflow-hidden border bg-black">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              onPointerMove={onPointerMove}
              onPointerDown={onPointerMove}
              onTouchMove={(e) => e.preventDefault()}
              className="w-full h-auto touch-none block"
            />
            {showHint && side !== "spectator" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/70 text-white text-xs px-3 py-2 rounded-full backdrop-blur animate-pulse">
                  ↕ Drag anywhere on the board to move your paddle
                </div>
              </div>
            )}
          </div>
          {side !== "spectator" && (
            <p className="text-center text-xs text-muted-foreground">
              You are the <span className="font-semibold">{side}</span> paddle · W/S, ↑/↓, or drag
            </p>
          )}
          {winnerName && (
            <div className="text-center space-y-3">
              <div className="text-lg font-bold">{winnerName} wins!</div>
              {isHost && (
                <Button onClick={playAgain} className="w-full">
                  Play Again
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function resetBall(s: { ballX: number; ballY: number; vx: number; vy: number }, dir: 1 | -1) {
  s.ballX = W / 2;
  s.ballY = H / 2;
  s.vx = 4 * dir;
  s.vy = (Math.random() - 0.5) * 4;
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
