import { Bell, ChartCandlestick, Clock, Coffee, Map, Settings, X } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AlertsView } from "@/components/alerts/AlertsView";
import { CoinPicker } from "@/components/app/CoinPicker";
import { ClockView } from "@/components/clock/ClockView";
import { ChartView } from "@/components/chart/ChartView";
import { MapView } from "@/components/map/MapView";
import { SettingsView } from "@/components/settings/SettingsView";
import { TipSheet } from "@/components/tips/TipJar";
import { Button } from "@/components/ui/button";
import { useMounted, useNow } from "@/hooks/use-now";
import { useLandscape } from "@/hooks/use-landscape";
import { usePrice } from "@/hooks/use-price";
import { usePresence } from "@/hooks/use-presence";
import { scanFlow, seedClockAlerts } from "@/lib/alerts/engine";
import { detectAggressive, type PriceSample } from "@/lib/alerts/moves";
import { getCoin } from "@/lib/coins/catalog";
import { buildSnapshot, cycleTitle, type ModelSettings } from "@/lib/cycle/model";
import { buildRadar } from "@/lib/cycle/radar";
import { breakdownMs, formatDate, formatUsd, formatUsdCompact, priceDigits } from "@/lib/cycle/time";
import { clockStrip, copy as getCopy } from "@/lib/i18n";
import { thesisFacts } from "@/components/home/ThesisBlocks";
import { getKlines } from "@/lib/price/client";
import { ShareSheet } from "@/components/home/ShareSheet";
import { BRAND } from "@/lib/site/brand";
import { modelFromStore, useAppStore, type TabId } from "@/lib/store";
import type { TipId } from "@/lib/tips";
import { cn } from "@/lib/utils";

/** Allowed subtitle form. Never the main title. */
function cycleClockOf(lang: string, coinName: string) {
  return lang === "es" ? `Reloj del ciclo de ${coinName}` : `${coinName} cycle clock`;
}

const TABS: Array<{
  id: TabId;
  icon: typeof Clock;
  labelKey: "clock" | "map" | "chart" | "alerts";
}> = [
  { id: "clock", icon: Clock, labelKey: "clock" },
  { id: "map", icon: Map, labelKey: "map" },
  { id: "chart", icon: ChartCandlestick, labelKey: "chart" },
  { id: "alerts", icon: Bell, labelKey: "alerts" },
];

export function RelojApp() {
  const mounted = useMounted();
  const now = useNow(1000);
  const landscape = useLandscape();
  const store = useAppStore();
  const { ticker, frozen, live } = usePrice(store.coinId);
  const presence = usePresence();
  const [shareOpen, setShareOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [tipCoin, setTipCoin] = useState<TipId | undefined>(undefined);
  const samplesRef = useRef<PriceSample[]>([]);

  const lang = store.lang;
  const c = getCopy(lang);
  const model = modelFromStore(store);
  const coin = getCoin(store.coinId);
  const nowMs = now ?? 0;
  const spotRounded = ticker
    ? coin.digits === 0
      ? Math.round(ticker.spot)
      : ticker.spot
    : null;
  const snap = useMemo(
    () =>
      buildSnapshot(nowMs, model, spotRounded, {
        frozen: coin.frozen,
        halvings: coin.halvings,
        scoreDowns: coin.scoreDowns,
      }),
    [nowMs, model, spotRounded, coin],
  );
  const radar = useMemo(
    () => buildRadar(lang, snap, model, coin),
    [lang, snap, model, coin],
  );
  const pxDigits = ticker ? priceDigits(ticker.spot) : coin.digits;

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!useAppStore.getState().hydrated) useAppStore.setState({ hydrated: true });
    }, 500);
    return () => window.clearTimeout(t);
  }, []);

  // `document.documentElement.lang` and `?lang=` are handled once in __root.tsx.

  useEffect(() => {
    samplesRef.current = [];
  }, [store.coinId]);

  useEffect(() => {
    if (!mounted || !store.onboardingDone) return;
    const seeded = seedClockAlerts(lang, c, snap, radar, store.alerts);
    for (const a of seeded) store.pushAlert(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mounted,
    store.onboardingDone,
    store.coinId,
    snap.dayNumber,
    snap.inOfficialWindow,
    snap.missedMap,
    snap.drawdownVsAth,
    lang,
  ]);

  useEffect(() => {
    if (!mounted || !store.onboardingDone) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await getKlines("5m", nowMs - 6 * 3600_000, nowMs, store.coinId);
        if (cancelled) return;
        const extra = scanFlow(lang, c, snap, res.candles, {
          volAggressive: store.volAggressive,
          volExtreme: store.volExtreme,
          muteRedBox: store.muteRedBox,
          existing: store.alerts,
          spot: ticker?.spot ?? null,
          ranges: snap.ranges,
        }, coin.symbol);
        for (const a of extra) {
          const added = store.pushAlert(a);
          if (added && store.notifications && a.matters) {
            void pingSafe(a.line1, a.line2);
          }
        }
      } catch {
        /* offline */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, store.onboardingDone, store.coinId, Math.floor(nowMs / 120_000)]);

  useEffect(() => {
    if (!mounted || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.getRegistrations().then((regs) =>
      Promise.all(regs.map((r) => r.unregister())),
    );
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !store.onboardingDone || !ticker) return;
    const samples = samplesRef.current;
    const last = samples[samples.length - 1];
    if (last && last.spot === ticker.spot && ticker.ts - last.ts < 800) return;
    samples.push({ ts: ticker.ts, spot: ticker.spot });
    const cutoff = Date.now() - 70 * 60_000;
    while (samples.length && samples[0].ts < cutoff) samples.shift();
    if (samples.length > 360) samples.splice(0, samples.length - 360);

    const move = detectAggressive(samples, lang, c, snap, coin.symbol);
    if (!move) return;
    const added = store.pushAlert(move);
    if (added && store.notifications) {
      void pingSafe(move.line1, move.line2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, store.onboardingDone, store.coinId, ticker?.spot, ticker?.ts]);

  const facts = thesisFacts(snap, ticker, lang, store.tz, coin, nowMs);
  const onShare = () => setShareOpen(true);

  useEffect(() => {
    if (!store.onboardingDone) store.finishOnboarding(store.lang);
  }, [store.onboardingDone, store.lang, store.finishOnboarding]);

  if (!mounted || now == null) {
    return <div className="app-shell min-h-dvh" />;
  }

  if (store.roomMode) {
    return (
      <div className="app-shell min-h-dvh px-4 pb-6 pt-[max(16px,env(safe-area-inset-top))]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-cream-muted">{c.roomHint}</p>
          <Button variant="outline" size="sm" onClick={() => store.setRoom(false)}>
            <X className="size-4" />
            {c.exitRoom}
          </Button>
        </div>
        <ClockView
          lang={lang}
          tz={store.tz}
          copy={c}
          snap={snap}
          radar={radar}
          ticker={ticker}
          frozen={frozen}
          showRanges={store.showRanges}
          huge
          nowMs={nowMs}
          presence={presence}
          coin={coin}
          onShare={onShare}
          onRoom={() => store.setRoom(false)}
        />
      </div>
    );
  }

  const chartWide = landscape && store.tab === "chart";

  return (
    <div
      className={cn(
        "app-shell flex min-h-dvh flex-col",
        chartWide && "h-dvh max-h-dvh overflow-hidden",
      )}
    >
      <header className="sticky top-0 z-30 border-b border-line bg-navy/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        {!chartWide && (
          <p className="px-3 py-1.5 text-center text-[11px] leading-snug text-cream-muted">
            {clockStrip(lang, store.upDays, store.downDays)}
          </p>
        )}
        <div
          className={cn(
            "mx-auto flex w-full items-center justify-between px-3",
            chartWide ? "max-w-none py-1" : "max-w-lg pb-2",
          )}
        >
          <div className={cn("flex min-w-0 items-center gap-2.5", chartWide && "min-w-0 flex items-center gap-2")}>
            {!chartWide && (
            <img
              src="/favicon.svg"
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-lg ring-1 ring-gold/60"
            />
            )}
            <div className={cn(chartWide && "min-w-0 flex items-center gap-2")}>
            {!chartWide && (
              <h1 className="font-display text-base leading-tight text-cream">{BRAND}</h1>
            )}
            <p
              className={cn(
                "flex items-center gap-1.5 text-[11px] text-cream-faint",
                chartWide && "text-xs",
              )}
            >
              {chartWide ? `${BRAND} · ${coin.symbol}` : cycleClockOf(lang, coin.name)}
              {ticker && (
                <>
                  <span aria-hidden>·</span>
                  <span className="live-dot" data-off={!(live && !frozen)} />
                  <span
                    className={cn(
                      "font-mono tabular text-cream",
                      chartWide && "text-sm",
                      frozen && "text-gold",
                    )}
                  >
                    {formatUsd(ticker.spot, lang, pxDigits)}
                  </span>
                </>
              )}
            </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => store.setLang("es")}
              className={cn(
                "min-h-10 min-w-10 rounded-md text-sm",
                lang === "es" ? "bg-cream text-navy" : "text-cream-muted",
              )}
              aria-pressed={lang === "es"}
            >
              ES
            </button>
            <span className="text-cream-faint">|</span>
            <button
              type="button"
              onClick={() => store.setLang("en")}
              className={cn(
                "min-h-10 min-w-10 rounded-md text-sm",
                lang === "en" ? "bg-cream text-navy" : "text-cream-muted",
              )}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
            <button
              type="button"
              className={cn(
                "ml-1 flex size-11 items-center justify-center rounded-xl bg-bmc text-bmc-ink",
                chartWide && "hidden",
              )}
              aria-label={c.tipTitle}
              onClick={() => {
                setTipCoin(undefined);
                setTipsOpen(true);
              }}
            >
              <Coffee className="size-5" />
            </button>
            <button
              type="button"
              className={cn(
                "flex size-11 items-center justify-center rounded-md",
                chartWide && "hidden",
                store.tab === "settings" ? "bg-cream text-navy" : "text-cream",
              )}
              aria-label={c.settings}
              onClick={() => store.setTab("settings")}
            >
              <Settings className="size-5" />
            </button>
          </div>
        </div>
        {!chartWide && (
          <CoinPicker lang={lang} active={store.coinId} onPick={store.setCoin} />
        )}
        {!chartWide && !store.notifications && (
          <button
            type="button"
            className="w-full bg-gold px-3 py-2 text-left text-sm font-medium text-navy"
            onClick={async () => {
              const ok = await requestNotify();
              store.setNotifications(ok);
            }}
          >
            {c.enableMoveAlerts}
          </button>
        )}
      </header>

      <main
        className={cn(
          "mx-auto w-full flex-1 self-center",
          chartWide
            ? "flex min-h-0 max-w-none flex-col overflow-hidden px-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] py-1"
            : "max-w-lg overflow-y-auto px-3 py-4",
        )}
      >
        {store.tab === "clock" && (
          <ClockView
            lang={lang}
            tz={store.tz}
            copy={c}
            snap={snap}
            radar={radar}
            ticker={ticker}
            frozen={frozen}
            showRanges={store.showRanges}
            nowMs={nowMs}
            presence={presence}
            coin={coin}
            onShare={onShare}
            onRoom={() => store.setRoom(true)}
            onAlerts={() => store.setTab("alerts")}
            onTips={(id) => {
              setTipCoin(id);
              setTipsOpen(true);
            }}
          />
        )}
        {store.tab === "map" && (
          <MapView lang={lang} tz={store.tz} copy={c} snap={snap} nowMs={nowMs} coin={coin} />
        )}
        {store.tab === "chart" && (
          <ChartCatch copy={c}>
            <ChartView
              lang={lang}
              tz={store.tz}
              copy={c}
              snap={snap}
              ticker={ticker}
              frozen={frozen}
              live={live}
              nowMs={nowMs}
              showRanges={store.showRanges}
              active
              landscape={chartWide}
              coin={coin}
            />
          </ChartCatch>
        )}
        {store.tab === "alerts" && (
          <AlertsView
            lang={lang}
            tz={store.tz}
            copy={c}
            alerts={store.alerts}
            onFlag={store.flagAlert}
            ctx={{
              symbol: coin.symbol,
              upDays: store.upDays,
              downDays: store.downDays,
              baseZone: `${formatUsdCompact(snap.ranges.baseLo, lang)}–${formatUsdCompact(snap.ranges.baseHi, lang)}`,
            }}
          />
        )}
        {store.tab === "settings" && (
          <SettingsView
            lang={lang}
            copy={c}
            snap={snap}
            tz={store.tz}
            athLocal={store.athLocal}
            athUsd={store.athUsd}
            upDays={store.upDays}
            downDays={store.downDays}
            lowMild={store.lowMild}
            lowBaseLo={store.lowBaseLo}
            lowBaseHi={store.lowBaseHi}
            lowSevLo={store.lowSevLo}
            lowSevHi={store.lowSevHi}
            showRanges={store.showRanges}
            muteRedBox={store.muteRedBox}
            notifications={store.notifications}
            whalePrint={store.whalePrint}
            whaleCluster={store.whaleCluster}
            volAggressive={store.volAggressive}
            volExtreme={store.volExtreme}
            coin={coin}
            onLang={store.setLang}
            onPatch={(p) => {
              if ("whalePrint" in p) store.setWhalePrint(Number(p.whalePrint));
              if ("whaleCluster" in p) store.setWhaleCluster(Number(p.whaleCluster));
              if ("volAggressive" in p) store.setVolAggressive(Number(p.volAggressive));
              if ("volExtreme" in p) store.setVolExtreme(Number(p.volExtreme));
              const modelPatch: Partial<ModelSettings> = {};
              const keys: Array<keyof ModelSettings> = [
                "tz",
                "athLocal",
                "athUsd",
                "upDays",
                "downDays",
                "lowMild",
                "lowBaseLo",
                "lowBaseHi",
                "lowSevLo",
                "lowSevHi",
              ];
              for (const k of keys) {
                if (k in p) (modelPatch[k] as unknown) = p[k];
              }
              if (Object.keys(modelPatch).length) store.patch(modelPatch);
            }}
            onPreset={store.applyPreset}
            onReset={store.resetBase}
            onMarkLow={store.markLow}
            onMarkHigh={store.markHigh}
            onNoAnalog={() => store.setNoAnalog(true)}
            onToggle={(k, v) => {
              if (k === "showRanges") store.setShowRanges(v);
              if (k === "muteRedBox") store.setMuteRedBox(v);
              if (k === "notifications") store.setNotifications(v);
            }}
            onExportJson={() => {
              const blob = new Blob(
                [
                  JSON.stringify(
                    {
                      version: 2,
                      coinId: store.coinId,
                      ...model,
                      lang,
                      whalePrint: store.whalePrint,
                      whaleCluster: store.whaleCluster,
                      paypalMe: store.paypalMe,
                      tipAddresses: store.tipAddresses,
                    },
                    null,
                    2,
                  ),
                ],
                { type: "application/json" },
              );
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `base-${coin.symbol.toLowerCase()}.json`;
              a.click();
            }}
            onExportCsv={() => {
              const rows = [
                "id,cycle,kind,start,end,days,modelDays,frozen",
                ...snap.phases.map(
                  (p) =>
                    `${p.id},${p.cycleKey},${p.kind},${formatDate(p.startMs, "en", store.tz)},${formatDate(p.endMs, "en", store.tz)},${p.listedDays},${p.modelDays ?? ""},${p.frozen}`,
                ),
              ];
              const blob = new Blob([rows.join("\n")], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `fases-${coin.symbol.toLowerCase()}.csv`;
              a.click();
            }}
            onImport={(data) => store.importBase(data)}
          />
        )}
      </main>

      {!chartWide && (
      <nav
        className={cn(
          "sticky bottom-0 z-30 border-t border-line bg-navy/95 backdrop-blur-sm",
          "pb-[max(8px,env(safe-area-inset-bottom))] pt-1",
        )}
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = store.tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => store.setTab(t.id)}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px]",
                  on ? "text-gold" : "text-cream-muted",
                )}
                aria-current={on ? "page" : undefined}
              >
                <Icon className="size-5" />
                {c.tabs[t.labelKey]}
              </button>
            );
          })}
        </div>
      </nav>
      )}

      <TipSheet
        lang={lang}
        copy={c}
        open={tipsOpen}
        onClose={() => setTipsOpen(false)}
        initial={tipCoin}
      />

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        lang={lang}
        copy={c}
        facts={facts}
        bullish={snap.bullish}
        subtitle={cycleClockOf(lang, coin.name)}
        symbol={coin.symbol}
        highDate={formatDate(snap.athMs, lang, store.tz)}
      />
    </div>
  );
}

async function pingSafe(a: string, b: string) {
  const { pingPhone } = await import("@/lib/alerts/notify");
  return pingPhone(a, b);
}

async function requestNotify() {
  const { requestPhoneAlerts } = await import("@/lib/alerts/notify");
  return requestPhoneAlerts();
}

class ChartCatch extends Component<
  { children: ReactNode; copy: ReturnType<typeof getCopy> },
  { err: boolean }
> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("chart", error, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div className="rounded-xl bg-navy-card px-4 py-8 text-center">
          <p className="text-sm text-cream">{this.props.copy.chartEmpty}</p>
          <button
            type="button"
            className="mt-3 min-h-11 rounded-md bg-gold px-4 text-sm font-medium text-navy"
            onClick={() => this.setState({ err: false })}
          >
            {this.props.copy.retry}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
