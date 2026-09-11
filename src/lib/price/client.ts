import type { CoinId } from "@/lib/coins/catalog";
import { loadKlines, loadTicker, type Candle, type Ticker } from "./fetchers";
import { fetchKlines, fetchTicker } from "./server";

function tickerKey(id: CoinId) {
  return `reloj-ticker-${id}`;
}
function klineKey(id: CoinId) {
  return `reloj-klines-${id}`;
}

export function readCachedTicker(coinId: CoinId = "BTC"): Ticker | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(tickerKey(coinId));
    if (!raw) return null;
    const t = JSON.parse(raw) as Ticker;
    if (!t || !Number.isFinite(t.spot)) return null;
    return t;
  } catch {
    return null;
  }
}

export function writeCachedTicker(t: Ticker, coinId: CoinId = "BTC") {
  try {
    localStorage.setItem(tickerKey(coinId), JSON.stringify(t));
  } catch {
    /* quota */
  }
}

export function isTickerStale(t: Ticker | null, now = Date.now()): boolean {
  if (!t) return true;
  return now - t.ts > 12_000;
}

export function cacheKlines(
  key: string,
  candles: Candle[],
  source: string,
  coinId: CoinId = "BTC",
) {
  try {
    const slim =
      candles.length > 4000 ? candles.filter((_, i) => i % 2 === 0) : candles;
    localStorage.setItem(
      klineKey(coinId),
      JSON.stringify({ key, candles: slim, source, ts: Date.now() }),
    );
  } catch {
    try {
      localStorage.removeItem(klineKey(coinId));
    } catch {
      /* quota */
    }
  }
}

export function readCachedKlines(
  key: string,
  coinId: CoinId = "BTC",
): {
  candles: Candle[];
  source: string;
} | null {
  try {
    const raw = localStorage.getItem(klineKey(coinId));
    if (!raw) return null;
    const j = JSON.parse(raw) as {
      key: string;
      candles: Candle[];
      source: string;
    };
    if (j.key !== key || !Array.isArray(j.candles) || j.candles.length < 3) {
      return null;
    }
    return j;
  } catch {
    return null;
  }
}

export async function getTicker(coinId: CoinId = "BTC"): Promise<Ticker> {
  try {
    return await fetchTicker({ data: { coinId } });
  } catch {
    return await loadTicker(coinId);
  }
}

export async function getKlines(
  interval: string,
  startMs: number,
  endMs: number,
  coinId: CoinId = "BTC",
): Promise<{ candles: Candle[]; source: string }> {
  try {
    const res = await fetchKlines({
      data: { interval, startMs, endMs, coinId },
    });
    if (res.candles.length > 2) return res;
  } catch {
    /* browser fallback */
  }
  return loadKlines(interval, startMs, endMs, coinId);
}
