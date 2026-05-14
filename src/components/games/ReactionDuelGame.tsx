import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getGameSlot, replaceGameSlot, type Room } from "./types";

const GID = "reaction";
const ROUNDS = 5;

interface ReactionState {
  round?: number;
  startAt?: number; // ms epoch when "GO" appears, set by host
  results?: Record<string, number[]>; // player_id -> reaction times in ms (one per round)
  winnerRound?: string | null; // who tapped first this round
  status?: "waiting" | "armed" | "go" | "results";
}

export function ReactionDuelGame({
  room,
  playerId,
  players,
}: {
  room: Room;
  playerId: string;
  players: { player_id: string; name: string }[];
}) {
  const state = getGameSlot<ReactionState>(room, GID);
  const round = state.round ?? 0;
  const status = state.status ?? "waiting";
  const results = state.results ?? {};
  const isHost = room.host_id === playerId;

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(i);
  }, []);

  const startNext = async () => {
    if (!isHost) return;
    const delay = 1500 + Math.random() * 3000;
    const startAt = Date.now() + delay;
    await supabase
      .from("rooms")
      .update({
        state: replaceGameSlot(room, GID, {
          ...state,
          round: round + 1,
          startAt,
          status: "armed",
          winnerRound: null,
        }),
      })
      .eq("id", room.id);
  };

  // Host transitions armed -> go automatically when startAt reached
  useEffect(() => {
    if (!isHost || status !== "armed" || !state.startAt) return;
    const ms = state.startAt - Date.now();
    const t = setTimeout(async () => {
      await supabase
        .from("rooms")
        .update({ state: replaceGameSlot(room, GID, { ...state, status: "go" }) })
        .eq("id", room.id);
    }, Math.max(0, ms));
    return () => clearTimeout(t);
  }, [isHost, status, state, room]);

  const tap = async () => {
    if (status === "armed") {
      // false start: penalize 1000ms
      const mine = results[playerId] ?? [];
      await supabase
        .from("rooms")
        .update({
          state: replaceGameSlot(room, GID, {
            ...state,
            results: { ...results, [playerId]: [...mine, 1000] },
            status: "results",
            winnerRound: state.winnerRound ?? null,
          }),
        })
        .eq("id", room.id);
      return;
    }
    if (status !== "go" || !state.startAt) return;
    const rt = Date.now() - state.startAt;
    const mine = results[playerId] ?? [];
    if (mine.length >= round) return; // already tapped this round
    const next = { ...results, [playerId]: [...mine, rt] };
    const allTapped = players.every((p) => (next[p.player_id]?.length ?? 0) >= round);
    await supabase
      .from("rooms")
      .update({
        state: replaceGameSlot(room, GID, {
          ...state,
          results: next,
          winnerRound: state.winnerRound ?? playerId,
          status: allTapped ? "results" : "go",
        }),
      })
      .eq("id", room.id);
  };

  const reset = async () => {
    if (!isHost) return;
    await supabase
      .from("rooms")
      .update({
        state: replaceGameSlot(room, GID, {
          round: 0,
          status: "waiting",
          results: {},
          winnerRound: null,
        }),
      })
      .eq("id", room.id);
  };

  const totals = players.map((p) => ({
    p,
    total: (results[p.player_id] ?? []).reduce((a, b) => a + b, 0),
    rounds: (results[p.player_id] ?? []).length,
  }));
  const done = round >= ROUNDS && status === "results";
  const ranking = [...totals].filter((t) => t.rounds > 0).sort((a, b) => a.total - b.total);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Reaction Duel</h2>
        <p className="text-xs text-muted-foreground mt-1">Best of {ROUNDS} · lowest total wins</p>
      </div>

      {players.length < 2 ? (
        <p className="text-center text-sm text-muted-foreground">Waiting for another player…</p>
      ) : (
        <>
          <button
            onClick={tap}
            disabled={status === "waiting" || status === "results"}
            className={`w-full h-48 rounded-xl text-2xl font-bold transition-colors select-none
              ${status === "go" ? "bg-green-500 text-white" : ""}
              ${status === "armed" ? "bg-red-500 text-white" : ""}
              ${status === "waiting" ? "bg-muted text-muted-foreground" : ""}
              ${status === "results" ? "bg-card border-2 border-border text-foreground" : ""}
            `}
          >
            {status === "waiting" && "Press Start"}
            {status === "armed" && "Wait for GREEN…"}
            {status === "go" && "TAP NOW!"}
            {status === "results" && (
              <div className="text-base font-medium space-y-1">
                <div>Round {round} results</div>
                {totals.map((t) => (
                  <div key={t.p.player_id} className="text-sm">
                    {t.p.name}: {(results[t.p.player_id] ?? []).slice(-1)[0] ?? "—"}ms
                  </div>
                ))}
              </div>
            )}
          </button>

          {ranking.length > 0 && (
            <div className="text-center text-sm space-y-1">
              {ranking.map((t, i) => (
                <div key={t.p.player_id}>
                  {i + 1}. <span className="font-medium">{t.p.name}</span> — {t.total}ms total
                </div>
              ))}
            </div>
          )}

          {isHost && (
            <Button className="w-full" onClick={done ? reset : startNext} disabled={status === "armed" || status === "go"}>
              {done ? "Play Again" : round === 0 ? "Start" : `Next Round (${round}/${ROUNDS})`}
            </Button>
          )}
          {!isHost && status === "waiting" && (
            <p className="text-center text-xs text-muted-foreground">Waiting for host to start…</p>
          )}
          <p className="text-[10px] text-center text-muted-foreground/60">{now > 0 ? "" : ""}</p>
        </>
      )}
    </div>
  );
}
