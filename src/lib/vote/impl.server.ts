import type { VoteChoice, VoteSnap } from "./types";

/**
 * Same constraint as presence: this app ships with no database, so the tally
 * lives in the instance and resets on deploy. The UI says so out loud rather
 * than dressing an in-memory counter up as a permanent public record.
 */
type Mem = { ballots: Map<string, VoteChoice> };

const g = globalThis as typeof globalThis & { __watchCyclesVote__?: Mem };

function mem(): Mem {
  if (!g.__watchCyclesVote__) g.__watchCyclesVote__ = { ballots: new Map() };
  return g.__watchCyclesVote__;
}

function pack(): VoteSnap {
  const { ballots } = mem();
  let yes = 0;
  for (const v of ballots.values()) if (v === "yes") yes += 1;
  const total = ballots.size;
  return { yes, no: total - yes, total, pct: total ? Math.round((yes / total) * 100) : 0 };
}

/** One ballot per id. Voting again replaces the previous answer. */
export async function cast(id: string, choice: VoteChoice): Promise<VoteSnap> {
  const { ballots } = mem();
  if (ballots.size < 200_000 || ballots.has(id)) ballots.set(id, choice);
  return pack();
}

export async function tally(): Promise<VoteSnap> {
  return pack();
}
