import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPlayerId, getPlayerName } from "@/lib/player";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Circle,
  Copy,
  Crown,
  Grid3x3,
  HandMetal,
  Info,
  Link as LinkIcon,
  Puzzle,
  TableProperties,
  Timer,
  Trophy,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import type { GameMeta, Room, RoomPlayer } from "@/components/games/types";
import { RpsGame } from "@/components/games/RpsGame";
import { TicTacToeGame } from "@/components/games/TicTacToeGame";
import { PongGame } from "@/components/games/PongGame";
import { ConnectFourGame } from "@/components/games/ConnectFourGame";
import { MemoryMatchGame } from "@/components/games/MemoryMatchGame";
import { ReactionDuelGame } from "@/components/games/ReactionDuelGame";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";
import { getInitialGameState } from "@/components/games/utils";
import { replaceGameSlot } from "@/components/games/types";

export const Route = createFileRoute("/room/$roomId")({
  component: RoomPage,
});

const GAMES: GameMeta[] = [
  {
    id: "rps",
    name: "Rock Paper Scissors",
    icon: HandMetal,
    minPlayers: 2,
    maxPlayers: 2,
    description: "Classic best-of duel.",
    howTo: "Both players secretly pick Rock, Paper, or Scissors. Rock crushes Scissors, Scissors cuts Paper, Paper covers Rock. First to break the tie scores the round.",
  },
  {
    id: "ttt",
    name: "Tic Tac Toe",
    icon: Grid3x3,
    minPlayers: 2,
    maxPlayers: 2,
    description: "Three in a row wins.",
    howTo: "Take turns placing your mark on a 3×3 grid. First to align three of your marks horizontally, vertically, or diagonally wins.",
  },
  {
    id: "c4",
    name: "Connect Four",
    icon: TableProperties,
    minPlayers: 2,
    maxPlayers: 2,
    description: "Drop discs, get four in a row.",
    howTo: "Take turns dropping a coloured disc into a column. The disc falls to the lowest empty slot. First to line up four of their colour — horizontally, vertically, or diagonally — wins.",
  },
  {
    id: "memory",
    name: "Memory Match",
    icon: Puzzle,
    minPlayers: 2,
    maxPlayers: 4,
    description: "Find matching pairs.",
    howTo: "Cards are face-down. On your turn flip two cards. If they match, you score a point and go again. If not, they flip back and the next player goes. Most pairs at the end wins.",
  },
  {
    id: "reaction",
    name: "Reaction Duel",
    icon: Zap,
    minPlayers: 2,
    maxPlayers: 4,
    description: "Tap fastest when it goes green.",
    howTo: "Wait for the screen to turn green, then tap as fast as you can. Tap too early and you get a 1-second penalty. Lowest total time across 5 rounds wins.",
  },
  {
    id: "pong",
    name: "Pong",
    icon: Circle,
    minPlayers: 2,
    maxPlayers: 2,
    description: "Real-time paddle classic.",
    howTo: "Move your paddle up and down to bounce the ball back. Use W/S, arrow keys, or drag on touch devices. First to 5 points wins.",
  },
];

const HEARTBEAT_MS = 5000;
const STALE_MS = 15000;

function RoomPage() {
  const { roomId } = Route.useParams();
  const navigate = useNavigate();
  const [playerId, setPlayerId] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const pid = getPlayerId();
    setPlayerId(pid);

    if (!getPlayerName()) {
      navigate({ to: "/" });
      return;
    }

    let active = true;
    const load = async () => {
      const [r, p] = await Promise.all([
        supabase.from("rooms").select("*").eq("id", roomId).maybeSingle(),
        supabase.from("room_players").select("*").eq("room_id", roomId).order("joined_at"),
      ]);
      if (!active) return;
      if (!r.data) {
        toast.error("Room not found");
        navigate({ to: "/" });
        return;
      }
      setRoom(r.data);
      setPlayers(p.data ?? []);
      setLoading(false);
    };
    load();

    const ch = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            navigate({ to: "/" });
            return;
          }
          setRoom(payload.new as Room);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
        async () => {
          const { data } = await supabase
            .from("room_players")
            .select("*")
            .eq("room_id", roomId)
            .order("joined_at");
          setPlayers(data ?? []);
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    // Heartbeat: update last_seen so others know we're alive
    const beat = async () => {
      await supabase
        .from("room_players")
        .update({ last_seen: new Date().toISOString() })
        .eq("room_id", roomId)
        .eq("player_id", pid);
    };
    beat();
    heartbeatRef.current = setInterval(beat, HEARTBEAT_MS);

    // Cleanup own row on unload
    const cleanup = () => {
      try {
        navigator.sendBeacon?.(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/room_players?room_id=eq.${roomId}&player_id=eq.${pid}`,
          new Blob([], { type: "application/json" }),
        );
      } catch {
        /* noop */
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

  // Host sweeps stale players
  useEffect(() => {
    if (!room || room.host_id !== playerId) return;
    const sweep = async () => {
      const cutoff = new Date(Date.now() - STALE_MS).toISOString();
      await supabase
        .from("room_players")
        .delete()
        .eq("room_id", roomId)
        .lt("last_seen", cutoff);
    };
    const i = setInterval(sweep, HEARTBEAT_MS);
    return () => clearInterval(i);
  }, [room, playerId, roomId]);

  const isHost = room?.host_id === playerId;
  const me = players.find((p) => p.player_id === playerId);
  const allReady = players.length >= 2 && players.every((p) => p.ready);

  const toggleReady = async () => {
    if (!me) return;
    await supabase
      .from("room_players")
      .update({ ready: !me.ready })
      .eq("room_id", roomId)
      .eq("player_id", playerId);
  };

  const startGame = async (game: string) => {
    if (!allReady) {
      toast.error("All players must be ready");
      return;
    }
    const playerIds = players.map((p) => p.player_id);
    const initialState = getInitialGameState(game, playerIds);

    await supabase
      .from("rooms")
      .update({
        game,
        status: "playing",
        state: replaceGameSlot(room, game, initialState),
      })
      .eq("id", roomId);
  };

  const backToLobby = async () => {
    // Keep state.games so progress is preserved
    await supabase.from("rooms").update({ game: null, status: "lobby" }).eq("id", roomId);
    // Reset ready flags for next round of selection
    await supabase
      .from("room_players")
      .update({ ready: false })
      .eq("room_id", roomId);
  };

  const leave = async () => {
    await supabase.from("room_players").delete().eq("room_id", roomId).eq("player_id", playerId);
    navigate({ to: "/" });
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
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading room…</p>
      </main>
    );
  }

  const playerList = players.map((p) => ({ player_id: p.player_id, name: p.name }));
  const currentMeta = GAMES.find((g) => g.id === room.game);
  const playable = GAMES.filter(
    (g) => players.length >= g.minPlayers && players.length <= g.maxPlayers,
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <header className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={leave}>
            <ArrowLeft className="w-4 h-4" />
            Leave
          </Button>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1 text-xs text-muted-foreground"
              title={connected ? "Connected" : "Reconnecting…"}
            >
              {connected ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-destructive animate-pulse" />
              )}
            </span>
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border hover:bg-accent transition-colors"
            >
              <span className="font-mono font-bold tracking-widest text-sm">{roomId}</span>
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <ThemeToggle />
          </div>
        </header>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              Players ({players.length})
            </div>
            {room.status === "lobby" && (
              <span className="text-xs text-muted-foreground">
                {players.filter((p) => p.ready).length}/{players.length} ready
              </span>
            )}
          </div>
          <ul className="space-y-1.5">
            {players.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                {p.player_id === room.host_id && (
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="font-medium flex-1 truncate">{p.name}</span>
                {p.player_id === playerId && (
                  <span className="text-xs text-muted-foreground">(you)</span>
                )}
                {room.status === "lobby" &&
                  (p.ready ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="w-3.5 h-3.5" /> Ready
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not ready</span>
                  ))}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          {room.status === "lobby" || !room.game ? (
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold">
                  {isHost ? "Choose a game" : "Waiting for host…"}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {players.length < 2
                    ? "Share the code so a friend can join"
                    : allReady
                      ? "Everyone's ready!"
                      : "Mark yourself ready when you're set"}
                </p>
              </div>

              <Button
                variant={me?.ready ? "default" : "outline"}
                className="w-full h-11"
                onClick={toggleReady}
                disabled={!me}
              >
                {me?.ready ? (
                  <>
                    <Check className="w-4 h-4" /> Ready
                  </>
                ) : (
                  "I'm Ready"
                )}
              </Button>

              <div className="grid gap-2">
                {GAMES.map((g) => {
                  const Icon = g.icon;
                  const canPlay = playable.some((pg) => pg.id === g.id);
                  return (
                    <button
                      key={g.id}
                      disabled={!isHost || !allReady || !canPlay}
                      onClick={() => startGame(g.id)}
                      className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{g.name}</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {g.minPlayers === g.maxPlayers
                              ? `${g.minPlayers}P`
                              : `${g.minPlayers}–${g.maxPlayers}P`}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {g.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1.5 leading-snug">
                          {g.howTo}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button variant="ghost" size="sm" className="w-full" onClick={copyLink}>
                <LinkIcon className="w-3.5 h-3.5" /> Copy invite link
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {currentMeta && <currentMeta.icon className="w-4 h-4" />}
                  <span>{currentMeta?.name}</span>
                </div>
                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" /> How to play
                </button>
              </div>

              {showInfo && currentMeta && (
                <div className="text-xs bg-muted/50 border rounded-md p-3 text-muted-foreground leading-relaxed">
                  {currentMeta.howTo}
                </div>
              )}

              {room.game === "rps" && (
                <RpsGame room={room} playerId={playerId} players={playerList} />
              )}
              {room.game === "ttt" && (
                <TicTacToeGame room={room} playerId={playerId} players={playerList} />
              )}
              {room.game === "c4" && (
                <ConnectFourGame room={room} playerId={playerId} players={playerList} />
              )}
              {room.game === "memory" && (
                <MemoryMatchGame room={room} playerId={playerId} players={playerList} />
              )}
              {room.game === "reaction" && (
                <ReactionDuelGame room={room} playerId={playerId} players={playerList} />
              )}
              {room.game === "pong" && (
                <PongGame room={room} playerId={playerId} players={playerList} />
              )}

              {isHost && (
                <Button variant="ghost" size="sm" className="w-full" onClick={backToLobby}>
                  <Trophy className="w-3.5 h-3.5" /> Back to game selection (progress saved)
                </Button>
              )}
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline inline-flex items-center gap-1">
            <Timer className="w-3 h-3" /> Mini Games
          </Link>
        </p>
        <Footer />
      </div>
    </main>
  );
}
