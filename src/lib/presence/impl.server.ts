import type { PresenceSnap } from "./types";

const LIVE_MS = 50_000;

type Seat = { first: number; last: number; counted: boolean };
type Totals = { visits: number; totalMs: number; closed: number };
type Mem = { seats: Map<string, Seat>; totals: Totals };

const g = globalThis as typeof globalThis & { __relojPresence__?: Mem };
function mem(): Mem {
  if (!g.__relojPresence__) {
    g.__relojPresence__ = {
      seats: new Map(),
      totals: { visits: 0, totalMs: 0, closed: 0 },
    };
  }
  return g.__relojPresence__;
}

function prune(now: number) {
  const { seats, totals } = mem();
  for (const [id, s] of seats) {
    if (now - s.last > LIVE_MS) {
      // Roll the finished session into the closed totals before dropping it,
      // so avgMin keeps its meaning across the life of the instance.
      totals.closed += 1;
      totals.totalMs += Math.max(0, s.last - s.first);
      seats.delete(id);
    }
  }
}

/**
 * This app ships with no database (`.grok/app-env.json` → deploy.database=false),
 * so totals live in the instance. The DB-backed version behaved identically
 * whenever the query failed — it already fell back to this same in-memory path.
 */
function readTotals(): Totals {
  return mem().totals;
}

function bumpVisit() {
  mem().totals.visits += 1;
}

function pack(totals: Totals, now: number): PresenceSnap {
  const { seats } = mem();
  prune(now);
  let openMs = 0;
  for (const s of seats.values()) openMs += Math.max(0, now - s.first);
  const n = totals.closed + seats.size;
  const ms = totals.totalMs + openMs;
  const avgMin = n > 0 ? Math.max(1, Math.round(ms / n / 60_000)) : 1;
  return {
    live: Math.max(1, seats.size),
    visits: Math.max(totals.visits, seats.size),
    avgMin,
  };
}

export async function ping(id: string): Promise<PresenceSnap> {
  const now = Date.now();
  const { seats } = mem();
  prune(now);
  let s = seats.get(id);
  if (!s) {
    s = { first: now, last: now, counted: false };
    seats.set(id, s);
  } else {
    s.last = now;
  }
  if (!s.counted) {
    s.counted = true;
    bumpVisit();
  }
  return pack(readTotals(), now);
}

export async function snapshot(): Promise<PresenceSnap> {
  return pack(readTotals(), Date.now());
}
