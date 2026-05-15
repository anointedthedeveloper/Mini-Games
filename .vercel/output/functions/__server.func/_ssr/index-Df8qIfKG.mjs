import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { g as getPlayerName, a as getPlayerId, T as ThemeToggle, C as Card, B as Button, F as Footer, c as cn, s as setPlayerName, b as supabase, d as generateRoomId } from "./footer-mrOlDmwC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { G as Gamepad2, H as HandMetal, a as Grid3x3, T as TableProperties, P as Puzzle, Z as Zap, C as Circle } from "../_libs/lucide-react.mjs";
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
import "./router-Crq6Rse8.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const PREVIEW_GAMES = [{
  name: "Rock Paper Scissors",
  icon: HandMetal
}, {
  name: "Tic Tac Toe",
  icon: Grid3x3
}, {
  name: "Connect Four",
  icon: TableProperties
}, {
  name: "Memory Match",
  icon: Puzzle
}, {
  name: "Reaction Duel",
  icon: Zap
}, {
  name: "Pong",
  icon: Circle
}];
function Home() {
  const navigate = useNavigate();
  const [name, setName] = reactExports.useState("");
  const [roomCode, setRoomCode] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setName(getPlayerName());
    getPlayerId();
  }, []);
  const persistName = (n) => {
    setName(n);
    setPlayerName(n);
  };
  const createRoom = async () => {
    if (!name.trim()) return toast.error("Enter your name first");
    setBusy(true);
    const playerId = getPlayerId();
    const id = generateRoomId();
    const {
      error
    } = await supabase.from("rooms").insert({
      id,
      host_id: playerId,
      status: "lobby",
      state: {}
    });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    await supabase.from("room_players").insert({
      room_id: id,
      player_id: playerId,
      name: name.trim()
    });
    navigate({
      to: "/room/$roomId",
      params: {
        roomId: id
      }
    });
  };
  const joinRoom = async () => {
    if (!name.trim()) return toast.error("Enter your name first");
    const code = roomCode.trim().toUpperCase();
    if (!code) return toast.error("Enter a room code");
    setBusy(true);
    const playerId = getPlayerId();
    const {
      data: room
    } = await supabase.from("rooms").select("id").eq("id", code).maybeSingle();
    if (!room) {
      setBusy(false);
      return toast.error("Room not found");
    }
    await supabase.from("room_players").upsert({
      room_id: code,
      player_id: playerId,
      name: name.trim(),
      ready: false
    }, {
      onConflict: "room_id,player_id"
    });
    navigate({
      to: "/room/$roomId",
      params: {
        roomId: code
      }
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 right-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: "w-7 h-7" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Mini Games" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Real-time multiplayer. No signup. Six games." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Your name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Anointed", value: name, maxLength: 20, onChange: (e) => persistName(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full h-11", disabled: busy, onClick: createRoom, children: "Create Room" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "or join" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "ROOM CODE", value: roomCode, maxLength: 6, className: "uppercase tracking-widest font-mono", onChange: (e) => setRoomCode(e.target.value.toUpperCase()), onKeyDown: (e) => e.key === "Enter" && joinRoom() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", disabled: busy, onClick: joinRoom, children: "Join" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid grid-cols-3 gap-2", children: PREVIEW_GAMES.map((g) => {
        const Icon = g.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 p-3 rounded-lg bg-card/50 border text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground leading-tight", children: g.name })
        ] }, g.name);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
export {
  Home as component
};
