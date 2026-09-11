import { getCoin, type CoinId } from "@/lib/coins/catalog";
import { loadKlines, type Candle } from "@/lib/price/fetchers";
import { MS_DAY, parseLocalToUtcMs } from "@/lib/cycle/time";
import type { LogRow, LogSnap } from "./types";

const TTL_MS = 6 * 3600_000;
const STEP_DAYS = 7;

/**
 * The log is derived, never typed in.
 *
 * It is rebuilt from the exchanges' daily closes against the published cycle
 * high, so there is nothing to maintain by hand and nothing that can be quietly
 * edited after the fact — which is the whole point of publishing a log.
 *
 * The anchor is the coin's **published** model (`catalog.ts`), not whatever the
 * visitor has tweaked in Settings. The public record has to be the public model.
 */
type Mem = Map<CoinId, LogSnap>;

const g = globalThis as typeof globalThis & { __watchCyclesLog__?: Mem };

function mem(): Mem {
  if (!g.__watchCyclesLog__) g.__watchCyclesLog__ = new Map();
  return g.__watchCyclesLog__;
}

function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** One row per 7-day bucket since the high, using that bucket's last close. */
function weeklyRows(candles: Candle[], athMs: number, athUsd: number): LogRow[] {
  const byBucket = new Map<number, Candle>();
  for (const c of candles) {
    const ms = c.time * 1000;
    if (ms <= athMs) continue;
    const bucket = Math.floor((ms - athMs) / (STEP_DAYS * MS_DAY));
    const prev = byBucket.get(bucket);
    if (!prev || c.time > prev.time) byBucket.set(bucket, c);
  }

  const newest = candles[candles.length - 1];
  if (newest && newest.time * 1000 > athMs) {
    byBucket.set(Math.floor((newest.time * 1000 - athMs) / (STEP_DAYS * MS_DAY)), newest);
  }

  const rows: LogRow[] = [
    { date: isoDay(athMs), day: 0, close: athUsd, dd: 0 },
  ];
  for (const c of [...byBucket.values()].sort((a, b) => a.time - b.time)) {
    const ms = c.time * 1000;
    rows.push({
      date: isoDay(ms),
      day: Math.round((ms - athMs) / MS_DAY),
      close: c.close,
      dd: Math.round(((c.close - athUsd) / athUsd) * 1000) / 10,
    });
  }
  return rows;
}

export async function buildLog(coinId: CoinId): Promise<LogSnap> {
  const cached = mem().get(coinId);
  const now = Date.now();
  if (cached && !cached.stale && now - cached.generatedAt < TTL_MS) return cached;

  const model = getCoin(coinId).defaultModel;
  const athMs = parseLocalToUtcMs(model.athLocal, model.tz);

  try {
    const { candles, source } = await loadKlines("1D", athMs - MS_DAY, now, coinId);
    if (candles.length < 2) throw new Error("no candles");
    const snap: LogSnap = {
      rows: weeklyRows(candles, athMs, model.athUsd),
      source,
      generatedAt: now,
      stale: false,
    };
    mem().set(coinId, snap);
    return snap;
  } catch {
    // Exchanges unreachable. Serve the last good log if there is one; otherwise
    // the cycle high alone, which comes from the model and is always true.
    if (cached) return { ...cached, stale: true };
    return {
      rows: [{ date: isoDay(athMs), day: 0, close: model.athUsd, dd: 0 }],
      source: "",
      generatedAt: now,
      stale: true,
    };
  }
}
