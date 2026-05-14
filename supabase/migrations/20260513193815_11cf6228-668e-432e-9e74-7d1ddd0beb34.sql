
CREATE TABLE public.rooms (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  game TEXT,
  status TEXT NOT NULL DEFAULT 'lobby',
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, player_id)
);

CREATE INDEX idx_room_players_room ON public.room_players(room_id);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

-- Public game lobby: anyone can read & write
CREATE POLICY "rooms_public_select" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms_public_insert" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_public_update" ON public.rooms FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "rooms_public_delete" ON public.rooms FOR DELETE USING (true);

CREATE POLICY "rp_public_select" ON public.room_players FOR SELECT USING (true);
CREATE POLICY "rp_public_insert" ON public.room_players FOR INSERT WITH CHECK (true);
CREATE POLICY "rp_public_update" ON public.room_players FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "rp_public_delete" ON public.room_players FOR DELETE USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER rooms_touch BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Realtime
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_players REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
