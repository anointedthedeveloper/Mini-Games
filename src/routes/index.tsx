import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { generateRoomId, getPlayerId, getPlayerName, setPlayerName } from "@/lib/player";
import { toast } from "sonner";
import {
  Circle,
  Gamepad2,
  Grid3x3,
  HandMetal,
  Puzzle,
  TableProperties,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mini Games — Real-time Multiplayer Party Hub" },
      {
        name: "description",
        content:
          "Play Rock Paper Scissors, Tic Tac Toe, Connect Four, Memory Match, Reaction Duel, and Pong with friends in real time. No signup required.",
      },
      { property: "og:title", content: "Mini Games — Real-time Multiplayer Party Hub" },
      {
        property: "og:description",
        content: "Six instant party games. Create a room, share the code, play.",
      },
    ],
  }),
  component: Home,
});

const PREVIEW_GAMES = [
  { name: "Rock Paper Scissors", icon: HandMetal },
  { name: "Tic Tac Toe", icon: Grid3x3 },
  { name: "Connect Four", icon: TableProperties },
  { name: "Memory Match", icon: Puzzle },
  { name: "Reaction Duel", icon: Zap },
  { name: "Pong", icon: Circle },
];

function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(getPlayerName());
    getPlayerId();
  }, []);

  const persistName = (n: string) => {
    setName(n);
    setPlayerName(n);
  };

  const createRoom = async () => {
    if (!name.trim()) return toast.error("Enter your name first");
    setBusy(true);
    const playerId = getPlayerId();
    const id = generateRoomId();
    const { error } = await supabase.from("rooms").insert({
      id,
      host_id: playerId,
      status: "lobby",
      state: {},
    });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    await supabase.from("room_players").insert({
      room_id: id,
      player_id: playerId,
      name: name.trim(),
    });
    navigate({ to: "/room/$roomId", params: { roomId: id } });
  };

  const joinRoom = async () => {
    if (!name.trim()) return toast.error("Enter your name first");
    const code = roomCode.trim().toUpperCase();
    if (!code) return toast.error("Enter a room code");
    setBusy(true);
    const playerId = getPlayerId();
    const { data: room } = await supabase.from("rooms").select("id").eq("id", code).maybeSingle();
    if (!room) {
      setBusy(false);
      return toast.error("Room not found");
    }
    await supabase
      .from("room_players")
      .upsert(
        { room_id: code, player_id: playerId, name: name.trim(), ready: false },
        { onConflict: "room_id,player_id" },
      );
    navigate({ to: "/room/$roomId", params: { roomId: code } });
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/30">
      <div className="absolute top-3 right-3">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-4">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Mini Games</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time multiplayer. No signup. Six games.
            </p>
          </header>

          <Card className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your name</label>
              <Input
                placeholder="e.g. Anointed"
                value={name}
                maxLength={20}
                onChange={(e) => persistName(e.target.value)}
              />
            </div>

            <Button className="w-full h-11" disabled={busy} onClick={createRoom}>
              Create Room
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or join</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="ROOM CODE"
                value={roomCode}
                maxLength={6}
                className="uppercase tracking-widest font-mono"
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              />
              <Button variant="secondary" disabled={busy} onClick={joinRoom}>
                Join
              </Button>
            </div>
          </Card>

          <div className="mt-8 grid grid-cols-3 gap-2">
            {PREVIEW_GAMES.map((g) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.name}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-card/50 border text-center"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground leading-tight">{g.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
