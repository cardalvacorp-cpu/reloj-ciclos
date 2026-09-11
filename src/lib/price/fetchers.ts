import { getCoin, type CoinId, type CoinPairs } from "@/lib/coins/catalog";

export type Ticker = {
  spot: number;
  change24h: number;
  high24h: number | null;
  low24h: number | null;
  source: string;
  ts: number;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const UA = {
  accept: "application/json",
  "user-agent": "Mozilla/5.0 (compatible; RelojBTC/1.0)",
};

async function fetchJson(url: string, timeoutMs = 10000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: UA });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function sanitize(candles: Candle[]): Candle[] {
  const byTime = new Map<number, Candle>();
  for (const c of candles) {
    if (!Number.isFinite(c.close) || c.close <= 0) continue;
    let time = Number(c.time);
    if (!Number.isFinite(time) || time <= 0) continue;
    if (time > 1e12) time = Math.floor(time / 1000);
    else time = Math.floor(time);
    const open = Number.isFinite(c.open) ? c.open : c.close;
    const high = Math.max(c.high || c.close, open, c.close);
    const low = Math.min(c.low || c.close, open, c.close);
    byTime.set(time, {
      time,
      open,
      high,
      low,
      close: c.close,
      volume: Number.isFinite(c.volume) ? c.volume : 0,
    });
  }
  return [...byTime.values()].sort((a, b) => a.time - b.time);
}

async function tickerBitstamp(pair: string): Promise<Ticker> {
  const j = (await fetchJson(
    `https://www.bitstamp.net/api/v2/ticker/${pair}/`,
  )) as Record<string, string>;
  const last = Number(j.last);
  const open = Number(j.open);
  return {
    spot: last,
    change24h: open ? ((last - open) / open) * 100 : 0,
    high24h: Number(j.high),
    low24h: Number(j.low),
    source: `BITSTAMP:${pair.toUpperCase()}`,
    ts: Date.now(),
  };
}

async function tickerKraken(pair: string): Promise<Ticker> {
  const j = (await fetchJson(
    `https://api.kraken.com/0/public/Ticker?pair=${pair}`,
  )) as {
    result: Record<
      string,
      { c: string[]; o: string; h: string[]; l: string[] }
    >;
  };
  const row = Object.values(j.result)[0];
  const last = Number(row.c[0]);
  const open = Number(row.o);
  return {
    spot: last,
    change24h: open ? ((last - open) / open) * 100 : 0,
    high24h: Number(row.h[1] ?? row.h[0]),
    low24h: Number(row.l[1] ?? row.l[0]),
    source: `KRAKEN:${pair}`,
    ts: Date.now(),
  };
}

async function tickerCoinbase(product: string): Promise<Ticker> {
  const [spotJ, statsJ] = await Promise.all([
    fetchJson(`https://api.coinbase.com/v2/prices/${product}/spot`) as Promise<{
      data: { amount: string };
    }>,
    fetchJson(
      `https://api.exchange.coinbase.com/products/${product}/stats`,
    ).catch(() => null) as Promise<{
      last: string;
      open: string;
      high: string;
      low: string;
    } | null>,
  ]);
  const spot = Number(spotJ.data.amount);
  const open = statsJ ? Number(statsJ.open) : 0;
  return {
    spot,
    change24h: open ? ((spot - open) / open) * 100 : 0,
    high24h: statsJ ? Number(statsJ.high) : null,
    low24h: statsJ ? Number(statsJ.low) : null,
    source: `COINBASE:${product}`,
    ts: Date.now(),
  };
}

async function tickerPaprika(id: string): Promise<Ticker> {
  const j = (await fetchJson(
    `https://api.coinpaprika.com/v1/tickers/${id}`,
  )) as {
    quotes: { USD: { price: number; percent_change_24h: number } };
  };
  return {
    spot: j.quotes.USD.price,
    change24h: j.quotes.USD.percent_change_24h,
    high24h: null,
    low24h: null,
    source: `COINPAPRIKA:${id}`,
    ts: Date.now(),
  };
}

async function tickerBinance(host: string, symbol: string): Promise<Ticker> {
  const j = (await fetchJson(
    `https://${host}/api/v3/ticker/24hr?symbol=${symbol}`,
  )) as {
    lastPrice: string;
    priceChangePercent: string;
    highPrice: string;
    lowPrice: string;
  };
  return {
    spot: Number(j.lastPrice),
    change24h: Number(j.priceChangePercent),
    high24h: Number(j.highPrice),
    low24h: Number(j.lowPrice),
    source: `BINANCE:${symbol}`,
    ts: Date.now(),
  };
}

export async function loadTicker(coinId: CoinId = "BTC"): Promise<Ticker> {
  const pairs = getCoin(coinId).pairs;
  const errors: string[] = [];
  const fns: Array<() => Promise<Ticker>> = [];
  if (pairs.kraken) fns.push(() => tickerKraken(pairs.kraken!));
  if (pairs.coinbase) fns.push(() => tickerCoinbase(pairs.coinbase!));
  if (pairs.bitstamp) fns.push(() => tickerBitstamp(pairs.bitstamp!));
  if (pairs.binanceUs) fns.push(() => tickerBinance("api.binance.us", pairs.binanceUs!));
  if (pairs.binance) fns.push(() => tickerBinance("api.binance.com", pairs.binance!));
  if (pairs.paprika) fns.push(() => tickerPaprika(pairs.paprika!));
  for (const fn of fns) {
    try {
      const t = await fn();
      if (Number.isFinite(t.spot) && t.spot > 0) return t;
    } catch (e) {
      errors.push(String(e));
    }
  }
  throw new Error(`ticker failed: ${errors.join(" | ")}`);
}

const KRAKEN_IV: Record<string, string> = {
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "30m": "30",
  "1h": "60",
  "4h": "240",
  "1D": "1440",
  "1W": "10080",
};
const BINANCE_IV: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "30m": "30m",
  "1h": "1h",
  "4h": "4h",
  "1D": "1d",
  "1W": "1w",
};
const BITSTAMP_STEP: Record<string, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "30m": 1800,
  "1h": 3600,
  "4h": 14400,
  "1D": 86400,
  "1W": 86400,
};
const COINBASE_GRAN: Record<string, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "30m": 1800,
  "1h": 3600,
  "1D": 86400,
};
const KUCOIN_TYPE: Record<string, string> = {
  "1m": "1min",
  "5m": "5min",
  "15m": "15min",
  "30m": "30min",
  "1h": "1hour",
  "4h": "4hour",
  "1D": "1day",
  "1W": "1week",
};

async function klinesKraken(
  pair: string,
  interval: string,
  startMs: number,
  endMs: number,
): Promise<Candle[]> {
  const iv = KRAKEN_IV[interval] ?? "1440";
  const out: Candle[] = [];
  let since = Math.floor(startMs / 1000) - 1;
  for (let page = 0; page < 16; page++) {
    const j = (await fetchJson(
      `https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=${iv}&since=${since}`,
      12000,
    )) as { result: Record<string, unknown> };
    const key = Object.keys(j.result).find((k) => k !== "last");
    if (!key) break;
    const rows = j.result[key] as number[][];
    if (!Array.isArray(rows) || rows.length === 0) break;
    for (const r of rows) {
      out.push({
        time: Number(r[0]),
        open: Number(r[1]),
        high: Number(r[2]),
        low: Number(r[3]),
        close: Number(r[4]),
        volume: Number(r[6]),
      });
    }
    const lastTime = Number(rows[rows.length - 1][0]);
    if (rows.length < 80 || lastTime * 1000 >= endMs) break;
    const rawLast = Number(j.result.last);
    const next =
      rawLast > 1e12 ? Math.floor(rawLast / 1e9) : Math.floor(rawLast);
    since = Math.max(next, lastTime);
  }
  return sanitize(out).filter(
    (c) => c.time * 1000 >= startMs - 86400000 && c.time * 1000 <= endMs + 86400000,
  );
}

async function klinesBinance(
  host: string,
  symbol: string,
  interval: string,
  startMs: number,
  endMs: number,
): Promise<Candle[]> {
  const iv = BINANCE_IV[interval] ?? "1d";
  const out: Candle[] = [];
  let cursor = startMs;
  for (let i = 0; i < 10 && cursor < endMs; i++) {
    const url = `https://${host}/api/v3/klines?symbol=${symbol}&interval=${iv}&startTime=${cursor}&endTime=${endMs}&limit=1000`;
    const rows = (await fetchJson(url, 12000)) as number[][];
    if (!Array.isArray(rows) || rows.length === 0) break;
    for (const r of rows) {
      out.push({
        time: Number(r[0]),
        open: Number(r[1]),
        high: Number(r[2]),
        low: Number(r[3]),
        close: Number(r[4]),
        volume: Number(r[5]),
      });
    }
    const last = Number(rows[rows.length - 1][0]);
    if (rows.length < 1000) break;
    cursor = last + 1;
  }
  return sanitize(out);
}

async function klinesBitstamp(
  pair: string,
  interval: string,
  startMs: number,
  endMs: number,
): Promise<Candle[]> {
  const step = BITSTAMP_STEP[interval] ?? 86400;
  const out: Candle[] = [];
  let start = Math.floor(startMs / 1000);
  const end = Math.floor(endMs / 1000);
  for (let i = 0; i < 10 && start < end; i++) {
    const url = `https://www.bitstamp.net/api/v2/ohlc/${pair}/?step=${step}&limit=1000&start=${start}`;
    const j = (await fetchJson(url, 12000)) as {
      data: {
        ohlc: Array<{
          timestamp: string;
          open: string;
          high: string;
          low: string;
          close: string;
          volume: string;
        }>;
      };
    };
    const rows = j.data?.ohlc ?? [];
    if (rows.length === 0) break;
    for (const r of rows) {
      out.push({
        time: Number(r.timestamp),
        open: Number(r.open),
        high: Number(r.high),
        low: Number(r.low),
        close: Number(r.close),
        volume: Number(r.volume),
      });
    }
    const last = Number(rows[rows.length - 1].timestamp);
    if (rows.length < 50 || last >= end) break;
    start = last + step;
  }
  return sanitize(out);
}

async function klinesCoinbase(
  product: string,
  interval: string,
  startMs: number,
  endMs: number,
): Promise<Candle[]> {
  const gran = COINBASE_GRAN[interval];
  if (!gran) return [];
  const out: Candle[] = [];
  const maxSpan = 300 * gran * 1000;
  let cursor = startMs;
  for (let i = 0; i < 16 && cursor < endMs; i++) {
    const chunkEnd = Math.min(cursor + maxSpan, endMs);
    const url = `https://api.exchange.coinbase.com/products/${product}/candles?granularity=${gran}&start=${new Date(cursor).toISOString()}&end=${new Date(chunkEnd).toISOString()}`;
    const rows = (await fetchJson(url, 12000)) as number[][];
    if (!Array.isArray(rows) || rows.length === 0) {
      cursor = chunkEnd + gran * 1000;
      continue;
    }
    for (const r of rows) {
      out.push({
        time: Number(r[0]),
        low: Number(r[1]),
        high: Number(r[2]),
        open: Number(r[3]),
        close: Number(r[4]),
        volume: Number(r[5]),
      });
    }
    cursor = chunkEnd + 1;
  }
  return sanitize(out);
}

async function klinesKucoin(
  symbol: string,
  interval: string,
  startMs: number,
  endMs: number,
): Promise<Candle[]> {
  const type = KUCOIN_TYPE[interval] ?? "1day";
  const startAt = Math.floor(startMs / 1000);
  const endAt = Math.floor(endMs / 1000);
  const j = (await fetchJson(
    `https://api.kucoin.com/api/v1/market/candles?type=${type}&symbol=${symbol}&startAt=${startAt}&endAt=${endAt}`,
    12000,
  )) as { data?: string[][] };
  const rows = j.data ?? [];
  const out: Candle[] = [];
  for (const r of rows) {
    out.push({
      time: Number(r[0]),
      open: Number(r[1]),
      close: Number(r[2]),
      high: Number(r[3]),
      low: Number(r[4]),
      volume: Number(r[5]),
    });
  }
  return sanitize(out);
}

async function klinesBlockchainDaily(
  startMs: number,
  endMs: number,
): Promise<Candle[]> {
  const j = (await fetchJson(
    "https://api.blockchain.info/charts/market-price?timespan=all&format=json&sampled=false",
    15000,
  )) as { values?: Array<{ x: number; y: number }> };
  const values = j.values ?? [];
  const out: Candle[] = [];
  for (const v of values) {
    const t = v.x;
    const px = v.y;
    if (t * 1000 < startMs - 86400000 || t * 1000 > endMs + 86400000) continue;
    if (!Number.isFinite(px) || px <= 0) continue;
    out.push({ time: t, open: px, high: px, low: px, close: px, volume: 0 });
  }
  return sanitize(out);
}

export async function loadKlines(
  interval: string,
  startMs: number,
  endMs: number,
  coinId: CoinId = "BTC",
): Promise<{ candles: Candle[]; source: string }> {
  const pairs: CoinPairs = getCoin(coinId).pairs;
  const sources: Array<[string, () => Promise<Candle[]>]> = [];
  const kucoinFirst = coinId === "JUP";
  if (kucoinFirst && pairs.kucoin) {
    sources.push([
      `KUCOIN:${pairs.kucoin}`,
      () => klinesKucoin(pairs.kucoin!, interval, startMs, endMs),
    ]);
  }
  if (pairs.kraken) {
    sources.push([
      `KRAKEN:${pairs.kraken}`,
      () => klinesKraken(pairs.kraken!, interval, startMs, endMs),
    ]);
  }
  if (pairs.binanceUs) {
    sources.push([
      `BINANCEUS:${pairs.binanceUs}`,
      () => klinesBinance("api.binance.us", pairs.binanceUs!, interval, startMs, endMs),
    ]);
  }
  if (pairs.binance) {
    sources.push([
      `BINANCE:${pairs.binance}`,
      () => klinesBinance("api.binance.com", pairs.binance!, interval, startMs, endMs),
    ]);
  }
  if (pairs.bitstamp) {
    sources.push([
      `BITSTAMP:${pairs.bitstamp}`,
      () => klinesBitstamp(pairs.bitstamp!, interval, startMs, endMs),
    ]);
  }
  if (pairs.kucoin && !kucoinFirst) {
    sources.push([
      `KUCOIN:${pairs.kucoin}`,
      () => klinesKucoin(pairs.kucoin!, interval, startMs, endMs),
    ]);
  }
  if (pairs.coinbase) {
    sources.push([
      `COINBASE:${pairs.coinbase}`,
      () => klinesCoinbase(pairs.coinbase!, interval, startMs, endMs),
    ]);
  }
  if (coinId === "BTC" && (interval === "1D" || interval === "1W")) {
    sources.push([
      "BLOCKCHAIN:BTC-USD",
      () => klinesBlockchainDaily(startMs, endMs),
    ]);
  }
  const errors: string[] = [];
  for (const [source, fn] of sources) {
    try {
      const candles = await fn();
      if (candles.length > 2) return { candles, source };
      errors.push(`${source}: ${candles.length} bars`);
    } catch (e) {
      errors.push(`${source}: ${String(e)}`);
    }
  }
  throw new Error(`klines failed: ${errors.join(" | ")}`);
}
