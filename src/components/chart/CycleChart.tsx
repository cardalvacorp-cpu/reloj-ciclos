import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  PriceScaleMode,
  TickMarkType,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Copy } from "@/lib/i18n";
import {
  cycleTitle,
  phaseShort,
  type Phase,
  type Snapshot,
} from "@/lib/cycle/model";
import {
  EN_MONTHS,
  ES_MONTHS,
  MS_DAY,
  formatDate,
  formatUsd,
  getZonedParts,
  priceDigits,
  type Lang,
} from "@/lib/cycle/time";
import { getKlines } from "@/lib/price/client";
import { CycleBandsPrimitive } from "@/lib/chart/cycle-bands";
import { cn } from "@/lib/utils";

function timeToMs(time: Time): number | null {
  if (typeof time === "number" && Number.isFinite(time)) {
    return time > 1e12 ? time : time * 1000;
  }
  if (typeof time === "object" && time && "year" in time) {
    return Date.UTC(time.year, time.month - 1, time.day);
  }
  return null;
}

function formatTick(time: Time, type: TickMarkType, lang: Lang, tz: string): string {
  const ms = timeToMs(time);
  if (ms == null) return "";
  const p = getZonedParts(ms, tz);
  const mon = (lang === "es" ? ES_MONTHS : EN_MONTHS)[p.month - 1];
  const y = p.year;
  const day = p.day;
  if (type === TickMarkType.Year) return String(y);
  if (type === TickMarkType.Month) return `${mon} ${y}`;
  return `${day} ${mon} ${y}`;
}

function colorOf(kind: Phase["kind"]): string {
  if (kind === "up") return "#1B7A4E";
  if (kind === "down") return "#B03A2E";
  return "#C9A227";
}

function signOf(kind: Phase["kind"]): number {
  if (kind === "up") return 1;
  if (kind === "down") return -1;
  return 0.45;
}

function barsFor(phases: Phase[], nowMs: number) {
  const step = 7 * MS_DAY;
  const rows: Array<{ time: UTCTimestamp; value: number; color: string }> = [];
  const seen = new Set<number>();
  for (const p of phases) {
    const color = colorOf(p.kind);
    const value = signOf(p.kind);
    for (let t = p.startMs; t < p.endMs; t += step) {
      const sec = Math.floor(t / 1000);
      if (seen.has(sec)) continue;
      seen.add(sec);
      rows.push({ time: sec as UTCTimestamp, value, color });
    }
    const endSec = Math.floor((p.endMs - MS_DAY) / 1000);
    if (!seen.has(endSec) && p.endMs > p.startMs) {
      seen.add(endSec);
      rows.push({ time: endSec as UTCTimestamp, value, color });
    }
  }
  rows.sort((a, b) => (a.time as number) - (b.time as number));
  const nowSec = Math.floor(nowMs / 1000);
  let best = -1;
  let dist = Infinity;
  for (let i = 0; i < rows.length; i++) {
    const d = Math.abs((rows[i].time as number) - nowSec);
    if (d < dist) {
      dist = d;
      best = i;
    }
  }
  if (best >= 0) rows[best] = { ...rows[best], color: "#F7F4EA" };
  return rows;
}

function bumpZoom(chart: IChartApi, factor: number) {
  const ts = chart.timeScale();
  const r = ts.getVisibleLogicalRange();
  if (!r) return;
  const mid = (r.from + r.to) / 2;
  const half = Math.max(2, ((r.to - r.from) / 2) * factor);
  ts.setVisibleLogicalRange({ from: mid - half, to: mid + half });
}

const INTERACT = {
  handleScroll: {
    mouseWheel: true,
    pressedMouseMove: true,
    horzTouchDrag: true,
    vertTouchDrag: false,
  },
  handleScale: {
    axisPressedMouseMove: { time: true, price: true },
    axisDoubleClickReset: true,
    pinch: true,
    mouseWheel: true,
  },
  kineticScroll: { touch: true, mouse: false },
};

export function CycleChart({
  lang,
  tz,
  copy,
  snap,
  nowMs,
  landscape,
  coinId,
}: {
  lang: Lang;
  tz: string;
  copy: Copy;
  snap: Snapshot;
  nowMs: number;
  landscape?: boolean;
  coinId?: import("@/lib/coins/catalog").CoinId;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [pick, setPick] = useState<Phase | null>(null);
  const [hud, setHud] = useState<{ date: string; price: string } | null>(null);
  const phase = pick ?? snap.current;

  const phaseKey = snap.phases
    .map((p) => `${p.id}:${p.startMs}:${p.endMs}`)
    .join("|");

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let dead = false;
    const chart = createChart(el, {
      width: el.clientWidth,
      height: Math.max(landscape ? 180 : 280, el.clientHeight),
      layout: {
        background: { type: ColorType.Solid, color: "#122844" },
        textColor: "#C9C3B0",
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: 12,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(247,244,234,0.06)" },
        horzLines: { color: "rgba(247,244,234,0.06)" },
      },
      rightPriceScale: {
        borderColor: "rgba(247,244,234,0.12)",
        mode: PriceScaleMode.Logarithmic,
        scaleMargins: { top: 0.04, bottom: 0.28 },
      },
      timeScale: {
        borderColor: "rgba(247,244,234,0.12)",
        timeVisible: true,
        rightOffset: 4,
        minBarSpacing: 0.5,
        tickMarkFormatter: (time: Time, type: TickMarkType) =>
          formatTick(time, type, lang, tz),
      },
      localization: {
        locale: lang === "es" ? "es-MX" : "en-US",
        dateFormat: lang === "es" ? "dd MMM yyyy" : "MMM dd, yyyy",
      },
      autoSize: false,
      crosshair: {
        vertLine: { color: "#C9A227", labelVisible: true },
        horzLine: { color: "#C9A227", labelVisible: true },
      },
      ...INTERACT,
    });
    const bands = new CycleBandsPrimitive();
    bands.setPhases(snap.phases, lang);
    chart.panes()[0]?.attachPrimitive(bands);
    const candles = chart.addSeries(CandlestickSeries, {
      upColor: "#1B7A4E",
      downColor: "#B03A2E",
      borderVisible: false,
      wickUpColor: "#1B7A4E",
      wickDownColor: "#B03A2E",
      priceLineVisible: true,
      lastValueVisible: true,
    });
    const cycle = chart.addSeries(HistogramSeries, {
      priceScaleId: "cycle",
      priceLineVisible: false,
      lastValueVisible: false,
      base: 0,
    });
    chart.priceScale("cycle").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
      borderVisible: false,
      visible: false,
    });
    cycle.setData(barsFor(snap.phases, nowMs));

    const markers = snap.phases.flatMap((p) => {
      const color = colorOf(p.kind);
      const start = Math.floor(p.startMs / 1000) as UTCTimestamp;
      const end = Math.floor((p.endMs - MS_DAY) / 1000) as UTCTimestamp;
      const up = p.kind === "up";
      return [
        {
          time: start,
          position: up ? ("aboveBar" as const) : ("belowBar" as const),
          color,
          shape: up ? ("arrowUp" as const) : ("arrowDown" as const),
          text: `${phaseShort(p, lang)} · ${formatDate(p.startMs, lang, tz)}`,
          size: 1.1,
        },
        {
          time: end,
          position: up ? ("aboveBar" as const) : ("belowBar" as const),
          color,
          shape: "circle" as const,
          text: `${copy.cycleEnd} ${formatDate(p.endMs, lang, tz)}`,
          size: 0.8,
        },
      ];
    });
    createSeriesMarkers(cycle, markers);

    const cur = snap.current;
    const pad = 80 * MS_DAY;
    const showRange = () => {
      chart.timeScale().setVisibleRange({
        from: Math.floor((cur.startMs - pad) / 1000) as UTCTimestamp,
        to: Math.floor((Math.min(nowMs, cur.endMs) + pad) / 1000) as UTCTimestamp,
      });
    };

    void (async () => {
      try {
        const start = snap.phases.find((p) => p.id === "c1_up")?.startMs
          ?? snap.phases[0].startMs;
        const res = await getKlines("1D", start, Date.now(), coinId ?? "BTC");
        if (dead) return;
        candles.setData(
          res.candles.map((c) => ({
            time: c.time as UTCTimestamp,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          })),
        );
        showRange();
      } catch {
        showRange();
      }
    })();

    chart.subscribeClick((param) => {
      const ms = param.time != null ? timeToMs(param.time as Time) : null;
      if (ms == null) return;
      const hit =
        snap.phases.find((p) => ms >= p.startMs && ms < p.endMs) ?? null;
      if (hit) setPick(hit);
    });
    chart.subscribeCrosshairMove((param) => {
      const ms = param.time != null ? timeToMs(param.time as Time) : null;
      const bar = param.seriesData.get(candles) as
        | { close?: number; time?: Time }
        | undefined;
      if (ms == null || bar?.close == null) {
        setHud(null);
        return;
      }
      setHud({
        date: formatDate(ms, lang, tz),
        price: formatUsd(bar.close, lang, priceDigits(bar.close)),
      });
    });

    const ro = new ResizeObserver(() => {
      if (dead || !el.isConnected) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 40 || h < 80) return;
      chart.resize(w, h, true);
    });
    ro.observe(el);
    chartRef.current = chart;

    return () => {
      dead = true;
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, tz, landscape, phaseKey, snap.current.id, coinId]);

  const wide = Boolean(landscape);
  const zoom = (factor: number) => {
    const c = chartRef.current;
    if (c) bumpZoom(c, factor);
  };
  const reset = () => {
    const c = chartRef.current;
    if (!c) return;
    const pad = 80 * MS_DAY;
    c.timeScale().setVisibleRange({
      from: Math.floor((phase.startMs - pad) / 1000) as UTCTimestamp,
      to: Math.floor((Math.min(nowMs, phase.endMs) + pad) / 1000) as UTCTimestamp,
    });
  };

  return (
    <div className={cn("flex flex-col", wide ? "min-h-0 flex-1 gap-1" : "gap-3")}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-navy-card px-2.5 py-1 text-xs">
          <span className="size-2.5 rounded-sm bg-green" />
          {copy.up}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-navy-card px-2.5 py-1 text-xs">
          <span className="size-2.5 rounded-sm bg-red" />
          {copy.down}
        </span>
        <button
          type="button"
          onClick={() => zoom(0.6)}
          className="min-h-9 min-w-9 rounded-md bg-navy-card text-lg text-cream"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoom(1.6)}
          className="min-h-9 min-w-9 rounded-md bg-navy-card text-lg text-cream"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          onClick={reset}
          className="min-h-9 rounded-md bg-navy-card px-2.5 text-xs text-cream"
        >
          {copy.presets.phase}
        </button>
        <button
          type="button"
          onClick={reset}
          className="min-h-9 rounded-md bg-gold px-2.5 text-xs font-semibold uppercase tracking-wide text-navy"
        >
          {copy.now}
        </button>
      </div>

      <div className={cn("relative min-h-0 overflow-hidden rounded-xl bg-navy-card", wide && "flex-1")}>
        <div
          ref={wrapRef}
          className={cn(
            "w-full touch-none",
            wide ? "h-[calc(100dvh-11rem)] min-h-[140px]" : "h-[min(52dvh,440px)] min-h-[300px]",
          )}
        />
        {hud && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-navy/85 px-2.5 py-1.5 font-mono text-xs tabular text-cream">
            {hud.date}
            <span className="ml-2 text-gold">{hud.price}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-cream-faint">{copy.cycleHint}</p>

      <div
        className="rounded-xl border px-4 py-3"
        style={{ borderColor: colorOf(phase.kind) }}
      >
        <p className="font-display text-lg text-cream">{cycleTitle(phase, lang)}</p>
        <p className="mt-2 font-mono text-sm tabular text-cream">
          {copy.cycleStart} · {formatDate(phase.startMs, lang, tz)}
        </p>
        <p className="font-mono text-sm tabular text-cream">
          {copy.cycleEnd} · {formatDate(phase.endMs, lang, tz)}
        </p>
        {phase.inProgress && (
          <p className="mt-1 text-sm text-gold">
            {copy.youAreHere} · {snap.dayNumber} / {snap.dayTotal}
          </p>
        )}
        {phase.future && (
          <p className="mt-1 text-xs text-cream-faint">{copy.future}</p>
        )}
      </div>
    </div>
  );
}
