import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getGameSlot, replaceGameSlot, type Room } from "./types";
import { buildMemoryDeck } from "./utils";

const GID = "memory";
const PAIRS = 8; // 16 cards

interface MemState {
  cards?: string[]; // length PAIRS*2
  flipped?: number[]; // currently revealed indices (0..2)
  matched?: number[]; // matched indices
  owner?: Record<number, string>; // matched index -> player_id
  turn?: string;
  scores?: Record<string, number>;
  lockUntil?: number; // ms epoch — host clears flipped after
}

export function MemoryMatchGame({
  room,
  playerId,
  players,
}: {
  room: Room;
  playerId: string;
  players: { player_id: string; name: string }[];
}) {
  const state = getGameSlot<MemState>(room, GID);
  const cards = state.cards;
  const flipped = state.flipped ?? [];
  const matched = state.matched ?? [];
  const scores = state.scores ?? {};
  const turn = state.turn;
  const myTurn = turn === playerId;

  // Host: when 2 cards flipped, schedule resolve
  useEffect(() => {
    if (room.host_id !== playerId) return;
    if (flipped.length !== 2 || !cards) return;
    const [a, b] = flipped;
    const isMatch = cards[a] === cards[b];
    const t = setTimeout(async () => {
      if (isMatch) {
        const newMatched = [...matched, a, b];
        const newScores = { ...scores, [turn!]: (scores[turn!] ?? 0) + 1 };
        await supabase
          .from("rooms")
          .update({
            state: replaceGameSlot(room, GID, {
              ...state,
              flipped: [],
              matched: newMatched,
              scores: newScores,
              // same player goes again on match
            }),
          })
          .eq("id", room.id);
      } else {
        const idx = players.findIndex((p) => p.player_id === turn);
        const next = players[(idx + 1) % players.length].player_id;
        await supabase
          .from("rooms")
          .update({
            state: replaceGameSlot(room, GID, { ...state, flipped: [], turn: next }),
          })
          .eq("id", room.id);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [flipped, cards, room, playerId, players, matched, scores, turn, state]);

  const flip = async (i: number) => {
    if (!cards || !myTurn) return;
    if (flipped.includes(i) || matched.includes(i) || flipped.length >= 2) return;
    await supabase
      .from("rooms")
      .update({
        state: replaceGameSlot(room, GID, { ...state, flipped: [...flipped, i] }),
      })
      .eq("id", room.id);
  };

  const reset = async () => {
    if (room.host_id !== playerId) return;
    await supabase
      .from("rooms")
      .update({
        state: replaceGameSlot(room, GID, {
          cards: buildMemoryDeck(PAIRS),
          flipped: [],
          matched: [],
          owner: {},
          scores: {},
          turn: players[0].player_id,
        }),
      })
      .eq("id", room.id);
  };

  const turnPlayer = players.find((p) => p.player_id === turn);
  const done = cards && matched.length === cards.length;
  const winner = done
    ? players
        .map((p) => ({ p, s: scores[p.player_id] ?? 0 }))
        .sort((a, b) => b.s - a.s)[0]
    : null;
  const isTie =
    done &&
    winner &&
    players.filter((p) => (scores[p.player_id] ?? 0) === winner.s).length > 1;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Memory Match</h2>
        <p className="text-xs text-muted-foreground mt-1">Find all matching pairs</p>
      </div>

      {players.length < 2 ? (
        <p className="text-center text-sm text-muted-foreground">Waiting for another player…</p>
      ) : (
        <>
          <div className="flex justify-center gap-4 text-sm">
            {players.map((p) => (
              <div
                key={p.player_id}
                className={`px-3 py-1.5 rounded-md border ${
                  turn === p.player_id ? "bg-primary text-primary-foreground border-primary" : "bg-card"
                }`}
              >
                <span className="font-medium">{p.name}</span>
                <span className="ml-2 opacity-70">{scores[p.player_id] ?? 0}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
            {(cards ?? Array(PAIRS * 2).fill("")).map((sym, i) => {
              const isFlipped = flipped.includes(i);
              const isMatched = matched.includes(i);
              const showFace = isFlipped || isMatched;
              return (
                <button
                  key={i}
                  onClick={() => flip(i)}
                  disabled={!myTurn || isMatched || isFlipped || flipped.length >= 2}
                  className={`aspect-square rounded-lg border-2 text-2xl font-bold flex items-center justify-center transition-all
                    ${showFace ? "bg-card border-primary" : "bg-primary/10 border-border"}
                    ${isMatched ? "opacity-50" : ""}
                    ${myTurn && !showFace ? "hover:border-primary cursor-pointer" : ""}
                  `}
                >
                  {showFace ? sym : ""}
                </button>
              );
            })}
          </div>

          <p className="text-center text-sm">
            {done ? (
              <span className="font-semibold">
                {isTie ? "It's a tie!" : `${winner!.p.name} wins with ${winner!.s} pairs!`}
              </span>
            ) : (
              <>
                Turn:{" "}
                <span className={`font-semibold ${myTurn ? "text-primary" : ""}`}>
                  {turnPlayer?.name} {myTurn && "(you)"}
                </span>
              </>
            )}
          </p>

          {done && room.host_id === playerId && (
            <Button className="w-full" onClick={reset}>
              Play Again
            </Button>
          )}
        </>
      )}
    </div>
  );
}
