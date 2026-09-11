import type { Candle } from "@/lib/price/fetchers";

export const TARGET_TFS = ["5m", "15m", "30m", "1h", "1D", "1W", "1M"] as const;
export type TargetTf = (typeof TARGET_TFS)[number];

export type TfTarget = {
  tf: TargetTf;
  close: number;
  atr: number;
  bull: number;
  bear: number;
  bullFib: string;
  bearFib: string;
};

export type TargetContext = {
  down: boolean;
  ath: number;
  cycleLow: number;
  spot?: number | null;
};

export type TargetStep = {
  price: number;
  tag: string;
};

const RET = [0.236, 0.382, 0.5, 0.618, 0.786] as const;
const EXT = [1.272, 1.618, 2.0, 2.618] as const;

function fibTag(f: number) {
  if (f < 1) return `${(Math.round(f * 1000) / 10).toFixed(1)}%`;
  return f.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function trueRange(prev: Candle, c: Candle) {
  return Math.max(
    c.high - c.low,
    Math.abs(c.high - prev.close),
    Math.abs(c.low - prev.close),
  );
}

function atr(candles: Candle[], n = 14) {
  if (candles.length < 3) return 0;
  const start = Math.max(1, candles.length - n);
  let sum = 0;
  let k = 0;
  for (let i = start; i < candles.length; i++) {
    sum += trueRange(candles[i - 1], candles[i]);
    k += 1;
  }
  return k ? sum / k : 0;
}

export function resample(candles: Candle[], stepSec: number): Candle[] {
  const buckets = new Map<number, Candle>();
  for (const c of candles) {
    const t = Math.floor(c.time / stepSec) * stepSec;
    const prev = buckets.get(t);
    if (!prev) {
      buckets.set(t, {
        time: t,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      });
      continue;
    }
    buckets.set(t, {
      time: t,
      open: prev.open,
      high: Math.max(prev.high, c.high),
      low: Math.min(prev.low, c.low),
      close: c.close,
      volume: prev.volume + c.volume,
    });
  }
  return [...buckets.values()].sort((a, b) => a.time - b.time);
}

function lookback(tf: TargetTf) {
  if (tf === "5m") return 96;
  if (tf === "15m") return 64;
  if (tf === "30m") return 48;
  if (tf === "1h") return 72;
  if (tf === "1D") return 90;
  if (tf === "1W") return 52;
  return 18;
}

function swing(candles: Candle[], n: number) {
  const w = candles.slice(-n);
  let high = -Infinity;
  let low = Infinity;
  for (const c of w) {
    if (c.high > high) high = c.high;
    if (c.low < low) low = c.low;
  }
  return { high, low, close: candles[candles.length - 1].close };
}

function nextAbove(close: number, rows: Array<{ px: number; tag: string }>) {
  return rows
    .filter((r) => r.px > close * 1.003)
    .sort((a, b) => a.px - b.px)[0];
}

function nextBelow(close: number, rows: Array<{ px: number; tag: string }>) {
  return rows
    .filter((r) => r.px < close * 0.997)
    .sort((a, b) => b.px - a.px)[0];
}

function macroTf(tf: TargetTf) {
  return tf === "1D" || tf === "1W" || tf === "1M";
}

function pick(
  tf: TargetTf,
  candles: Candle[],
  ctx: TargetContext,
): TfTarget | null {
  const min = tf === "1M" ? 6 : 16;
  if (candles.length < min) return null;
  const last = candles[candles.length - 1];
  const a = atr(candles, 14);
  const sw = swing(candles, Math.min(lookback(tf), candles.length));
  let high = sw.high;
  let low = sw.low;
  if (macroTf(tf) && ctx.ath > 0) {
    high = Math.max(high, ctx.ath);
    if (ctx.cycleLow > 0) low = Math.min(low, ctx.cycleLow);
  }
  const close = ctx.spot && ctx.spot > 0 ? ctx.spot : last.close;
  const range = high - low;
  if (!(range > 0) || !(close > 0)) return null;

  const down = ctx.down || high - close > close - low;
  const levels: Array<{ px: number; tag: string }> = [];
  if (down) {
    for (const f of RET) {
      levels.push({ px: high - f * range, tag: fibTag(f) });
    }
    for (const f of EXT) {
      const px = high - f * range;
      if (px > 0) levels.push({ px, tag: fibTag(f) });
    }
  } else {
    for (const f of RET) {
      levels.push({ px: high - f * range, tag: fibTag(f) });
    }
    for (const f of EXT) {
      levels.push({ px: low + f * range, tag: fibTag(f) });
    }
  }

  let bull =
    nextAbove(close, levels) ?? {
      px: close + Math.max(a, range * 0.236),
      tag: fibTag(0.236),
    };
  let bear =
    nextBelow(close, levels) ?? {
      px: Math.max(1, close - Math.max(a, range * 0.236)),
      tag: fibTag(1.272),
    };

  if (bull.px <= close) {
    bull = { px: close + Math.max(a, close * 0.01), tag: fibTag(0.236) };
  }
  if (bear.px >= close) {
    bear = { px: Math.max(1, close - Math.max(a, close * 0.01)), tag: fibTag(1.272) };
  }

  return {
    tf,
    close,
    atr: a,
    bull: bull.px,
    bear: bear.px,
    bullFib: bull.tag,
    bearFib: bear.tag,
  };
}

export function buildTargets(
  packs: {
    m5?: Candle[];
    h1?: Candle[];
    d1?: Candle[];
  },
  ctx: TargetContext,
): TfTarget[] {
  const out: TfTarget[] = [];
  const add = (row: TfTarget | null) => {
    if (row) out.push(row);
  };
  if (packs.m5 && packs.m5.length >= 16) {
    add(pick("5m", packs.m5, ctx));
    add(pick("15m", resample(packs.m5, 900), ctx));
    add(pick("30m", resample(packs.m5, 1800), ctx));
  }
  if (packs.h1 && packs.h1.length >= 16) {
    add(pick("1h", packs.h1, ctx));
  } else if (packs.m5 && packs.m5.length >= 16) {
    add(pick("1h", resample(packs.m5, 3600), ctx));
  }
  if (packs.d1 && packs.d1.length >= 16) {
    add(pick("1D", packs.d1, ctx));
    add(pick("1W", resample(packs.d1, 604800), ctx));
    add(pick("1M", resample(packs.d1, 30 * 86400), ctx));
  }
  return TARGET_TFS.map((tf) => out.find((r) => r.tf === tf)).filter(
    (r): r is TfTarget => Boolean(r),
  );
}

export function targetTfForChart(tf: string): TargetTf {
  if (tf === "1m" || tf === "5m") return "5m";
  if (tf === "15m") return "15m";
  if (tf === "30m") return "30m";
  if (tf === "1h" || tf === "4h") return "1h";
  if (tf === "1D") return "1D";
  if (tf === "1W") return "1W";
  return "1D";
}

function uniqAbove(spot: number, rows: TargetStep[]) {
  const seen = new Set<number>();
  return rows
    .filter((r) => r.price > spot * 1.004 && r.price > 0)
    .sort((a, b) => a.price - b.price)
    .filter((r) => {
      const k = Math.round(r.price);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

function uniqBelow(spot: number, rows: TargetStep[]) {
  const seen = new Set<number>();
  return rows
    .filter((r) => r.price < spot * 0.996 && r.price > 0)
    .sort((a, b) => b.price - a.price)
    .filter((r) => {
      const k = Math.round(r.price);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

export function bullLadder(
  spot: number,
  fib: TfTarget | null,
  ath: number,
): TargetStep[] {
  const rows: TargetStep[] = [];
  if (fib) rows.push({ price: fib.bull, tag: `Fib ${fib.bullFib}` });
  if (ath > 0) rows.push({ price: ath, tag: "ATH" });
  return uniqAbove(spot, rows);
}

export function bearLadder(
  spot: number,
  fib: TfTarget | null,
  ranges: { mild: number; baseHi: number; baseLo: number; sevHi: number; sevLo: number },
): TargetStep[] {
  const rows: TargetStep[] = [];
  if (fib) rows.push({ price: fib.bear, tag: `Fib ${fib.bearFib}` });
  rows.push({ price: ranges.mild, tag: "−50%" });
  rows.push({ price: ranges.baseHi, tag: "base" });
  rows.push({ price: ranges.baseLo, tag: "base" });
  rows.push({ price: ranges.sevHi, tag: "sev" });
  rows.push({ price: ranges.sevLo, tag: "sev" });
  return uniqBelow(spot, rows);
}
