export type VoteChoice = "yes" | "no";

export type VoteSnap = {
  yes: number;
  no: number;
  total: number;
  /** Percentage of voters who said the cycle holds. 0 when nobody voted. */
  pct: number;
};
