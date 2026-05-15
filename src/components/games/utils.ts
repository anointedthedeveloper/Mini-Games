export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SYMBOLS = ["★", "●", "▲", "■", "♥", "♦", "♣", "♠", "◆", "◉"];
export function buildMemoryDeck(pairs: number): string[] {
  const syms = SYMBOLS.slice(0, pairs);
  return shuffle([...syms, ...syms]);
}

export function getInitialGameState(gameId: string, playerIds: string[]): any {
  const [p1, p2] = playerIds;
  switch (gameId) {
    case "rps":
      return { picks: {}, scores: {}, round: 1 };
    case "ttt":
      return {
        board: Array(9).fill(null),
        marks: { [p1]: "X", [p2]: "O" },
        turn: p1,
        winner: null,
      };
    case "c4":
      return {
        board: Array(42).fill(null),
        marks: { [p1]: "R", [p2]: "Y" },
        turn: p1,
        winner: null,
      };
    case "memory":
      return {
        cards: buildMemoryDeck(8),
        flipped: [],
        matched: [],
        owner: {},
        scores: {},
        turn: p1,
      };
    case "reaction":
      return { round: 0, status: "waiting", results: {}, winnerRound: null };
    case "pong":
      return { scores: { left: 0, right: 0 }, winner: null };
    default:
      return {};
  }
}
