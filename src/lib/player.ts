// Client identity for the game hub. Persisted in localStorage.
// No auth required — this is a public party-game lobby.

const ID_KEY = "mg_player_id";
const NAME_KEY = "mg_player_name";

export function getPlayerId(): string {
  if (typeof window === "undefined") return "";
  // Tab-scoped identity. Two tabs on the same device must be two players,
  // otherwise the lobby dedupes them and turn-based games never assign marks.
  // sessionStorage survives reload but is unique per tab.
  let id = sessionStorage.getItem(ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(ID_KEY, id);
  }
  return id;
}

export function getPlayerName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function setPlayerName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}

export function generateRoomId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
