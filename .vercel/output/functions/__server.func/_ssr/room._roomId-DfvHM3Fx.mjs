import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link$1 } from "../_libs/tanstack__react-router.mjs";
import { a as getPlayerId, g as getPlayerName, b as supabase, B as Button, T as ThemeToggle, C as Card, F as Footer } from "./footer-mrOlDmwC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as Route } from "./router-Crq6Rse8.mjs";
import { H as HandMetal, a as Grid3x3, T as TableProperties, P as Puzzle, Z as Zap, C as Circle, A as ArrowLeft, W as Wifi, b as WifiOff, c as Copy, U as Users, d as Crown, e as Check, L as Link, I as Info, f as Trophy, g as Timer, S as Scissors, h as Hand } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function getGameSlot(room, gameId) {
  const state = room.state ?? {};
  return (state.games ?? {})[gameId] ?? {};
}
function replaceGameSlot(room, gameId, next) {
  const state = room.state ?? {};
  const games = { ...state.games ?? {} };
  games[gameId] = next;
  return { ...state, games };
}
const CHOICES = ["rock", "paper", "scissors"];
const ICONS = {
  rock: HandMetal,
  paper: Hand,
  scissors: Scissors
};
const LABELS = { rock: "Rock", paper: "Paper", scissors: "Scissors" };
const GID$5 = "rps";
function decide(a, b) {
  if (a === b) return "draw";
  if (a === "rock" && b === "scissors" || a === "paper" && b === "rock" || a === "scissors" && b === "paper")
    return "a";
  return "b";
}
function RpsGame({
  room,
  playerId,
  players
}) {
  const state = getGameSlot(room, GID$5);
  const picks = state.picks || {};
  const scores = state.scores || {};
  const round = state.round ?? 1;
  const myPick = picks[playerId];
  const allPicked = players.length >= 2 && players.every((p) => picks[p.player_id]);
  const [revealed, setRevealed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (allPicked) {
      const t = setTimeout(() => setRevealed(true), 400);
      return () => clearTimeout(t);
    }
    setRevealed(false);
  }, [allPicked, round]);
  const writeSlot = (next) => supabase.from("rooms").update({ state: replaceGameSlot(room, GID$5, next) }).eq("id", room.id);
  const pick = async (c) => {
    if (myPick) return;
    await writeSlot({ ...state, picks: { ...picks, [playerId]: c }, scores, round });
  };
  const nextRound = async () => {
    const newScores = { ...scores };
    if (players.length === 2) {
      const [p1, p2] = players;
      const a = picks[p1.player_id];
      const b = picks[p2.player_id];
      if (a && b) {
        const r = decide(a, b);
        if (r === "a") newScores[p1.player_id] = (newScores[p1.player_id] || 0) + 1;
        else if (r === "b") newScores[p2.player_id] = (newScores[p2.player_id] || 0) + 1;
      }
    }
    await writeSlot({ picks: {}, scores: newScores, round: round + 1 });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: [
        "Round ",
        round
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mt-1", children: "Rock · Paper · Scissors" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: players.slice(0, 2).map((p) => {
      const has = !!picks[p.player_id];
      const showVal = revealed && allPicked;
      const PickIcon = showVal ? ICONS[picks[p.player_id]] : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", children: p.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-16 flex items-center justify-center text-muted-foreground", children: PickIcon ? /* @__PURE__ */ jsxRuntimeExports.jsx(PickIcon, { className: "w-12 h-12 text-foreground", strokeWidth: 1.5 }) : has ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: "●" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl opacity-40", children: "○" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-2", children: [
          "Score: ",
          scores[p.player_id] || 0
        ] })
      ] }, p.player_id);
    }) }),
    revealed && allPicked && players.length === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-lg font-semibold", children: (() => {
      const [p1, p2] = players;
      const r = decide(picks[p1.player_id], picks[p2.player_id]);
      if (r === "draw") return "Draw!";
      const winner = r === "a" ? p1 : p2;
      return `${winner.name} wins this round`;
    })() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: CHOICES.map((c) => {
      const Icon = ICONS[c];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: myPick === c ? "default" : "outline",
          disabled: !!myPick,
          onClick: () => pick(c),
          className: "h-20 flex-col gap-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-7 h-7", strokeWidth: 1.5 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: LABELS[c] })
          ]
        },
        c
      );
    }) }),
    allPicked && revealed && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: nextRound, children: "Next Round" }),
    players.length < 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Waiting for another player…" })
  ] });
}
const GID$4 = "ttt";
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
function checkWinner$1(board) {
  for (const l of LINES) {
    const [a, b, c] = l;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { mark: board[a], line: l };
    }
  }
  return { mark: null, line: null };
}
function TicTacToeGame({
  room,
  playerId,
  players
}) {
  const state = getGameSlot(room, GID$4);
  const board = state.board ?? Array(9).fill(null);
  const marks = state.marks;
  const turn = state.turn;
  const { mark: winMark, line: winLine } = checkWinner$1(board);
  const isDraw = !winMark && board.every((c) => c);
  const myMark = marks?.[playerId];
  const myTurn = turn === playerId && !winMark && !isDraw;
  const play = async (i) => {
    if (!myTurn || board[i] || !myMark || !marks) return;
    const next = [...board];
    next[i] = myMark;
    const other = players.find((p) => p.player_id !== playerId)?.player_id ?? playerId;
    const w = checkWinner$1(next);
    let winner = null;
    if (w.mark) winner = playerId;
    else if (next.every((c) => c)) winner = "draw";
    await supabase.from("rooms").update({
      state: replaceGameSlot(room, GID$4, {
        board: next,
        marks,
        turn: winner ? turn : other,
        winner
      })
    }).eq("id", room.id);
  };
  const reset = async () => {
    if (!marks) return;
    const ids = Object.keys(marks);
    const first = ids[Math.floor(Math.random() * ids.length)];
    await supabase.from("rooms").update({
      state: replaceGameSlot(room, GID$4, {
        board: Array(9).fill(null),
        marks,
        turn: first,
        winner: null
      })
    }).eq("id", room.id);
  };
  const winnerPlayer = winMark ? players.find((p) => marks?.[p.player_id] === winMark) : null;
  const turnPlayer = players.find((p) => p.player_id === turn);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Tic Tac Toe" }),
      myMark && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
        "You are ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: myMark })
      ] })
    ] }),
    players.length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Waiting for another player…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm", children: winnerPlayer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
        winnerPlayer.name,
        " wins!"
      ] }) : isDraw ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Draw" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Turn:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${myTurn ? "text-primary" : ""}`, children: [
          turnPlayer?.name ?? "—",
          " ",
          myTurn && "(you)"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 max-w-xs mx-auto", children: board.map((cell, i) => {
        const winning = winLine?.includes(i);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => play(i),
            disabled: !myTurn || !!cell || !!winMark,
            className: `aspect-square rounded-lg border-2 text-4xl font-bold flex items-center justify-center transition-all
                    ${winning ? "bg-primary/20 border-primary scale-105" : "border-border bg-card"}
                    ${myTurn && !cell ? "hover:bg-accent cursor-pointer" : ""}
                    ${cell === "X" ? "text-primary" : ""}
                    ${cell === "O" ? "text-destructive" : ""}
                    disabled:cursor-not-allowed
                  `,
            children: cell
          },
          i
        );
      }) }),
      (winMark || isDraw) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: reset, children: "Play Again" })
    ] })
  ] });
}
const W = 600;
const H = 360;
const PADDLE_H = 70;
const PADDLE_W = 10;
const BALL_R = 7;
const PADDLE_SPEED = 6;
const WIN_SCORE = 5;
const SMOOTH = 0.25;
const GID$3 = "pong";
function PongGame({
  room,
  playerId,
  players
}) {
  const persisted = getGameSlot(room, GID$3);
  const left = players[0];
  const right = players[1];
  const side = left?.player_id === playerId ? "left" : right?.player_id === playerId ? "right" : "spectator";
  const isHost = room.host_id === playerId;
  const canvasRef = reactExports.useRef(null);
  const channelRef = reactExports.useRef(null);
  const stateRef = reactExports.useRef({
    leftY: H / 2 - PADDLE_H / 2,
    rightY: H / 2 - PADDLE_H / 2,
    ballX: W / 2,
    ballY: H / 2,
    vx: 4,
    vy: 2,
    scores: persisted.scores ?? { left: 0, right: 0 },
    winner: persisted.winner ?? null
  });
  const targetRef = reactExports.useRef({ ...stateRef.current });
  const inputsRef = reactExports.useRef({ leftDir: 0, rightDir: 0 });
  const [, force] = reactExports.useState(0);
  const [showHint, setShowHint] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4e3);
    return () => clearTimeout(t);
  }, []);
  reactExports.useEffect(() => {
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
  reactExports.useEffect(() => {
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
    const onDown = (e) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") dir.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") dir.down = true;
      sendInput();
    };
    const onUp = (e) => {
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
  const onPointerMove = (e) => {
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
  reactExports.useEffect(() => {
    let raf = 0;
    let lastBroadcast = 0;
    const tick = (t) => {
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
              winner: s.winner
            }
          });
        }
        if (s.winner) {
          supabase.from("rooms").update({ state: replaceGameSlot(room, GID$3, { scores: s.scores, winner: s.winner }) }).eq("id", room.id);
        }
      } else if (!isHost) {
        const tg = targetRef.current;
        s.leftY += (tg.leftY - s.leftY) * SMOOTH;
        s.rightY += (tg.rightY - s.rightY) * SMOOTH;
        s.ballX += (tg.ballX - s.ballX) * SMOOTH;
        s.ballY += (tg.ballY - s.ballY) * SMOOTH;
      }
      draw();
      force((n) => (n + 1) % 1e6);
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
    await supabase.from("rooms").update({ state: replaceGameSlot(room, GID$3, { scores: { left: 0, right: 0 }, winner: null }) }).eq("id", room.id);
  };
  const winner = stateRef.current.winner;
  const winnerName = winner === "left" ? left?.name : winner === "right" ? right?.name : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Pong" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
        left?.name ?? "—",
        " vs ",
        right?.name ?? "waiting…",
        " · First to ",
        WIN_SCORE
      ] })
    ] }),
    players.length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Waiting for another player…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-lg overflow-hidden border bg-black", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "canvas",
          {
            ref: canvasRef,
            width: W,
            height: H,
            onPointerMove,
            onPointerDown: onPointerMove,
            onTouchMove: (e) => e.preventDefault(),
            className: "w-full h-auto touch-none block"
          }
        ),
        showHint && side !== "spectator" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-black/70 text-white text-xs px-3 py-2 rounded-full backdrop-blur animate-pulse", children: "↕ Drag anywhere on the board to move your paddle" }) })
      ] }),
      side !== "spectator" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground", children: [
        "You are the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: side }),
        " paddle · W/S, ↑/↓, or drag"
      ] }),
      winnerName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold", children: [
          winnerName,
          " wins!"
        ] }),
        isHost && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: playAgain, className: "w-full", children: "Play Again" })
      ] })
    ] })
  ] });
}
function resetBall(s, dir) {
  s.ballX = W / 2;
  s.ballY = H / 2;
  s.vx = 4 * dir;
  s.vy = (Math.random() - 0.5) * 4;
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
const ROWS = 6;
const COLS = 7;
const GID$2 = "c4";
function checkWinner(b) {
  const idx = (r, c) => r * COLS + c;
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = b[idx(r, c)];
      if (!v) continue;
      for (const [dr, dc] of dirs) {
        const line = [idx(r, c)];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (b[idx(nr, nc)] !== v) break;
          line.push(idx(nr, nc));
        }
        if (line.length === 4) return { mark: v, line };
      }
    }
  }
  return { mark: null, line: null };
}
function ConnectFourGame({
  room,
  playerId,
  players
}) {
  const state = getGameSlot(room, GID$2);
  const board = state.board ?? Array(ROWS * COLS).fill(null);
  const marks = state.marks;
  const turn = state.turn;
  const myMark = marks?.[playerId];
  const { mark: winMark, line: winLine } = checkWinner(board);
  const isDraw = !winMark && board.every((c) => c);
  const myTurn = turn === playerId && !winMark && !isDraw;
  const drop = async (col) => {
    if (!myTurn || !myMark || !marks) return;
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r * COLS + col]) {
        row = r;
        break;
      }
    }
    if (row === -1) return;
    const next = [...board];
    next[row * COLS + col] = myMark;
    const w = checkWinner(next);
    let winner = null;
    if (w.mark) winner = playerId;
    else if (next.every((c) => c)) winner = "draw";
    const other = players.find((p) => p.player_id !== playerId)?.player_id ?? playerId;
    await supabase.from("rooms").update({
      state: replaceGameSlot(room, GID$2, {
        board: next,
        marks,
        turn: winner ? turn : other,
        winner,
        winLine: w.line ?? void 0
      })
    }).eq("id", room.id);
  };
  const reset = async () => {
    if (!marks) return;
    const ids = Object.keys(marks);
    const first = ids[Math.floor(Math.random() * ids.length)];
    await supabase.from("rooms").update({
      state: replaceGameSlot(room, GID$2, {
        board: Array(ROWS * COLS).fill(null),
        marks,
        turn: first,
        winner: null
      })
    }).eq("id", room.id);
  };
  const winnerPlayer = winMark ? players.find((p) => marks?.[p.player_id] === winMark) : null;
  const turnPlayer = players.find((p) => p.player_id === turn);
  const persistedLine = state.winLine ?? winLine ?? void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Connect Four" }),
      myMark && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
        "You are",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `font-semibold ${myMark === "R" ? "text-red-500" : "text-yellow-500"}`,
            children: myMark === "R" ? "Red" : "Yellow"
          }
        )
      ] })
    ] }),
    players.length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Waiting for another player…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm", children: winnerPlayer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
        winnerPlayer.name,
        " wins!"
      ] }) : isDraw ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Draw" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Turn:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${myTurn ? "text-primary" : ""}`, children: [
          turnPlayer?.name ?? "—",
          " ",
          myTurn && "(you)"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-600 dark:bg-blue-700 p-2 rounded-xl mx-auto max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1.5", children: Array.from({ length: COLS }).map((_, c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => drop(c),
          disabled: !myTurn || !!board[c],
          className: "contents",
          "aria-label": `Drop in column ${c + 1}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "contents", children: Array.from({ length: ROWS }).map((_2, r) => {
            const v = board[r * COLS + c];
            const winning = persistedLine?.includes(r * COLS + c);
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `aspect-square rounded-full flex items-center justify-center transition-transform
                            ${v === "R" ? "bg-red-500" : v === "Y" ? "bg-yellow-400" : "bg-blue-900/40 dark:bg-blue-950/60"}
                            ${winning ? "ring-2 ring-white scale-105" : ""}
                            ${myTurn && !v && r === 0 ? "hover:bg-blue-800/50 cursor-pointer" : ""}
                          `
              },
              r
            );
          }) })
        },
        c
      )) }) }),
      (winMark || isDraw) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: reset, children: "Play Again" })
    ] })
  ] });
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const SYMBOLS = ["★", "●", "▲", "■", "♥", "♦", "♣", "♠", "◆", "◉"];
function buildMemoryDeck(pairs) {
  const syms = SYMBOLS.slice(0, pairs);
  return shuffle([...syms, ...syms]);
}
function getInitialGameState(gameId, playerIds) {
  const [p1, p2] = playerIds;
  switch (gameId) {
    case "rps":
      return { picks: {}, scores: {}, round: 1 };
    case "ttt":
      return {
        board: Array(9).fill(null),
        marks: { [p1]: "X", [p2]: "O" },
        turn: p1,
        winner: null
      };
    case "c4":
      return {
        board: Array(42).fill(null),
        marks: { [p1]: "R", [p2]: "Y" },
        turn: p1,
        winner: null
      };
    case "memory":
      return {
        cards: buildMemoryDeck(8),
        flipped: [],
        matched: [],
        owner: {},
        scores: {},
        turn: p1
      };
    case "reaction":
      return { round: 0, status: "waiting", results: {}, winnerRound: null };
    case "pong":
      return { scores: { left: 0, right: 0 }, winner: null };
    default:
      return {};
  }
}
const GID$1 = "memory";
const PAIRS = 8;
function MemoryMatchGame({
  room,
  playerId,
  players
}) {
  const state = getGameSlot(room, GID$1);
  const cards = state.cards;
  const flipped = state.flipped ?? [];
  const matched = state.matched ?? [];
  const scores = state.scores ?? {};
  const turn = state.turn;
  const myTurn = turn === playerId;
  reactExports.useEffect(() => {
    if (room.host_id !== playerId) return;
    if (flipped.length !== 2 || !cards) return;
    const [a, b] = flipped;
    const isMatch = cards[a] === cards[b];
    const t = setTimeout(async () => {
      if (isMatch) {
        const newMatched = [...matched, a, b];
        const newScores = { ...scores, [turn]: (scores[turn] ?? 0) + 1 };
        await supabase.from("rooms").update({
          state: replaceGameSlot(room, GID$1, {
            ...state,
            flipped: [],
            matched: newMatched,
            scores: newScores
            // same player goes again on match
          })
        }).eq("id", room.id);
      } else {
        const idx = players.findIndex((p) => p.player_id === turn);
        const next = players[(idx + 1) % players.length].player_id;
        await supabase.from("rooms").update({
          state: replaceGameSlot(room, GID$1, { ...state, flipped: [], turn: next })
        }).eq("id", room.id);
      }
    }, 1e3);
    return () => clearTimeout(t);
  }, [flipped, cards, room, playerId, players, matched, scores, turn, state]);
  const flip = async (i) => {
    if (!cards || !myTurn) return;
    if (flipped.includes(i) || matched.includes(i) || flipped.length >= 2) return;
    await supabase.from("rooms").update({
      state: replaceGameSlot(room, GID$1, { ...state, flipped: [...flipped, i] })
    }).eq("id", room.id);
  };
  const reset = async () => {
    if (room.host_id !== playerId) return;
    await supabase.from("rooms").update({
      state: replaceGameSlot(room, GID$1, {
        cards: buildMemoryDeck(PAIRS),
        flipped: [],
        matched: [],
        owner: {},
        scores: {},
        turn: players[0].player_id
      })
    }).eq("id", room.id);
  };
  const turnPlayer = players.find((p) => p.player_id === turn);
  const done = cards && matched.length === cards.length;
  const winner = done ? players.map((p) => ({ p, s: scores[p.player_id] ?? 0 })).sort((a, b) => b.s - a.s)[0] : null;
  const isTie = done && winner && players.filter((p) => (scores[p.player_id] ?? 0) === winner.s).length > 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Memory Match" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Find all matching pairs" })
    ] }),
    players.length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Waiting for another player…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-4 text-sm", children: players.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `px-3 py-1.5 rounded-md border ${turn === p.player_id ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 opacity-70", children: scores[p.player_id] ?? 0 })
          ]
        },
        p.player_id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2 max-w-sm mx-auto", children: (cards ?? Array(PAIRS * 2).fill("")).map((sym, i) => {
        const isFlipped = flipped.includes(i);
        const isMatched = matched.includes(i);
        const showFace = isFlipped || isMatched;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => flip(i),
            disabled: !myTurn || isMatched || isFlipped || flipped.length >= 2,
            className: `aspect-square rounded-lg border-2 text-2xl font-bold flex items-center justify-center transition-all
                    ${showFace ? "bg-card border-primary" : "bg-primary/10 border-border"}
                    ${isMatched ? "opacity-50" : ""}
                    ${myTurn && !showFace ? "hover:border-primary cursor-pointer" : ""}
                  `,
            children: showFace ? sym : ""
          },
          i
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm", children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: isTie ? "It's a tie!" : `${winner.p.name} wins with ${winner.s} pairs!` }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Turn:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${myTurn ? "text-primary" : ""}`, children: [
          turnPlayer?.name,
          " ",
          myTurn && "(you)"
        ] })
      ] }) }),
      done && room.host_id === playerId && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: reset, children: "Play Again" })
    ] })
  ] });
}
const GID = "reaction";
const ROUNDS = 5;
function ReactionDuelGame({
  room,
  playerId,
  players
}) {
  const state = getGameSlot(room, GID);
  const round = state.round ?? 0;
  const status = state.status ?? "waiting";
  const results = state.results ?? {};
  const isHost = room.host_id === playerId;
  const [now, setNow] = reactExports.useState(Date.now());
  reactExports.useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(i);
  }, []);
  const startNext = async () => {
    if (!isHost) return;
    const delay = 1500 + Math.random() * 3e3;
    const startAt = Date.now() + delay;
    await supabase.from("rooms").update({
      state: replaceGameSlot(room, GID, {
        ...state,
        round: round + 1,
        startAt,
        status: "armed",
        winnerRound: null
      })
    }).eq("id", room.id);
  };
  reactExports.useEffect(() => {
    if (!isHost || status !== "armed" || !state.startAt) return;
    const ms = state.startAt - Date.now();
    const t = setTimeout(async () => {
      await supabase.from("rooms").update({ state: replaceGameSlot(room, GID, { ...state, status: "go" }) }).eq("id", room.id);
    }, Math.max(0, ms));
    return () => clearTimeout(t);
  }, [isHost, status, state, room]);
  const tap = async () => {
    if (status === "armed") {
      const mine2 = results[playerId] ?? [];
      await supabase.from("rooms").update({
        state: replaceGameSlot(room, GID, {
          ...state,
          results: { ...results, [playerId]: [...mine2, 1e3] },
          status: "results",
          winnerRound: state.winnerRound ?? null
        })
      }).eq("id", room.id);
      return;
    }
    if (status !== "go" || !state.startAt) return;
    const rt = Date.now() - state.startAt;
    const mine = results[playerId] ?? [];
    if (mine.length >= round) return;
    const next = { ...results, [playerId]: [...mine, rt] };
    const allTapped = players.every((p) => (next[p.player_id]?.length ?? 0) >= round);
    await supabase.from("rooms").update({
      state: replaceGameSlot(room, GID, {
        ...state,
        results: next,
        winnerRound: state.winnerRound ?? playerId,
        status: allTapped ? "results" : "go"
      })
    }).eq("id", room.id);
  };
  const reset = async () => {
    if (!isHost) return;
    await supabase.from("rooms").update({
      state: replaceGameSlot(room, GID, {
        round: 0,
        status: "waiting",
        results: {},
        winnerRound: null
      })
    }).eq("id", room.id);
  };
  const totals = players.map((p) => ({
    p,
    total: (results[p.player_id] ?? []).reduce((a, b) => a + b, 0),
    rounds: (results[p.player_id] ?? []).length
  }));
  const done = round >= ROUNDS && status === "results";
  const ranking = [...totals].filter((t) => t.rounds > 0).sort((a, b) => a.total - b.total);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Reaction Duel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
        "Best of ",
        ROUNDS,
        " · lowest total wins"
      ] })
    ] }),
    players.length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Waiting for another player…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: tap,
          disabled: status === "waiting" || status === "results",
          className: `w-full h-48 rounded-xl text-2xl font-bold transition-colors select-none
              ${status === "go" ? "bg-green-500 text-white" : ""}
              ${status === "armed" ? "bg-red-500 text-white" : ""}
              ${status === "waiting" ? "bg-muted text-muted-foreground" : ""}
              ${status === "results" ? "bg-card border-2 border-border text-foreground" : ""}
            `,
          children: [
            status === "waiting" && "Press Start",
            status === "armed" && "Wait for GREEN…",
            status === "go" && "TAP NOW!",
            status === "results" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-medium space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                "Round ",
                round,
                " results"
              ] }),
              totals.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
                t.p.name,
                ": ",
                (results[t.p.player_id] ?? []).slice(-1)[0] ?? "—",
                "ms"
              ] }, t.p.player_id))
            ] })
          ]
        }
      ),
      ranking.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm space-y-1", children: ranking.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        i + 1,
        ". ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t.p.name }),
        " — ",
        t.total,
        "ms total"
      ] }, t.p.player_id)) }),
      isHost && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: done ? reset : startNext, disabled: status === "armed" || status === "go", children: done ? "Play Again" : round === 0 ? "Start" : `Next Round (${round}/${ROUNDS})` }),
      !isHost && status === "waiting" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground", children: "Waiting for host to start…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-center text-muted-foreground/60", children: now > 0 ? "" : "" })
    ] })
  ] });
}
const GAMES = [{
  id: "rps",
  name: "Rock Paper Scissors",
  icon: HandMetal,
  minPlayers: 2,
  maxPlayers: 2,
  description: "Classic best-of duel.",
  howTo: "Both players secretly pick Rock, Paper, or Scissors. Rock crushes Scissors, Scissors cuts Paper, Paper covers Rock. First to break the tie scores the round."
}, {
  id: "ttt",
  name: "Tic Tac Toe",
  icon: Grid3x3,
  minPlayers: 2,
  maxPlayers: 2,
  description: "Three in a row wins.",
  howTo: "Take turns placing your mark on a 3×3 grid. First to align three of your marks horizontally, vertically, or diagonally wins."
}, {
  id: "c4",
  name: "Connect Four",
  icon: TableProperties,
  minPlayers: 2,
  maxPlayers: 2,
  description: "Drop discs, get four in a row.",
  howTo: "Take turns dropping a coloured disc into a column. The disc falls to the lowest empty slot. First to line up four of their colour — horizontally, vertically, or diagonally — wins."
}, {
  id: "memory",
  name: "Memory Match",
  icon: Puzzle,
  minPlayers: 2,
  maxPlayers: 4,
  description: "Find matching pairs.",
  howTo: "Cards are face-down. On your turn flip two cards. If they match, you score a point and go again. If not, they flip back and the next player goes. Most pairs at the end wins."
}, {
  id: "reaction",
  name: "Reaction Duel",
  icon: Zap,
  minPlayers: 2,
  maxPlayers: 4,
  description: "Tap fastest when it goes green.",
  howTo: "Wait for the screen to turn green, then tap as fast as you can. Tap too early and you get a 1-second penalty. Lowest total time across 5 rounds wins."
}, {
  id: "pong",
  name: "Pong",
  icon: Circle,
  minPlayers: 2,
  maxPlayers: 2,
  description: "Real-time paddle classic.",
  howTo: "Move your paddle up and down to bounce the ball back. Use W/S, arrow keys, or drag on touch devices. First to 5 points wins."
}];
const HEARTBEAT_MS = 5e3;
const STALE_MS = 15e3;
function RoomPage() {
  const {
    roomId
  } = Route.useParams();
  const navigate = useNavigate();
  const [playerId, setPlayerId] = reactExports.useState("");
  const [room, setRoom] = reactExports.useState(null);
  const [players, setPlayers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [connected, setConnected] = reactExports.useState(true);
  const [showInfo, setShowInfo] = reactExports.useState(false);
  const heartbeatRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const pid = getPlayerId();
    setPlayerId(pid);
    if (!getPlayerName()) {
      navigate({
        to: "/"
      });
      return;
    }
    let active = true;
    const load = async () => {
      const [r, p] = await Promise.all([supabase.from("rooms").select("*").eq("id", roomId).maybeSingle(), supabase.from("room_players").select("*").eq("room_id", roomId).order("joined_at")]);
      if (!active) return;
      if (!r.data) {
        toast.error("Room not found");
        navigate({
          to: "/"
        });
        return;
      }
      setRoom(r.data);
      setPlayers(p.data ?? []);
      setLoading(false);
    };
    load();
    const ch = supabase.channel(`room:${roomId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "rooms",
      filter: `id=eq.${roomId}`
    }, (payload) => {
      if (payload.eventType === "DELETE") {
        navigate({
          to: "/"
        });
        return;
      }
      setRoom(payload.new);
    }).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "room_players",
      filter: `room_id=eq.${roomId}`
    }, async () => {
      const {
        data
      } = await supabase.from("room_players").select("*").eq("room_id", roomId).order("joined_at");
      setPlayers(data ?? []);
    }).subscribe((status) => {
      setConnected(status === "SUBSCRIBED");
    });
    const beat = async () => {
      await supabase.from("room_players").update({
        last_seen: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("room_id", roomId).eq("player_id", pid);
    };
    beat();
    heartbeatRef.current = setInterval(beat, HEARTBEAT_MS);
    const cleanup = () => {
      try {
        navigator.sendBeacon?.(`${"https://dqrndzpaplbyrqxrjqea.supabase.co"}/rest/v1/room_players?room_id=eq.${roomId}&player_id=eq.${pid}`, new Blob([], {
          type: "application/json"
        }));
      } catch {
      }
      supabase.from("room_players").delete().eq("room_id", roomId).eq("player_id", pid);
    };
    window.addEventListener("beforeunload", cleanup);
    return () => {
      active = false;
      window.removeEventListener("beforeunload", cleanup);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      supabase.removeChannel(ch);
    };
  }, [roomId, navigate]);
  reactExports.useEffect(() => {
    if (!room || room.host_id !== playerId) return;
    const sweep = async () => {
      const cutoff = new Date(Date.now() - STALE_MS).toISOString();
      await supabase.from("room_players").delete().eq("room_id", roomId).lt("last_seen", cutoff);
    };
    const i = setInterval(sweep, HEARTBEAT_MS);
    return () => clearInterval(i);
  }, [room, playerId, roomId]);
  const isHost = room?.host_id === playerId;
  const me = players.find((p) => p.player_id === playerId);
  const allReady = players.length >= 2 && players.every((p) => p.ready);
  const toggleReady = async () => {
    if (!me) return;
    await supabase.from("room_players").update({
      ready: !me.ready
    }).eq("room_id", roomId).eq("player_id", playerId);
  };
  const startGame = async (game) => {
    if (!allReady) {
      toast.error("All players must be ready");
      return;
    }
    const playerIds = players.map((p) => p.player_id);
    const initialState = getInitialGameState(game, playerIds);
    await supabase.from("rooms").update({
      game,
      status: "playing",
      state: replaceGameSlot(room, game, initialState)
    }).eq("id", roomId);
  };
  const backToLobby = async () => {
    await supabase.from("rooms").update({
      game: null,
      status: "lobby"
    }).eq("id", roomId);
    await supabase.from("room_players").update({
      ready: false
    }).eq("room_id", roomId);
  };
  const leave = async () => {
    await supabase.from("room_players").delete().eq("room_id", roomId).eq("player_id", playerId);
    navigate({
      to: "/"
    });
  };
  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room code copied");
  };
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Invite link copied");
  };
  if (loading || !room) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading room…" }) });
  }
  const playerList = players.map((p) => ({
    player_id: p.player_id,
    name: p.name
  }));
  const currentMeta = GAMES.find((g) => g.id === room.game);
  const playable = GAMES.filter((g) => players.length >= g.minPlayers && players.length <= g.maxPlayers);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen bg-gradient-to-br from-background via-background to-accent/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: leave, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
        "Leave"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center gap-1 text-xs text-muted-foreground", title: connected ? "Connected" : "Reconnecting…", children: connected ? /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "w-3.5 h-3.5 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "w-3.5 h-3.5 text-destructive animate-pulse" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: copyCode, className: "flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border hover:bg-accent transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold tracking-widest text-sm", children: roomId }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3.5 h-3.5 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4" }),
          "Players (",
          players.length,
          ")"
        ] }),
        room.status === "lobby" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          players.filter((p) => p.ready).length,
          "/",
          players.length,
          " ready"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: players.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
        p.player_id === room.host_id && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-3.5 h-3.5 text-amber-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium flex-1 truncate", children: p.name }),
        p.player_id === playerId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(you)" }),
        room.status === "lobby" && (p.ready ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5" }),
          " Ready"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Not ready" }))
      ] }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-5", children: room.status === "lobby" || !room.game ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: isHost ? "Choose a game" : "Waiting for host…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: players.length < 2 ? "Share the code so a friend can join" : allReady ? "Everyone's ready!" : "Mark yourself ready when you're set" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: me?.ready ? "default" : "outline", className: "w-full h-11", onClick: toggleReady, disabled: !me, children: me?.ready ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }),
        " Ready"
      ] }) : "I'm Ready" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: GAMES.map((g) => {
        const Icon = g.icon;
        const canPlay = playable.some((pg) => pg.id === g.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: !isHost || !allReady || !canPlay, onClick: () => startGame(g.id), className: "group flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: g.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: g.minPlayers === g.maxPlayers ? `${g.minPlayers}P` : `${g.minPlayers}–${g.maxPlayers}P` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 line-clamp-2", children: g.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground/80 mt-1.5 leading-snug", children: g.howTo })
          ] })
        ] }, g.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "w-full", onClick: copyLink, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "w-3.5 h-3.5" }),
        " Copy invite link"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          currentMeta && /* @__PURE__ */ jsxRuntimeExports.jsx(currentMeta.icon, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: currentMeta?.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowInfo((v) => !v), className: "text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5" }),
          " How to play"
        ] })
      ] }),
      showInfo && currentMeta && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs bg-muted/50 border rounded-md p-3 text-muted-foreground leading-relaxed", children: currentMeta.howTo }),
      room.game === "rps" && /* @__PURE__ */ jsxRuntimeExports.jsx(RpsGame, { room, playerId, players: playerList }),
      room.game === "ttt" && /* @__PURE__ */ jsxRuntimeExports.jsx(TicTacToeGame, { room, playerId, players: playerList }),
      room.game === "c4" && /* @__PURE__ */ jsxRuntimeExports.jsx(ConnectFourGame, { room, playerId, players: playerList }),
      room.game === "memory" && /* @__PURE__ */ jsxRuntimeExports.jsx(MemoryMatchGame, { room, playerId, players: playerList }),
      room.game === "reaction" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReactionDuelGame, { room, playerId, players: playerList }),
      room.game === "pong" && /* @__PURE__ */ jsxRuntimeExports.jsx(PongGame, { room, playerId, players: playerList }),
      isHost && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "w-full", onClick: backToLobby, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-3.5 h-3.5" }),
        " Back to game selection (progress saved)"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link$1, { to: "/", className: "hover:underline inline-flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "w-3 h-3" }),
      " Mini Games"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] }) });
}
export {
  RoomPage as component
};
