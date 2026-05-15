import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getGameSlot, replaceGameSlot, type Room } from "./types";

const ROWS = 6;
const COLS = 7;
const GID = "c4";

type Cell = "R" | "Y" | null;
interface C4State {
  board?: Cell[]; // ROWS*COLS, row-major top->bottom
  turn?: string;
  winner?: string | null; // player_id, "draw", or null
  marks?: Record<string, "R" | "Y">;
  winLine?: number[];
}

function checkWinner(b: Cell[]): { mark: "R" | "Y" | null; line: number[] | null } {
  const idx = (r: number, c: number) => r * COLS + c;
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

export function ConnectFourGame({
  room,
  playerId,
  players,
}: {
  room: Room;
  playerId: string;
  players: { player_id: string; name: string }[];
}) {
  const state = getGameSlot<C4State>(room, GID);
  const board: Cell[] = state.board ?? Array(ROWS * COLS).fill(null);
  const marks = state.marks;
  const turn = state.turn;
  const myMark = marks?.[playerId];
  const { mark: winMark, line: winLine } = checkWinner(board);
  const isDraw = !winMark && board.every((c) => c);
  const myTurn = turn === playerId && !winMark && !isDraw;

  const drop = async (col: number) => {
    if (!myTurn || !myMark || !marks) return;
    // find lowest empty row in this column
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
    let winner: string | null = null;
    if (w.mark) winner = playerId;
    else if (next.every((c) => c)) winner = "draw";
    const other = players.find((p) => p.player_id !== playerId)?.player_id ?? playerId;
    await supabase
      .from("rooms")
      .update({
        state: replaceGameSlot(room, GID, {
          board: next,
          marks,
          turn: winner ? turn : other,
          winner,
          winLine: w.line ?? undefined,
        }),
      })
      .eq("id", room.id);
  };

  const reset = async () => {
    if (!marks) return;
    const ids = Object.keys(marks);
    const first = ids[Math.floor(Math.random() * ids.length)];
    await supabase
      .from("rooms")
      .update({
        state: replaceGameSlot(room, GID, {
          board: Array(ROWS * COLS).fill(null),
          marks,
          turn: first,
          winner: null,
        }),
      })
      .eq("id", room.id);
  };

  const winnerPlayer = winMark ? players.find((p) => marks?.[p.player_id] === winMark) : null;
  const turnPlayer = players.find((p) => p.player_id === turn);
  const persistedLine = state.winLine ?? winLine ?? undefined;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Connect Four</h2>
        {myMark && (
          <p className="text-sm text-muted-foreground mt-1">
            You are{" "}
            <span
              className={`font-semibold ${
                myMark === "R" ? "text-red-500" : "text-yellow-500"
              }`}
            >
              {myMark === "R" ? "Red" : "Yellow"}
            </span>
          </p>
        )}
      </div>

      {players.length < 2 ? (
        <p className="text-center text-sm text-muted-foreground">Waiting for another player…</p>
      ) : (
        <>
          <div className="text-center text-sm">
            {winnerPlayer ? (
              <span className="font-semibold">{winnerPlayer.name} wins!</span>
            ) : isDraw ? (
              <span className="font-semibold">Draw</span>
            ) : (
              <>
                Turn:{" "}
                <span className={`font-semibold ${myTurn ? "text-primary" : ""}`}>
                  {turnPlayer?.name ?? "—"} {myTurn && "(you)"}
                </span>
              </>
            )}
          </div>

          <div className="bg-blue-600 dark:bg-blue-700 p-2 rounded-xl mx-auto max-w-md">
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: COLS }).map((_, c) => (
                <button
                  key={c}
                  onClick={() => drop(c)}
                  disabled={!myTurn || !!board[c]}
                  className="contents"
                  aria-label={`Drop in column ${c + 1}`}
                >
                  <div className="contents">
                    {Array.from({ length: ROWS }).map((_, r) => {
                      const v = board[r * COLS + c];
                      const winning = persistedLine?.includes(r * COLS + c);
                      return (
                        <div
                          key={r}
                          className={`aspect-square rounded-full flex items-center justify-center transition-transform
                            ${v === "R" ? "bg-red-500" : v === "Y" ? "bg-yellow-400" : "bg-blue-900/40 dark:bg-blue-950/60"}
                            ${winning ? "ring-2 ring-white scale-105" : ""}
                            ${myTurn && !v && r === 0 ? "hover:bg-blue-800/50 cursor-pointer" : ""}
                          `}
                        />
                      );
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {(winMark || isDraw) && (
            <Button className="w-full" onClick={reset}>
              Play Again
            </Button>
          )}
        </>
      )}
    </div>
  );
}
