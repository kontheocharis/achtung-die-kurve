export const PLAYERS = [
  "red",
  "blue",
  "green",
  "yellow",
  "magenta",
  "cyan",
] as const;

export type Player = (typeof PLAYERS)[number];
