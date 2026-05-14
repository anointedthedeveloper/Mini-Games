import { useEffect, useState } from "react";
import { Hand, HandMetal, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getGameSlot, replaceGameSlot, type Room } from "./types";

type Choice = "rock" | "paper" | "scissors";
const CHOICES: Choice[] = ["rock", "paper", "scissors"];
const ICONS: Record<Choice, typeof Hand> = {
  rock: HandMetal,
  paper: Hand,
  scissors: Scissors,
};
const LABELS: Record<Choice, string> = { rock: "Rock", paper: "Paper", scissors: "Scissors" };

interface RpsState {
  picks?: Record<string, Choice>;
  scores?: Record<string, number>;
  round?: number;
}

const GID = "rps";

function decide(a: Choice, b: Choice): "a" | "b" | "draw" {
  if (a === b) return "draw";
  if (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  )
    return "a";
  return "b";
}

export function RpsGame({
  room,
  playerId,
  players,
}: {
  room: Room;
  playerId: string;
  players: { player_id: string; name: string }[];
}) {
  const state = getGameSlot<RpsState>(room, GID);
  const picks = state.picks || {};
  const scores = state.scores || {};
  const round = state.round ?? 1;
  const myPick = picks[playerId];
  const allPicked = players.length >= 2 && players.every((p) => picks[p.player_id]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (allPicked) {
      const t = setTimeout(() => setRevealed(true), 400);
      return () => clearTimeout(t);
    }
    setRevealed(false);
  }, [allPicked, round]);

  const writeSlot = (next: RpsState) =>
    supabase.from("rooms").update({ state: replaceGameSlot(room, GID, next) }).eq("id", room.id);

  const pick = async (c: Choice) => {
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Round {round}</div>
        <h2 className="text-2xl font-bold mt-1">Rock · Paper · Scissors</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {players.slice(0, 2).map((p) => {
          const has = !!picks[p.player_id];
          const showVal = revealed && allPicked;
          const PickIcon = showVal ? ICONS[picks[p.player_id]!] : null;
          return (
            <Card key={p.player_id} className="p-4 text-center">
              <div className="text-sm font-medium truncate">{p.name}</div>
              <div className="mt-3 h-16 flex items-center justify-center text-muted-foreground">
                {PickIcon ? (
                  <PickIcon className="w-12 h-12 text-foreground" strokeWidth={1.5} />
                ) : has ? (
                  <span className="text-3xl">●</span>
                ) : (
                  <span className="text-3xl opacity-40">○</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-2">Score: {scores[p.player_id] || 0}</div>
            </Card>
          );
        })}
      </div>

      {revealed && allPicked && players.length === 2 && (
        <div className="text-center text-lg font-semibold">
          {(() => {
            const [p1, p2] = players;
            const r = decide(picks[p1.player_id]!, picks[p2.player_id]!);
            if (r === "draw") return "Draw!";
            const winner = r === "a" ? p1 : p2;
            return `${winner.name} wins this round`;
          })()}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {CHOICES.map((c) => {
          const Icon = ICONS[c];
          return (
            <Button
              key={c}
              variant={myPick === c ? "default" : "outline"}
              disabled={!!myPick}
              onClick={() => pick(c)}
              className="h-20 flex-col gap-1"
            >
              <Icon className="w-7 h-7" strokeWidth={1.5} />
              <span className="text-xs">{LABELS[c]}</span>
            </Button>
          );
        })}
      </div>

      {allPicked && revealed && (
        <Button className="w-full" onClick={nextRound}>
          Next Round
        </Button>
      )}

      {players.length < 2 && (
        <p className="text-center text-sm text-muted-foreground">Waiting for another player…</p>
      )}
    </div>
  );
}
