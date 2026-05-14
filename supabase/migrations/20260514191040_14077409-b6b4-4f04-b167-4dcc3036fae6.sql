
ALTER TABLE public.room_players
  ADD COLUMN IF NOT EXISTS ready boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_room_players_room ON public.room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_last_seen ON public.room_players(last_seen);
