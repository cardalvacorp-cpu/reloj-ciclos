export type LogRow = {
  /** ISO date of the daily close. */
  date: string;
  /** Day of the down leg on that date. */
  day: number;
  /** Daily close in USD. */
  close: number;
  /** Drawdown vs the published cycle high, in percent. */
  dd: number;
};

export type LogSnap = {
  rows: LogRow[];
  /** Which exchange the closes came from. */
  source: string;
  generatedAt: number;
  /** True when the exchanges could not be reached and this is a cached or empty result. */
  stale: boolean;
};
