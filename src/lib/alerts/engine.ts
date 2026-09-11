import type { Lang } from "@/lib/cycle/time";
import { MS_DAY, formatUsdCompact } from "@/lib/cycle/time";
import type { Snapshot } from "@/lib/cycle/model";
import type { RadarReading } from "@/lib/cycle/radar";
import type { AlertItem } from "./types";
import type { Copy } from "@/lib/i18n";
import type { Candle } from "@/lib/price/server";

function idFor(type: AlertItem["type"], bucket: string) {
  return `${type}-${bucket}`;
}

export function seedClockAlerts(
  lang: Lang,
  copy: Copy,
  snap: Snapshot,
  radar: RadarReading,
  existing: AlertItem[],
): AlertItem[] {
  const out: AlertItem[] = [];
  const has = (id: string) => existing.some((a) => a.id === id);

  const analogId = idFor("ANALOG", `${snap.current.id}-${Math.round(snap.timePct * 10)}`);
  if (!has(analogId) && snap.current.id === "c3_down" && snap.drawdownVsAth != null) {
    out.push({
      id: analogId,
      type: "ANALOG",
      ts: Date.now(),
      line1: radar.rank1,
      line2:
        lang === "es"
          ? `${radar.reading} El tiempo se parece a 2022; el precio no.`
          : `${radar.reading} Time looks like 2022; the price does not.`,
      phase: snap.current.id,
      pct: snap.timePct * 100,
      layers: {
        clock: `${snap.dayNumber}/${snap.dayTotal}`,
        analog: radar.rank2,
        flow: copy.flowNote,
      },
      seen: false,
      matters: true,
      noise: false,
    });
  }

  const remainDays = snap.remainingMs / MS_DAY;
  for (const d of [30, 14, 7]) {
    if (remainDays <= d && remainDays > d - 1) {
      const pid = idFor("PRE_TURN", `${snap.current.id}-${d}`);
      if (!has(pid)) {
        out.push({
          id: pid,
          type: "PRE_TURN",
          ts: Date.now(),
          line1:
            lang === "es"
              ? `Pre-giro ${d} días`
              : `Pre-turn ${d} days`,
          line2: copy.turnZone,
          phase: snap.current.id,
          pct: snap.timePct * 100,
          layers: {
            clock: copy.turnZone,
            analog: radar.watch,
            flow: copy.flowNote,
          },
          seen: false,
          matters: true,
          noise: false,
        });
      }
    }
  }

  if (snap.inOfficialWindow) {
    const tid = idFor("TURN", "window");
    if (!has(tid)) {
      out.push({
        id: tid,
        type: "TURN",
        ts: Date.now(),
        line1:
          lang === "es"
            ? "Ventana oficial de suelo 4–17 oct 2026"
            : "Official low window Oct 4–17, 2026",
        line2: copy.candidate,
        phase: snap.current.id,
        pct: snap.timePct * 100,
        layers: {
          clock: copy.turnZone,
          analog: radar.watch,
          flow: copy.flowNote,
        },
        seen: false,
        matters: true,
        noise: false,
      });
    }
  }

  if (snap.missedMap) {
    const mid = idFor("TURN", "missed");
    if (!has(mid)) {
      out.push({
        id: mid,
        type: "TURN",
        ts: Date.now(),
        line1: copy.missedMap,
        line2: copy.modelLowPassed,
        phase: snap.current.id,
        pct: 100,
        layers: {
          clock: copy.missedMap,
          analog: radar.watch,
          flow: copy.flowNote,
        },
        seen: false,
        matters: true,
        noise: false,
        extreme: true,
      });
    }
  }

  return out;
}

export function volumeLabel(
  ratio: number,
  copy: Copy,
  agg: number,
  ext: number,
): string {
  if (ratio >= ext) return copy.volExt;
  if (ratio >= agg) return copy.volAgg;
  if (ratio >= 1.3) return copy.volHigh;
  return copy.volNormal;
}

export function scanFlow(
  lang: Lang,
  copy: Copy,
  snap: Snapshot,
  candles: Candle[],
  opts: {
    volAggressive: number;
    volExtreme: number;
    muteRedBox: boolean;
    existing: AlertItem[];
    spot: number | null;
    ranges: Snapshot["ranges"];
  },
  symbol = "BTC",
): AlertItem[] {
  if (candles.length < 25) return [];
  const last20 = candles.slice(-21, -1);
  const last = candles[candles.length - 1];
  const ma = last20.reduce((s, c) => s + c.volume, 0) / last20.length;
  const ratio = ma > 0 ? last.volume / ma : 1;
  const out: AlertItem[] = [];
  const has = (id: string) => opts.existing.some((a) => a.id === id);

  const hourBucket = Math.floor(Date.now() / (3 * 3600_000));
  const buying = last.close > last.open;
  const selling = last.close < last.open;
  const last3 = candles.slice(-3);
  const buyStreak = last3.filter((c) => c.close > c.open && c.volume > ma * 1.2).length;
  const sellStreak = last3.filter((c) => c.close < c.open && c.volume > ma * 1.2).length;

  const buySellTh = Math.min(1.5, opts.volAggressive);
  const clusterVol = last3.reduce((s, c) => s + c.volume, 0);
  const clusterRatio = ma > 0 ? clusterVol / (ma * 3) : 1;
  const buyHit =
    buying && (ratio >= buySellTh || (clusterRatio >= 1.5 && buyStreak >= 2));
  const sellHit =
    selling && (ratio >= buySellTh || (clusterRatio >= 1.5 && sellStreak >= 2));
  const volHit = !buying && !selling && ratio >= opts.volAggressive;

  if (buyHit || sellHit || volHit) {
    const shown = Math.max(ratio, buyHit || sellHit ? clusterRatio : 0);
    const x = shown.toFixed(1);
    const btc = last.volume > 0 ? last.volume : 0;
    const btcTxt =
      btc >= 10
        ? `${btc.toFixed(0)} ${symbol}`
        : btc >= 1
          ? `${btc.toFixed(1)} ${symbol}`
          : `${btc.toFixed(2)} ${symbol}`;
    const extreme = ratio >= opts.volExtreme || clusterRatio >= opts.volExtreme;
    const side: "BUY" | "SELL" | "VOLUME" = buyHit
      ? "BUY"
      : sellHit
        ? "SELL"
        : "VOLUME";
    const vid = idFor(side, `${hourBucket}`);
    if (!has(vid)) {
      if (side === "BUY") {
        out.push({
          id: vid,
          type: "BUY",
          ts: Date.now(),
          line1:
            lang === "es"
              ? `Están comprando en grande · ${x}×`
              : `They are buying big amounts · ${x}×`,
          line2:
            lang === "es"
              ? `Vela verde: el precio cerró más alto. Volumen ${x}× el promedio (~${btcTxt}).${buyStreak >= 2 ? ` ${buyStreak} velas seguidas de compra.` : ""}`
              : `Green candle: price closed higher. Volume ${x}× the average (~${btcTxt}).${buyStreak >= 2 ? ` ${buyStreak} buying candles in a row.` : ""}`,
          phase: snap.current.id,
          pct: snap.timePct * 100,
          layers: {
            clock: `${snap.dayNumber}/${snap.dayTotal}`,
            analog: lang === "es" ? "Flujo de compra, no analogía." : "Buy flow, not analog.",
            flow:
              lang === "es"
                ? "Muchos están comprando en esta vela."
                : "Many are buying on this candle.",
          },
          seen: false,
          matters: extreme || buyStreak >= 3,
          noise: false,
          extreme,
        });
      } else if (side === "SELL") {
        out.push({
          id: vid,
          type: "SELL",
          ts: Date.now(),
          line1:
            lang === "es"
              ? `Están vendiendo en grande · ${x}×`
              : `They are selling big amounts · ${x}×`,
          line2:
            lang === "es"
              ? `Vela roja: el precio cerró más bajo. Volumen ${x}× el promedio (~${btcTxt}).${sellStreak >= 2 ? ` ${sellStreak} velas seguidas de venta.` : ""}`
              : `Red candle: price closed lower. Volume ${x}× the average (~${btcTxt}).${sellStreak >= 2 ? ` ${sellStreak} selling candles in a row.` : ""}`,
          phase: snap.current.id,
          pct: snap.timePct * 100,
          layers: {
            clock: `${snap.dayNumber}/${snap.dayTotal}`,
            analog: lang === "es" ? "Flujo de venta, no analogía." : "Sell flow, not analog.",
            flow:
              lang === "es"
                ? "Muchos están vendiendo en esta vela."
                : "Many are selling on this candle.",
          },
          seen: false,
          matters: extreme || sellStreak >= 3,
          noise: false,
          extreme,
        });
      } else {
        const label = volumeLabel(ratio, copy, opts.volAggressive, opts.volExtreme);
        out.push({
          id: vid,
          type: "VOLUME",
          ts: Date.now(),
          line1: `${copy.volume} ${label} · ${x}×`,
          line2:
            lang === "es"
              ? `El volumen va ${x}× el promedio reciente: mucho ${symbol} cambió de manos (~${btcTxt}).`
              : `Volume is ${x}× the recent average: a lot of ${symbol} changed hands (~${btcTxt}).`,
          phase: snap.current.id,
          pct: snap.timePct * 100,
          layers: {
            clock: `${snap.dayNumber}/${snap.dayTotal}`,
            analog: lang === "es" ? "Flujo, no analogía." : "Flow, not analog.",
            flow: copy.flowNote,
          },
          seen: false,
          matters: extreme,
          noise: false,
          extreme,
        });
      }
    }
  }

  const sma = last20.reduce((s, c) => s + c.close, 0) / last20.length;
  const closesOutside = candles.slice(-3).filter((c) =>
    snap.bullish ? c.close > sma : c.close < sma,
  ).length;
  const volBurst = candles.slice(-3).filter((c) => c.volume > ma * 1.8).length;
  if (closesOutside >= 2 && volBurst >= 2) {
    const bid = idFor("BREAKOUT", `${hourBucket}`);
    if (!has(bid)) {
      const inRedBox =
        !snap.bullish &&
        opts.spot != null &&
        opts.spot < opts.ranges.mild &&
        opts.spot > opts.ranges.baseLo;
      const trapLikely = inRedBox && opts.muteRedBox && snap.remainingMs > 30 * MS_DAY;
      out.push({
        id: bid,
        type: "BREAKOUT",
        ts: Date.now(),
        line1:
          lang === "es"
            ? `Arranque ${snap.bullish ? "alcista" : "bajista"}`
            : `${snap.bullish ? "Bullish" : "Bearish"} breakout`,
        line2: trapLikely ? copy.trap : copy.flowNote,
        phase: snap.current.id,
        pct: snap.timePct * 100,
        layers: {
          clock: `${snap.dayNumber}/${snap.dayTotal}`,
          analog:
            lang === "es"
              ? "Arranque bajista con −38% = movimiento que faltaba para parecerse a 2022/2018."
              : "Bearish breakout at −38% = the missing move to look like 2022/2018.",
          flow: copy.flowNote,
        },
        seen: false,
        matters: !trapLikely,
        noise: trapLikely,
      });
    }
  }

  if (
    opts.spot != null &&
    opts.spot <= opts.ranges.baseHi &&
    opts.spot >= opts.ranges.baseLo &&
    snap.current.id === "c3_down" &&
    snap.dayNumber < snap.dayTotal
  ) {
    const cid = idFor("TURN", "base-zone");
    if (!has(cid)) {
      out.push({
        id: cid,
        type: "TURN",
        ts: Date.now(),
        line1:
          lang === "es"
            ? `Precio en zona base ${formatUsdCompact(opts.ranges.baseLo, lang)}–${formatUsdCompact(opts.ranges.baseHi, lang)}`
            : `Price in base zone ${formatUsdCompact(opts.ranges.baseLo, lang)}–${formatUsdCompact(opts.ranges.baseHi, lang)}`,
        line2: copy.candidate,
        phase: snap.current.id,
        pct: snap.timePct * 100,
        layers: {
          clock: `${snap.dayNumber}/${snap.dayTotal}`,
          analog: copy.candidate,
          flow: copy.flowNote,
        },
        seen: false,
        matters: true,
        noise: false,
      });
    }
  }

  return out;
}
