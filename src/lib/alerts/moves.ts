import type { Copy } from "@/lib/i18n";
import type { Lang } from "@/lib/cycle/time";
import { formatPct, formatUsd } from "@/lib/cycle/time";
import type { Snapshot } from "@/lib/cycle/model";
import type { AlertItem } from "./types";

export type PriceSample = { ts: number; spot: number };

const WINDOWS: Array<{ min: number; pct: number; extreme: number }> = [
  { min: 5, pct: 1.0, extreme: 2.0 },
  { min: 15, pct: 1.8, extreme: 3.0 },
  { min: 60, pct: 3.0, extreme: 5.0 },
];

export function detectAggressive(
  samples: PriceSample[],
  lang: Lang,
  copy: Copy,
  snap: Snapshot,
  symbol = "BTC",
): AlertItem | null {
  if (samples.length < 8) return null;
  const now = samples[samples.length - 1];
  let best: {
    pct: number;
    min: number;
    from: number;
    extreme: boolean;
  } | null = null;

  for (const w of WINDOWS) {
    const cutoff = now.ts - w.min * 60_000;
    let past = samples[0];
    for (const s of samples) {
      if (s.ts >= cutoff) {
        past = s;
        break;
      }
      past = s;
    }
    const span = now.ts - past.ts;
    if (span < w.min * 60_000 * 0.55) continue;
    const pct = ((now.spot - past.spot) / past.spot) * 100;
    const abs = Math.abs(pct);
    if (abs < w.pct) continue;
    if (!best || abs > Math.abs(best.pct)) {
      best = { pct, min: w.min, from: past.spot, extreme: abs >= w.extreme };
    }
  }
  if (!best) return null;

  const up = best.pct >= 0;
  const pctTxt = formatPct(best.pct, 1);
  const bucket = Math.floor(now.ts / (12 * 60_000));
  const line1 =
    lang === "es"
      ? `${symbol} ${up ? "subió" : "bajó"} ${pctTxt} en ${best.min} min`
      : `${symbol} ${up ? "up" : "down"} ${pctTxt} in ${best.min} min`;
  const line2 = `${formatUsd(best.from, lang, 0)} → ${formatUsd(now.spot, lang, 0)} · ${copy.flowNote}`;

  return {
    id: `MOVE-${best.min}-${bucket}`,
    type: "MOVE",
    ts: now.ts,
    line1,
    line2,
    phase: snap.current.id,
    pct: snap.timePct * 100,
    layers: {
      clock: `${snap.dayNumber}/${snap.dayTotal}`,
      analog: copy.flowNote,
      flow: line1,
    },
    seen: false,
    matters: true,
    noise: false,
    extreme: best.extreme,
  };
}
