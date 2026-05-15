import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getGameSlot, replaceGameSlot, type Room } from "./types";

type Cell = "X" | "O" | null;
interface TttState {
  board?: Cell[];
  turn?: string;
  winner?: string | null;
  marks?: Record<string, "X" | "O">;
}

const GID = "ttt";
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: Cell[]): { mark: "X" | "O" | null; line: number[] | null } {
  for (const l of LINES) {
    const [a, b, c] = l;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { mark: board[a], line: l };
    }
  }
  return { mark: null, line: null };
}

export function TicTacToeGame({
  room,
  playerId,
  players,
}: {
  room: Room;
  playerId: string;
  players: { player_id: string; name: string }[];
}) {
  const state = getGameSlot<TttState>(room, GID);
  const board = state.board ?? Array(9).fill(null);
  const marks = state.marks;
  const turn = state.turn;

  const { mark: winMark, line: winLine } = checkWinner(board);
  const isDraw = !winMark && board.every((c) => c);
  const myMark = marks?.[playerId];
  const myTurn = turn === playerId && !winMark && !isDraw;

  const play = async (i: number) => {
    if (!myTurn || board[i] || !myMark || !marks) return;
    const next = [...board];
    next[i] = myMark;
    const other = players.find((p) => p.player_id !== playerId)?.player_id ?? playerId;
    const w = checkWinner(next);
    let winner: string | null = null;
    if (w.mark) winner = playerId;
    else if (next.every((c) => c)) winner = "draw";
    await supabase
      .from("rooms")
      .update({
        state: replaceGameSlot(room, GID, {
          board: next,
          marks,
          turn: winner ? turn : other,
          winner,
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
          board: Array(9).fill(null),
          marks,
          turn: first,
          winner: null,
        }),
      })
      .eq("id", room.id);
  };

  const winnerPlayer = winMark ? players.find((p) => marks?.[p.player_id] === winMark) : null;
  const turnPlayer = players.find((p) => p.player_id === turn);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Tic Tac Toe</h2>
        {myMark && (
          <p className="text-sm text-muted-foreground mt-1">
            You are <span className="font-semibold text-foreground">{myMark}</span>
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

          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {board.map((cell, i) => {
              const winning = winLine?.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => play(i)}
                  disabled={!myTurn || !!cell || !!winMark}
                  className={`aspect-square rounded-lg border-2 text-4xl font-bold flex items-center justify-center transition-all
                    ${winning ? "bg-primary/20 border-primary scale-105" : "border-border bg-card"}
                    ${myTurn && !cell ? "hover:bg-accent cursor-pointer" : ""}
                    ${cell === "X" ? "text-primary" : ""}
                    ${cell === "O" ? "text-destructive" : ""}
                    disabled:cursor-not-allowed
                  `}
                >
                  {cell}
                </button>
              );
            })}
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
