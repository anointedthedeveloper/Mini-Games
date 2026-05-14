import type { Database } from "@/integrations/supabase/types";
import type { LucideIcon } from "lucide-react";

export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type RoomPlayer = Database["public"]["Tables"]["room_players"]["Row"];

export interface GameMeta {
  id: string;
  name: string;
  icon: LucideIcon;
  minPlayers: number;
  maxPlayers: number;
  description: string;
  howTo: string;
}

// We treat room.state as a free-form JSON bag, since Supabase's generated `Json`
// type doesn't accept arbitrary discriminated unions cleanly.
type AnyRec = Record<string, any>;
type StateBag = { games?: Record<string, AnyRec> } & AnyRec;

/** Read this game's slot from room.state.games[gameId] (preserves progress when switching). */
export function getGameSlot<T = AnyRec>(room: Room, gameId: string): T {
  const state = ((room.state as StateBag | null) ?? {}) as StateBag;
  return ((state.games ?? {})[gameId] ?? {}) as T;
}

/** Merge a partial update into room.state.games[gameId], preserving other game slots. */
export function mergeGameSlot(room: Room, gameId: string, patch: AnyRec): any {
  const state = ((room.state as StateBag | null) ?? {}) as StateBag;
  const games = { ...(state.games ?? {}) };
  games[gameId] = { ...(games[gameId] ?? {}), ...patch };
  return { ...state, games };
}

export function replaceGameSlot(room: Room, gameId: string, next: AnyRec): any {
  const state = ((room.state as StateBag | null) ?? {}) as StateBag;
  const games = { ...(state.games ?? {}) };
  games[gameId] = next;
  return { ...state, games };
}
