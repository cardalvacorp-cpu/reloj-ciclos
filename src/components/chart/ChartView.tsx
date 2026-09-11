import { useCallback, useEffect, useRef, useState, Fragment } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineSeries,
  CrosshairMode,
  PriceScaleMode,
  TickMarkType,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Copy } from "@/lib/i18n";
import { cycleTitle, lastFrozenDown, type Snapshot } from "@/lib/cycle/model";
import { CycleBandsPrimitive } from "@/lib/chart/cycle-bands";
import {
  buildTargets,
  bullLadder,
  bearLadder,
  targetTfForChart,
  type TfTarget,
  type TargetStep,
} from "@/lib/chart/targets";
import { chartLegend } from "@/lib/chart/legend";
import type { CoinSpec } from "@/lib/coins/catalog";
import {
  EN_MONTHS,
  ES_MONTHS,
  formatDate,
  formatPct,
  formatUsd,
  getZonedParts,
  priceDigits,
  type Lang,
} from "@/lib/cycle/time";
import { cacheKlines, getKlines, readCachedKlines } from "@/lib/price/client";
import type { Candle, Ticker } from "@/lib/price/fetchers";
import { barOpenTime } from "@/lib/price/live";
import { cn } from "@/lib/utils";
import { CycleChart } from "@/components/chart/CycleChart";

const TFS = ["1m", "5m", "15m", "30m", "1h", "4h", "1D", "1W"] as const;
type Tf = (typeof TFS)[number];
type Preset = "phase" | "c3" | "from2015" | "genesis" | "to2038";

function tfForPreset(preset: Preset, tf: Tf): Tf {
  if (preset === "genesis" || preset === "to2038" || preset === "from2015") {
    if (tf === "1m" || tf === "5m" || tf === "15m" || tf === "30m") return "1D";
  }
  return tf;
}

function timeToMs(time: Time): number | null {
  if (typeof time === "number" && Number.isFinite(time)) {
    return time > 1e12 ? time : time * 1000;
  }
  if (typeof time === "object" && time && "year" in time) {
    return Date.UTC(time.year, time.month - 1, time.day);
  }
  return null;
}

function zonedParts(ms: number, tz: string) {
  const p = getZonedParts(ms, tz);
  return { y: p.year, m: p.month - 1, d: p.day, h: p.hour, min: p.minute };
}

function monthYear(ms: number, lang: Lang, tz: string): string {
  const p = zonedParts(ms, tz);
  const mon = (lang === "es" ? ES_MONTHS : EN_MONTHS)[p.m];
  return `${mon} ${p.y}`;
}

function dayMonthYear(ms: number, lang: Lang, tz: string): string {
  const p = zonedParts(ms, tz);
  const mon = (lang === "es" ? ES_MONTHS : EN_MONTHS)[p.m];
  return lang === "es" ? `${p.d} ${mon} ${p.y}` : `${mon} ${p.d}, ${p.y}`;
}

function formatTick(time: Time, type: TickMarkType, lang: Lang, tz: string): string {
  const ms = timeToMs(time);
  if (ms == null) return "";
  const p = zonedParts(ms, tz);
  const mon = (lang === "es" ? ES_MONTHS : EN_MONTHS)[p.m];
  if (type === TickMarkType.Year) return String(p.y);
  if (type === TickMarkType.Month) return `${mon} ${p.y}`;
  if (type === TickMarkType.Time || type === TickMarkType.TimeWithSeconds) {
    const hh = String(p.h).padStart(2, "0");
    const mm = String(p.min).padStart(2, "0");
    return `${p.d} ${mon} ${p.y} ${hh}:${mm}`;
  }
  return `${p.d} ${mon} ${p.y}`;
}

function formatVisibleRange(from: Time, to: Time, lang: Lang, tz: string): string {
  const a = timeToMs(from);
  const b = timeToMs(to);
  if (a == null || b == null) return "";
  const left = dayMonthYear(a, lang, tz);
  const right = dayMonthYear(b, lang, tz);
  const sameMonth = monthYear(a, lang, tz) === monthYear(b, lang, tz);
  if (sameMonth) return `${left} · ${monthYear(a, lang, tz)}`;
  return `${left}  →  ${right}`;
}

function refreshMs(tf: Tf): number {
  if (tf === "1m") return 30_000;
  if (tf === "5m" || tf === "15m" || tf === "30m") return 45_000;
  return 60_000;
}

function applySpot(last: Candle, spot: number, tf: Tf, nowMs: number): Candle {
  const t = barOpenTime(tf, nowMs, last.time);
  if (t > last.time) {
    return {
      time: t,
      open: last.close,
      high: Math.max(last.close, spot),
      low: Math.min(last.close, spot),
      close: spot,
      volume: 0,
    };
  }
  return {
    ...last,
    high: Math.max(last.high, spot),
    low: Math.min(last.low, spot),
    close: spot,
  };
}

export function ChartView({
  lang,
  tz,
  copy,
  snap,
  ticker,
  frozen,
  live,
  nowMs,
  showRanges,
  active,
  landscape,
  coin,
}: {
  lang: Lang;
  tz: string;
  copy: Copy;
  snap: Snapshot;
  ticker: Ticker | null;
  frozen: boolean;
  live: boolean;
  nowMs: number;
  showRanges: boolean;
  active: boolean;
  landscape?: boolean;
  coin: CoinSpec;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const g1Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const g2Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const todayLineRef = useRef<IPriceLine | null>(null);
  const bullLineRef = useRef<IPriceLine | null>(null);
  const bearLineRef = useRef<IPriceLine | null>(null);
  const focusLineRef = useRef<IPriceLine | null>(null);
  const lastBarRef = useRef<Candle | null>(null);
  const nowMarkersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const tickerRef = useRef(ticker);
  tickerRef.current = ticker;
  const [tf, setTf] = useState<Tf>("1D");
  const [preset, setPreset] = useState<Preset>("phase");
  const [log, setLog] = useState(false);
  const [kind, setKind] = useState<
    "now" | "map" | "analog" | "all" | "cycle" | "epoch"
  >("now");
  const overlay: "easy" | "map" | "ghosts" | "all" =
    kind === "map" ? "map" : kind === "analog" ? "ghosts" : kind === "all" ? "all" : "easy";
  const mode = kind === "cycle" ? "cycle" : "price";
  const [source, setSource] = useState("BTC-USD");
  const [loading, setLoading] = useState(true);
  const [bars, setBars] = useState(0);
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0);
  const [axisRange, setAxisRange] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [targets, setTargets] = useState<TfTarget[]>([]);
  const [focusSide, setFocusSide] = useState<"bull" | "bear" | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const targetsRef = useRef<TfTarget[]>([]);
  targetsRef.current = targets;
  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;
  const kindRef = useRef(kind);
  kindRef.current = kind;
  const wideRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const usedTf = kind === "epoch" ? "1D" : tfForPreset(preset, tf);
  const logScale =
    usedTf === "1D" || usedTf === "1W" ? kind === "all" || log : false;
  const c3DownStart = snap.phases.find((p) => p.id === "c3_down")!.startMs;
  const c3DownEnd = snap.phases.find((p) => p.id === "c3_down")!.endMs;
  const c3UpStart = snap.phases.find((p) => p.id === "c3_up")?.startMs ?? snap.phases[0].startMs;
  const c1UpStart = snap.phases.find((p) => p.id === "c1_up")?.startMs ?? snap.phases[0].startMs;
  const genesisStart = snap.phases[0].startMs;
  const lastEnd = snap.phases[snap.phases.length - 1].endMs;
  const phaseStart = snap.current.startMs;
  const phaseEnd = snap.current.endMs;
  const ath = snap.ranges.ath;
  const retry = useCallback(() => setTick((n) => n + 1), []);
  const wide = Boolean(landscape) || expanded;
  wideRef.current = wide;

  const exitExpanded = useCallback(() => {
    setExpanded(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
    try {
      const orient = screen.orientation as unknown as { unlock?: () => void };
      orient.unlock?.();
    } catch {
      /* ignore */
    }
  }, []);

  const enterExpanded = useCallback(async () => {
    setExpanded(true);
    const box = cardRef.current;
    try {
      await box?.requestFullscreen?.();
    } catch {
      /* iOS: CSS overlay */
    }
    try {
      const orient = screen.orientation as unknown as {
        lock?: (mode: string) => Promise<void>;
      };
      await orient.lock?.("landscape");
    } catch {
      /* not allowed outside fullscreen */
    }
  }, []);

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setExpanded(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const rangeFor = useCallback(
    (now: number) =>
      kind === "epoch"
        ? { start: phaseStart, end: Math.max(now, phaseEnd) }
        : preset === "phase"
        ? {
            start: phaseStart - 280 * 86_400_000,
            end: Math.max(now, phaseEnd),
          }
        : preset === "c3"
          ? { start: c3UpStart, end: Math.max(now, c3UpStart + 86_400_000) }
          : preset === "from2015"
            ? { start: c1UpStart, end: now }
            : preset === "genesis"
              ? { start: genesisStart, end: now }
              : { start: c1UpStart, end: Math.min(now, lastEnd) },
    [kind, preset, phaseStart, phaseEnd, c3UpStart, c1UpStart, genesisStart, lastEnd],
  );

  const applyTargetLines = useCallback(() => {
    const series = candleRef.current;
    const row = targetsRef.current.find((t) => t.tf === targetTfForChart(usedTf));
    if (!series || !row) return;
    const bullTitle = `▲ ${row.bullFib}`;
    const bearTitle = `▼ ${row.bearFib}`;
    if (!bullLineRef.current) {
      bullLineRef.current = series.createPriceLine({
        price: row.bull,
        color: "#1B7A4E",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: bullTitle,
      });
    } else {
      bullLineRef.current.applyOptions({ price: row.bull, title: bullTitle });
    }
    if (!bearLineRef.current) {
      bearLineRef.current = series.createPriceLine({
        price: row.bear,
        color: "#B03A2E",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: bearTitle,
      });
    } else {
      bearLineRef.current.applyOptions({ price: row.bear, title: bearTitle });
    }
  }, [usedTf]);

  useEffect(() => {
    if (mode !== "price" || !active) return;
    let cancelled = false;
    const now = Date.now();
    void (async () => {
      try {
        const [m5, h1, d1] = await Promise.all([
          getKlines("5m", now - 2 * 86_400_000, now, coin.id).catch(() => null),
          getKlines("1h", now - 21 * 86_400_000, now, coin.id).catch(() => null),
          getKlines("1D", now - 800 * 86_400_000, now, coin.id).catch(() => null),
        ]);
        if (cancelled) return;
        setTargets(
          buildTargets(
            {
              m5: m5?.candles,
              h1: h1?.candles,
              d1: d1?.candles,
            },
            {
              down: !snap.bullish,
              ath: snap.ranges.ath,
              cycleLow:
                lastFrozenDown(snap.phases)?.priceEnd ??
                snap.ranges.lowUsed,
              spot: tickerRef.current?.spot ?? null,
            },
          ),
        );
      } catch {
        /* keep last table */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, active, Math.floor(nowMs / 180_000), coin.id]);

  useEffect(() => {
    applyTargetLines();
  }, [targets, applyTargetLines, tick]);

  useEffect(() => {
    if (mode !== "price") return;
    const el = wrapRef.current;
    if (!el) return;
    let cancelled = false;
    let chart: IChartApi | null = null;
    let created = false;
    todayLineRef.current = null;
    lastBarRef.current = null;
    nowMarkersRef.current = null;

    const paint = (raw: Candle[]) => {
      if (cancelled || !candleRef.current || !volRef.current) return;
      const spot = tickerRef.current?.spot;
      let capped = raw.filter((c) => c.time * 1000 <= Date.now() + 180_000);
      if (capped.length < 2) {
        setBars(0);
        return;
      }
      if (spot) {
        const last = capped[capped.length - 1];
        capped = [...capped.slice(0, -1), applySpot(last, spot, usedTf, Date.now())];
      }
      try {
        candleRef.current.setData(
          capped.map((c) => ({
            time: c.time as UTCTimestamp,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          })),
        );
        const maN = 20;
        volRef.current.setData(
          capped.map((c, i) => {
            const slice = capped.slice(Math.max(0, i - maN), i);
            const ma =
              slice.length > 0
                ? slice.reduce((s, x) => s + x.volume, 0) / slice.length
                : c.volume;
            const ratio = ma > 0 ? c.volume / ma : 1;
            const color =
              ratio >= 3
                ? "#C9A227"
                : ratio >= 2
                  ? "rgba(201,162,39,0.7)"
                  : c.close >= c.open
                    ? "rgba(27,122,78,0.45)"
                    : "rgba(176,58,46,0.45)";
            return { time: c.time as UTCTimestamp, value: c.volume, color };
          }),
        );
        const span = snap.dayTotal * 86400;
        const toGhost = (pts: Array<[number, number]>) =>
          pts
            .map(([t, px]) => ({
              time: Math.floor(c3DownStart / 1000 + t * span) as UTCTimestamp,
              value: px,
            }))
            .filter((p) => p.time * 1000 <= Date.now() + 86400000);
        const showGhosts =
          overlayRef.current === "ghosts" || overlayRef.current === "all";
        const showMapLines =
          overlayRef.current === "map" || overlayRef.current === "all";
        g1Ref.current?.setData(showGhosts ? toGhost(coin.ghostC1) : []);
        g2Ref.current?.setData(showGhosts ? toGhost(coin.ghostC2) : []);
        g1Ref.current?.applyOptions({
          visible: showGhosts,
          lastValueVisible: showGhosts,
        });
        g2Ref.current?.applyOptions({
          visible: showGhosts,
          lastValueVisible: showGhosts,
        });
        if (
          showMapLines &&
          showRanges &&
          candleRef.current &&
          !todayLineRef.current
        ) {
          const lines =
            overlayRef.current === "all"
              ? [
                  { price: ath, color: "#C9A227", title: "ATH" },
                  { price: snap.ranges.mild, color: "#C9C3B0", title: "−50%" },
                  { price: snap.ranges.baseHi, color: "#1B7A4E", title: "base" },
                  { price: snap.ranges.baseLo, color: "#1B7A4E", title: "" },
                  { price: snap.ranges.sevHi, color: "#B03A2E", title: "sev" },
                  { price: snap.ranges.sevLo, color: "#B03A2E", title: "" },
                ]
              : [
                  { price: ath, color: "#C9A227", title: "ATH" },
                  { price: snap.ranges.mild, color: "#C9C3B0", title: "−50%" },
                  { price: snap.ranges.baseHi, color: "#1B7A4E", title: "−70%" },
                  { price: snap.ranges.baseLo, color: "#1B7A4E", title: "−77%" },
                  { price: snap.ranges.sevHi, color: "#B03A2E", title: "−80%" },
                  { price: snap.ranges.sevLo, color: "#B03A2E", title: "−85%" },
                ];
          for (const l of lines) {
            candleRef.current.createPriceLine({
              price: l.price,
              color: l.color,
              lineWidth: 1,
              lineStyle: 2,
              axisLabelVisible: true,
              title: l.title,
            });
          }
        }
        const last = capped[capped.length - 1];
        lastBarRef.current = last;
        const livePx = spot ?? last.close;
        if (!todayLineRef.current) {
          todayLineRef.current = candleRef.current.createPriceLine({
            price: livePx,
            color: "#F7F4EA",
            lineWidth: 2,
            lineStyle: 0,
            axisLabelVisible: true,
            title: copy.live,
          });
        } else {
          todayLineRef.current.applyOptions({ price: livePx });
        }
        if (candleRef.current) {
          const markers =
            nowMarkersRef.current ??
            createSeriesMarkers(candleRef.current, []);
          nowMarkersRef.current = markers;
          markers.setMarkers([
            {
              time: last.time as UTCTimestamp,
              position: "aboveBar",
              color: "#C9A227",
              shape: "arrowDown",
              text: copy.now,
            },
          ]);
        }
        chartRef.current?.timeScale().fitContent();
        if (kindRef.current === "epoch") {
          const remainBars = Math.max(
            2,
            Math.round((phaseEnd - Date.now()) / 86_400_000),
          );
          chartRef.current?.timeScale().applyOptions({
            rightOffset: Math.min(420, remainBars),
          });
          chartRef.current?.timeScale().fitContent();
        }
        const vis = chartRef.current?.timeScale().getVisibleRange();
        if (vis) setAxisRange(formatVisibleRange(vis.from, vis.to, lang, tz));
        setBars(capped.length);
        setFailed(false);
        applyTargetLines();
        const fib = targetsRef.current.find((t) => t.tf === targetTfForChart(usedTf));
        if (
          overlayRef.current === "easy" &&
          !wideRef.current &&
          candleRef.current &&
          livePx
        ) {
          const top = Math.max(livePx * 1.05, fib?.bull ?? livePx);
          const bot = Math.min(livePx * 0.95, fib?.bear ?? livePx);
          candleRef.current.applyOptions({
            autoscaleInfoProvider: () => ({
              priceRange: { minValue: bot * 0.985, maxValue: top * 1.015 },
            }),
          });
          chartRef.current?.priceScale("right").applyOptions({
            mode: PriceScaleMode.Normal,
            autoScale: true,
          });
        }
      } catch {
        setFailed(true);
      }
    };

    const load = async () => {
      const now = Date.now();
      const range = rangeFor(now);
      const key = `${usedTf}-${range.start}-${Math.floor(range.end / 86_400_000)}`;
      const cached = readCachedKlines(key, coin.id);
      if (cached) {
        paint(cached.candles);
        setSource(cached.source);
        setLoading(false);
      }
      try {
        const res = await getKlines(usedTf, range.start, Math.max(range.end, now), coin.id);
        if (cancelled) return;
        cacheKlines(key, res.candles, res.source, coin.id);
        setSource(res.source);
        paint(res.candles);
        if (res.candles.length < 3) setFailed(true);
      } catch {
        if (!cancelled && !cached) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const boot = () => {
      if (cancelled || created) return;
      if (el.clientWidth < 40 || el.clientHeight < 80) return;
      created = true;
      chart = createChart(el, {
        width: el.clientWidth,
        height: Math.max(280, el.clientHeight),
        layout: {
          background: {
            type: ColorType.Solid,
            color:
              kind === "epoch"
                ? snap.bullish
                  ? "#102a22"
                  : "#2a1418"
                : "#122844",
          },
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
          mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
          scaleMargins: { top: 0.06, bottom: 0.08 },
        },
        timeScale: {
          borderColor: "rgba(247,244,234,0.12)",
          timeVisible: true,
          secondsVisible: usedTf === "1m",
          rightOffset: 6,
          minBarSpacing: 3,
          tickMarkFormatter: (time: Time, type: TickMarkType) =>
            formatTick(time, type, lang, tz),
        },
        localization: {
          locale: lang === "es" ? "es-MX" : "en-US",
          dateFormat: lang === "es" ? "dd MMM yyyy" : "MMM dd, yyyy",
        },
        autoSize: false,
        crosshair: {
          mode: CrosshairMode.Magnet,
          vertLine: {
            color: "#C9A227",
            width: 1,
            labelBackgroundColor: "#C9A227",
          },
          horzLine: {
            color: "#C9A227",
            width: 1,
            labelBackgroundColor: "#C9A227",
          },
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: wideRef.current,
        },
        handleScale: {
          axisPressedMouseMove: { time: true, price: true },
          axisDoubleClickReset: { time: true, price: true },
          pinch: true,
          mouseWheel: true,
        },
        kineticScroll: { touch: true, mouse: true },
      });
      const bands = new CycleBandsPrimitive();
      bands.setPhases(snap.phases, lang);
      chart.panes()[0]?.attachPrimitive(bands);
      const candle = chart.addSeries(CandlestickSeries, {
        upColor: "#1B7A4E",
        downColor: "#B03A2E",
        borderVisible: false,
        wickUpColor: "#1B7A4E",
        wickDownColor: "#B03A2E",
        lastValueVisible: true,
        autoscaleInfoProvider: (orig: () => { priceRange?: { minValue: number; maxValue: number } } | null) => {
          if (overlayRef.current !== "easy" || wideRef.current) return orig();
          const px = tickerRef.current?.spot ?? lastBarRef.current?.close;
          const fib = targetsRef.current.find(
            (t) => t.tf === targetTfForChart(usedTf),
          );
          if (!px) return orig();
          const top = Math.max(px * 1.04, fib?.bull ?? px) * 1.012;
          const bot = Math.min(px * 0.96, fib?.bear ?? px) * 0.988;
          return { priceRange: { minValue: bot, maxValue: top } };
        },
      });
      const vol = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "vol",
        lastValueVisible: false,
      });
      chart.priceScale("vol").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      });
      const g1 = chart.addSeries(LineSeries, {
        color: "rgba(176,58,46,0.55)",
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "2018",
        autoscaleInfoProvider: (
          base: () => { priceRange?: { minValue: number; maxValue: number } } | null,
        ) => (overlayRef.current === "all" ? base() : null),
      });
      const g2 = chart.addSeries(LineSeries, {
        color: "rgba(199,162,39,0.7)",
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "2022",
        autoscaleInfoProvider: (
          base: () => { priceRange?: { minValue: number; maxValue: number } } | null,
        ) => (overlayRef.current === "all" ? base() : null),
      });
      chartRef.current = chart;
      candleRef.current = candle;
      volRef.current = vol;
      g1Ref.current = g1;
      g2Ref.current = g2;
      const onRange = (
        range: { from: Time; to: Time } | null,
      ) => {
        if (!range) return;
        setAxisRange(formatVisibleRange(range.from, range.to, lang, tz));
      };
      chart.timeScale().subscribeVisibleTimeRangeChange(onRange);
      void load();
    };

    const ro = new ResizeObserver(() => {
      if (chart) {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (w > 40 && h > 80) chart.resize(w, h);
      } else {
        boot();
      }
    });
    ro.observe(el);
    boot();
    const raf = requestAnimationFrame(boot);
    const poll = window.setInterval(() => void load(), refreshMs(usedTf));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearInterval(poll);
      ro.disconnect();
      chart?.remove();
      chartRef.current = null;
      candleRef.current = null;
      volRef.current = null;
      g1Ref.current = null;
      g2Ref.current = null;
      todayLineRef.current = null;
      bullLineRef.current = null;
      bearLineRef.current = null;
      focusLineRef.current = null;
      lastBarRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usedTf, logScale, lang, preset, showRanges, tick, rangeFor, ath, c3DownStart, mode, overlay, kind, snap.bullish, phaseEnd, coin.id]);

  useEffect(() => {
    if (!active) return;
    const el = wrapRef.current;
    const chart = chartRef.current;
    if (!el || !chart) return;
    chart.applyOptions({
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: wide,
      },
    });
    const id = requestAnimationFrame(() => {
      if (el.clientWidth > 40 && el.clientHeight > 80) {
        chart.resize(el.clientWidth, el.clientHeight);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [active, wide]);

  useEffect(() => {
    const spot = ticker?.spot;
    const candle = candleRef.current;
    const last = lastBarRef.current;
    if (!spot || !candle || !last) return;
    const next = applySpot(last, spot, usedTf, Date.now());
    lastBarRef.current = next;
    try {
      candle.update({
        time: next.time as UTCTimestamp,
        open: next.open,
        high: next.high,
        low: next.low,
        close: next.close,
      });
      todayLineRef.current?.applyOptions({ price: spot });
    } catch {
      /* new bar not on scale yet; next kline refresh will land it */
    }
  }, [ticker?.spot, usedTf]);

  const dd = snap.drawdownVsAth;
  const spot = ticker?.spot ?? lastBarRef.current?.close ?? null;
  const px = priceDigits(spot ?? coin.defaultModel.athUsd);
  const fibNow = targets.find((t) => t.tf === targetTfForChart(usedTf)) ?? null;
  const upSteps = spot != null ? bullLadder(spot, fibNow, ath) : [];
  const downSteps = spot != null ? bearLadder(spot, fibNow, snap.ranges) : [];

  const showNext = (side: "bull" | "bear") => {
    const steps = side === "bull" ? upSteps : downSteps;
    if (!steps.length) return;
    const idx = focusSide === side ? (focusIdx + 1) % steps.length : 0;
    setFocusSide(side);
    setFocusIdx(idx);
    const step = steps[idx];
    const series = candleRef.current;
    if (!series) return;
    const color = side === "bull" ? "#1B7A4E" : "#B03A2E";
    const title = side === "bull" ? `▲ ${step.tag}` : `▼ ${step.tag}`;
    if (!focusLineRef.current) {
      focusLineRef.current = series.createPriceLine({
        price: step.price,
        color,
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title,
      });
    } else {
      focusLineRef.current.applyOptions({ price: step.price, color, title });
    }
    const px = tickerRef.current?.spot ?? lastBarRef.current?.close ?? step.price;
    const top = Math.max(px, step.price) * 1.04;
    const bot = Math.min(px, step.price) * 0.96;
    series.applyOptions({
      autoscaleInfoProvider: () => ({
        priceRange: { minValue: bot, maxValue: top },
      }),
    });
  };

  const focusStep: TargetStep | null =
    focusSide === "bull"
      ? (upSteps[focusIdx] ?? null)
      : focusSide === "bear"
        ? (downSteps[focusIdx] ?? null)
        : null;

  return (
    <div
      className={cn(
        "flex flex-col",
        wide ? "min-h-0 flex-1 gap-1 pb-0" : "gap-3 pb-8",
        expanded &&
          "fixed inset-0 z-50 bg-navy p-[max(8px,env(safe-area-inset-top))_max(8px,env(safe-area-inset-right))_max(8px,env(safe-area-inset-bottom))_max(8px,env(safe-area-inset-left))]",
      )}
    >
      <div
        className={cn(
          wide
            ? "flex gap-1 overflow-x-auto pb-0.5"
            : "grid grid-cols-2 gap-1.5",
        )}
      >
        {(
          [
            ["now", copy.chartEasy],
            ["map", copy.chartMapLines],
            ["analog", copy.chartGhostsOn],
            ["all", copy.chartAll],
            ["cycle", copy.chartCycle],
            ["epoch", copy.chartEpoch(snap.bullish)],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setKind(id)}
            className={cn(
              "shrink-0 rounded-md px-3 text-sm",
              wide ? "min-h-8" : "min-h-11",
              kind === id ? "bg-gold text-navy" : "bg-navy-card text-cream-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {!wide && (
        <p className="text-sm leading-relaxed text-cream-muted">
          {kind === "now"
            ? copy.chartNowHint
            : kind === "map"
              ? copy.chartMapHint
              : kind === "analog"
                ? copy.chartAnalogHint
                : kind === "all"
                  ? copy.chartAllHint
                  : kind === "epoch"
                    ? copy.chartEpochHint(snap.bullish, snap.dayNumber, snap.dayTotal)
                    : copy.cycleTint}
        </p>
      )}

      {mode === "cycle" ? (
        <CycleChart
          lang={lang}
          tz={tz}
          copy={copy}
          snap={snap}
          nowMs={nowMs}
          landscape={wide}
          coinId={coin.id}
        />
      ) : (
        <>
      {!wide && overlay === "easy" && (
        <ReadingStrip
          lang={lang}
          copy={copy}
          spot={spot}
          live={live && !frozen}
          fib={targets.find((t) => t.tf === targetTfForChart(usedTf)) ?? null}
          digits={px}
        />
      )}
      {!wide && overlay !== "easy" && (
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
          <HeadStat
            label={copy.spot}
            value={spot != null ? formatUsd(spot, lang, px) : "—"}
            warn={frozen}
            live={live && !frozen}
          />
          <HeadStat
            label={copy.chg24h}
            value={ticker ? formatPct(ticker.change24h, 1) : "—"}
          />
          <HeadStat label={copy.vsAth} value={dd != null ? formatPct(dd, 0) : "—"} />
          <HeadStat label={copy.tabs.clock} value={cycleTitle(snap.current, lang)} />
          <HeadStat label="%" value={`${Math.round(snap.timePct * 100)}%`} />
        </div>
      )}
      {frozen && !wide && <p className="text-sm text-gold">{copy.frozenPrice}</p>}

      <div className="flex flex-wrap items-center gap-1.5">
        {TFS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setKind((k) => (k === "epoch" ? "now" : k));
              setTf(t);
            }}
            className={cn(
              "rounded-md px-2.5 font-mono text-xs",
              wide ? "min-h-8" : "min-h-9",
              kind !== "epoch" && usedTf === t
                ? "bg-cream text-navy"
                : "bg-navy-card text-cream-muted",
            )}
          >
            {t}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setKind("epoch");
            setTf("1D");
          }}
          className={cn(
            "rounded-md px-2.5 font-mono text-xs font-semibold",
            wide ? "min-h-8" : "min-h-9",
            kind === "epoch"
              ? snap.bullish
                ? "bg-green text-cream"
                : "bg-red text-cream"
              : "bg-navy-card text-cream-muted",
          )}
        >
          {copy.chartEpochTf(snap.bullish)}
        </button>
        <button
          type="button"
          onClick={() => setLog((v) => !v)}
          className={cn(
            "rounded-md px-2.5 text-xs",
            wide ? "min-h-8" : "min-h-9",
            logScale ? "bg-gold text-navy" : "bg-navy-card text-cream-muted",
          )}
        >
          {copy.log}
        </button>
        <button
          type="button"
          onClick={() => (expanded ? exitExpanded() : void enterExpanded())}
          className={cn(
            "ml-auto flex items-center gap-1 rounded-md bg-navy-card px-2.5 text-xs text-cream",
            wide ? "min-h-8" : "min-h-9",
          )}
          aria-label={expanded ? copy.exitChart : copy.expandChart}
        >
          {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          <span className="hidden sm:inline">
            {expanded ? copy.exitChart : copy.expandChart}
          </span>
        </button>
        <button
          type="button"
          onClick={() => chartRef.current?.timeScale().scrollToRealTime()}
          className={cn(
            "rounded-md bg-gold px-2.5 text-xs font-semibold uppercase tracking-wide text-navy",
            wide ? "min-h-8" : "min-h-9",
          )}
        >
          {copy.now}
        </button>
        <button
          type="button"
          onClick={() => {
            const ch = chartRef.current;
            const r = ch?.timeScale().getVisibleLogicalRange();
            if (!ch || !r) return;
            const mid = (r.from + r.to) / 2;
            const half = Math.max(2, ((r.to - r.from) / 2) * 0.6);
            ch.timeScale().setVisibleLogicalRange({ from: mid - half, to: mid + half });
          }}
          className={cn(
            "flex min-w-9 items-center justify-center rounded-md bg-navy-card text-lg text-cream",
            wide ? "min-h-8" : "min-h-9",
          )}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            const ch = chartRef.current;
            const r = ch?.timeScale().getVisibleLogicalRange();
            if (!ch || !r) return;
            const mid = (r.from + r.to) / 2;
            const half = ((r.to - r.from) / 2) * 1.6;
            ch.timeScale().setVisibleLogicalRange({ from: mid - half, to: mid + half });
          }}
          className={cn(
            "flex min-w-9 items-center justify-center rounded-md bg-navy-card text-lg text-cream",
            wide ? "min-h-8" : "min-h-9",
          )}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>

      {!wide && (
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["phase", copy.presets.phase],
              ["c3", copy.presets.c3],
              ["from2015", copy.presets.from2015],
              ["genesis", copy.presets.genesis],
              ["to2038", copy.presets.to2038],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPreset(id)}
              className={cn(
                "min-h-9 rounded-md px-2.5 text-xs",
                preset === id ? "bg-cream text-navy" : "bg-navy-card text-cream-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div
        ref={cardRef}
        className={cn(
          "relative min-h-0 overflow-hidden rounded-xl bg-navy-card",
          wide && "flex flex-1 flex-col",
        )}
      >
        <div
          ref={wrapRef}
          className={cn(
            "w-full touch-none overscroll-none",
            wide
              ? "min-h-0 flex-1"
              : "h-[min(62dvh,520px)] min-h-[320px]",
          )}
        />
        {spot != null && (
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-md bg-navy/80 px-2.5 py-1.5">
            <span className="live-dot" data-off={!(live && !frozen)} />
            <span className="font-mono text-sm tabular text-cream">
              {formatUsd(spot, lang, px)}
            </span>
            {kind === "epoch" && (
              <span
                className={cn(
                  "font-mono text-xs tabular",
                  snap.bullish ? "text-green" : "text-red",
                )}
              >
                {snap.dayNumber}/{snap.dayTotal}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-[0.14em] text-gold">
              {copy.live}
            </span>
          </div>
        )}
        {loading && bars < 2 && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/40 text-sm text-cream-muted">
            {copy.volume}…
          </div>
        )}
        {!loading && (failed || bars < 2) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy/70 px-6 text-center">
            <p className="text-sm text-cream">{copy.chartEmpty}</p>
            <button
              type="button"
              onClick={retry}
              className="min-h-11 rounded-md bg-gold px-4 text-sm font-medium text-navy"
            >
              {copy.retry}
            </button>
          </div>
        )}
        {axisRange && (
          <p
            className={cn(
              "border-t border-line px-3 text-center font-mono text-xs tabular tracking-wide text-cream",
              wide ? "py-1" : "py-2",
            )}
          >
            {axisRange}
          </p>
        )}
        <div className="grid grid-cols-2 gap-1.5 border-t border-line p-2">
          <button
            type="button"
            onClick={() => showNext("bull")}
            className={cn(
              "min-h-12 rounded-md px-2 py-1.5 text-left",
              focusSide === "bull" ? "bg-green text-cream" : "bg-green/25 text-green",
            )}
          >
            <span className="block text-xs font-medium uppercase tracking-wide">
              {copy.nextBull}
            </span>
            <span className="tabular font-mono text-sm">
              {focusSide === "bull" && focusStep
                ? `${formatUsd(focusStep.price, lang, px)} · ${focusStep.tag}`
                : upSteps[0]
                  ? formatUsd(upSteps[0].price, lang, px)
                  : "—"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => showNext("bear")}
            className={cn(
              "min-h-12 rounded-md px-2 py-1.5 text-left",
              focusSide === "bear" ? "bg-red text-cream" : "bg-red/25 text-red",
            )}
          >
            <span className="block text-xs font-medium uppercase tracking-wide">
              {copy.nextBear}
            </span>
            <span className="tabular font-mono text-sm">
              {focusSide === "bear" && focusStep
                ? `${formatUsd(focusStep.price, lang, px)} · ${focusStep.tag}`
                : downSteps[0]
                  ? formatUsd(downSteps[0].price, lang, px)
                  : "—"}
            </span>
          </button>
        </div>
      </div>
      {!expanded && overlay !== "easy" && (
        <ChartKey
          lang={lang}
          copy={copy}
          snap={snap}
          spot={spot}
          fib={targets.find((t) => t.tf === targetTfForChart(usedTf)) ?? null}
          showRanges={showRanges}
          overlay={overlay}
          coin={coin}
          digits={px}
        />
      )}
      {targets.length > 0 && !expanded && overlay !== "easy" && (
        <div className="rounded-xl bg-navy-card px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gold">
            {copy.targets}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-cream-muted">
            {copy.targetsNote}
          </p>
          <div className="mt-2 grid grid-cols-[auto_1fr_1fr] items-baseline gap-x-3 gap-y-1.5">
            <span />
            <span className="text-right text-xs text-green">{copy.bullTarget}</span>
            <span className="text-right text-xs text-red">{copy.bearTarget}</span>
            {targets.map((t) => {
              const on = targetTfForChart(usedTf) === t.tf;
              return (
                <Fragment key={t.tf}>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      on ? "font-medium text-gold" : "text-cream-muted",
                    )}
                  >
                    {t.tf}
                  </span>
                  <span className="tabular text-right font-mono text-sm text-green">
                    {formatUsd(t.bull, lang, px)}
                    <span className="mt-0.5 block text-xs text-green/80">
                      Fib {t.bullFib}
                    </span>
                  </span>
                  <span className="tabular text-right font-mono text-sm text-red">
                    {formatUsd(t.bear, lang, px)}
                    <span className="mt-0.5 block text-xs text-red/80">
                      Fib {t.bearFib}
                    </span>
                  </span>
                </Fragment>
              );
            })}
          </div>
        </div>
      )}
      {!wide && (
        <p className="text-xs text-cream-faint">
          {copy.rotateHint} · {copy.cycleTint} · {live && !frozen ? copy.live : source} · {source}
          {bars > 0 ? ` · ${bars}` : ""} · {copy.ghosts} · {copy.today}{" "}
          {formatDate(nowMs, lang, tz)}
        </p>
      )}
        </>
      )}
    </div>
  );
}

function ReadingStrip({
  lang,
  copy,
  spot,
  live,
  fib,
  digits,
}: {
  lang: Lang;
  copy: Copy;
  spot: number | null;
  live: boolean;
  fib: TfTarget | null;
  digits: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div className="rounded-xl bg-navy-card px-3 py-3">
        <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-cream-faint">
          {live && <span className="live-dot" />}
          {copy.live}
        </p>
        <p className="tabular font-mono text-xl text-cream">
          {spot != null ? formatUsd(spot, lang, digits) : "—"}
        </p>
      </div>
      <div className="rounded-xl bg-navy-card px-3 py-3">
        <p className="text-xs uppercase tracking-wide text-green">{copy.chartIfUp}</p>
        <p className="tabular font-mono text-xl text-green">
          {fib ? formatUsd(fib.bull, lang, digits) : "—"}
        </p>
        <p className="mt-1 text-sm text-cream-muted">
          {fib ? `Fib ${fib.bullFib}` : ""}
        </p>
      </div>
      <div className="rounded-xl bg-navy-card px-3 py-3">
        <p className="text-xs uppercase tracking-wide text-red">{copy.chartIfDown}</p>
        <p className="tabular font-mono text-xl text-red">
          {fib ? formatUsd(fib.bear, lang, digits) : "—"}
        </p>
        <p className="mt-1 text-sm text-cream-muted">
          {fib ? `Fib ${fib.bearFib}` : ""}
        </p>
      </div>
    </div>
  );
}

function HeadStat({
  label,
  value,
  warn,
  live,
}: {
  label: string;
  value: string;
  warn?: boolean;
  live?: boolean;
}) {
  return (
    <div className="rounded-lg bg-navy-card px-2.5 py-2">
      <p className="flex items-center gap-1.5 truncate text-[10px] uppercase tracking-[0.12em] text-cream-faint">
        {live && <span className="live-dot" />}
        {label}
      </p>
      <p
        className={cn(
          "tabular truncate font-mono text-sm text-cream",
          warn && "text-gold",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ChartKey({
  lang,
  copy,
  snap,
  spot,
  fib,
  showRanges,
  overlay,
  coin,
  digits,
}: {
  lang: Lang;
  copy: Copy;
  snap: Snapshot;
  spot: number | null;
  fib: TfTarget | null;
  showRanges: boolean;
  overlay: "easy" | "map" | "ghosts" | "all";
  coin: CoinSpec;
  digits: number;
}) {
  const rows = chartLegend(lang, snap, spot, fib, showRanges, coin).filter((row) => {
    if (overlay === "ghosts" || overlay === "all") return true;
    if (row.id === "g2018" || row.id === "g2022") return false;
    return true;
  });
  const toneClass = {
    gold: "bg-gold text-navy",
    green: "bg-green text-cream",
    red: "bg-red text-cream",
    cream: "bg-cream text-navy",
    muted: "bg-navy-elevated text-cream-muted",
  } as const;
  return (
    <div className="rounded-xl bg-navy-card px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gold">
        {copy.chartKey}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-cream-muted">
        {copy.chartKeyNote}
      </p>
      <ul className="mt-3 flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.id}>
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={cn(
                  "rounded-sm px-1.5 py-0.5 font-mono text-xs font-medium",
                  toneClass[row.tone],
                )}
              >
                {row.label}
              </span>
              {row.price != null && (
                <span className="tabular font-mono text-sm text-cream">
                  {formatUsd(row.price, lang, digits)}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-cream-muted">{row.meaning}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
