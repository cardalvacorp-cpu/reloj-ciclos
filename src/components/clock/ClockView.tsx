import { Link } from "@tanstack/react-router";
import { Maximize2, Share2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Copy } from "@/lib/i18n";
import { marketPhrase, todayPhrase } from "@/lib/i18n";
import type { CoinSpec } from "@/lib/coins/catalog";
import type { Snapshot } from "@/lib/cycle/model";
import { cycleTitle } from "@/lib/cycle/model";
import type { RadarReading } from "@/lib/cycle/radar";
import {
  breakdownMs,
  formatDate,
  formatPct,
  formatUsd,
  formatUsdCompact,
  pad2,
  priceDigits,
  type ClockParts,
  type Lang,
} from "@/lib/cycle/time";
import type { Ticker } from "@/lib/price/server";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { PresenceStrip } from "@/components/clock/PresenceStrip";
import { CallCard, CtaRow, Hook, NowCard, thesisFacts } from "@/components/home/ThesisBlocks";
import { TipCard } from "@/components/tips/TipJar";
import type { PresenceSnap } from "@/lib/presence/types";
import type { TipId } from "@/lib/tips";

function Unit({
  value,
  label,
  huge,
}: {
  value: number;
  label: string;
  huge?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      <span
        className={cn(
          "tabular font-mono font-medium text-cream",
          huge ? "text-4xl sm:text-5xl" : "text-xl sm:text-2xl",
        )}
      >
        {pad2(value)}
      </span>
      <span className="text-[11px] uppercase tracking-[0.14em] text-cream-faint">
        {label}
      </span>
    </div>
  );
}

function ClockBlock({
  title,
  parts,
  huge,
  copy,
}: {
  title: string;
  parts: ClockParts;
  huge?: boolean;
  copy: Copy;
}) {
  return (
    <div className="flex-1 rounded-xl bg-navy-card px-3 py-4 shadow-panel">
      <p className="mb-3 text-center text-[11px] uppercase tracking-[0.18em] text-cream-muted">
        {title}
      </p>
      <div className="grid grid-cols-3 gap-y-3">
        <Unit huge={huge} value={parts.years} label={copy.years} />
        <Unit huge={huge} value={parts.months} label={copy.months} />
        <Unit huge={huge} value={parts.days} label={copy.days} />
        <Unit huge={huge} value={parts.hours} label={copy.hours} />
        <Unit huge={huge} value={parts.minutes} label={copy.minutes} />
        <Unit huge={huge} value={parts.seconds} label={copy.seconds} />
      </div>
    </div>
  );
}

function Semaforo({
  bullish,
  copy,
  huge,
}: {
  bullish: boolean;
  copy: Copy;
  huge?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg px-3 py-2",
        bullish ? "bg-green" : "bg-red",
      )}
    >
      <p
        className={cn(
          "font-display font-medium tracking-wide text-cream",
          huge ? "text-2xl" : "text-lg",
        )}
      >
        {bullish ? copy.bullish : copy.bearish}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  warn,
  tone,
}: {
  label: string;
  value: string;
  warn?: boolean;
  tone?: "up" | "down";
}) {
  return (
    <div className="rounded-lg bg-navy-card px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-cream-faint">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-mono tabular text-cream",
          warn && "text-gold",
          tone === "up" && "text-green",
          tone === "down" && "text-red",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function remainSpeech(p: ClockParts, lang: Lang): string {
  const bits: string[] = [];
  if (p.years) bits.push(`${p.years} ${lang === "es" ? "años" : "years"}`);
  if (p.months) bits.push(`${p.months} ${lang === "es" ? "meses" : "months"}`);
  if (p.days) bits.push(`${p.days} ${lang === "es" ? "días" : "days"}`);
  if (p.hours) bits.push(`${p.hours}h`);
  if (!bits.length && p.minutes) bits.push(`${p.minutes} min`);
  return bits.slice(0, 3).join(" ") || (lang === "es" ? "menos de un día" : "under a day");
}

export function ClockView({
  lang,
  tz,
  copy,
  snap,
  radar,
  ticker,
  frozen,
  showRanges,
  huge,
  nowMs,
  onShare,
  onRoom,
  onTips,
  onAlerts,
  presence,
  coin,
}: {
  lang: Lang;
  tz: string;
  copy: Copy;
  snap: Snapshot;
  radar: RadarReading;
  ticker: Ticker | null;
  frozen: boolean;
  showRanges: boolean;
  huge?: boolean;
  nowMs: number;
  onShare: () => void;
  onRoom: () => void;
  onTips?: (id?: TipId) => void;
  onAlerts?: () => void;
  presence?: PresenceSnap;
  coin: CoinSpec;
}) {
  const elapsed = breakdownMs(snap.elapsedMs);
  const remain = breakdownMs(Math.max(0, snap.remainingMs));
  const spot = ticker?.spot ?? null;
  const dd = snap.drawdownVsAth;
  const inBase =
    spot != null &&
    spot <= snap.ranges.baseHi &&
    spot >= snap.ranges.baseLo;
  const lowFmt = formatDate(snap.c3DownEnd, lang, tz);
  const nextHighFmt = snap.nextHighMs
    ? formatDate(snap.nextHighMs, lang, tz)
    : "—";
  const digits = spot != null ? priceDigits(spot) : coin.digits;

  const speakMarket = () => {
    const text = marketPhrase(lang, {
      day: snap.dayNumber,
      total: snap.dayTotal,
      remain: remainSpeech(remain, lang),
      lowDate: lowFmt,
      nextHigh: nextHighFmt,
      bullish: snap.bullish,
    });
    speak(text, lang);
  };
  const speakAnalog = () => {
    speak(`${radar.rank1} ${radar.rank2} ${radar.reading} ${radar.watch}`, lang);
  };

  const rangeLine = copy.rangeBody(
    lowFmt,
    `${formatUsdCompact(snap.ranges.sevLo, lang)}–${formatUsdCompact(snap.ranges.mild, lang)}`,
    `${formatUsdCompact(snap.ranges.baseLo, lang)}–${formatUsdCompact(snap.ranges.baseHi, lang)}`,
  );

  const events = [
    { label: copy.phaseEnd, ms: snap.current.endMs },
    { label: copy.nextLow, ms: snap.nextLowMs },
    { label: copy.nextHigh, ms: snap.nextHighMs },
    { label: copy.followingHigh, ms: snap.followingHighMs },
  ].filter((e, i, arr) => e.ms != null && arr.findIndex((x) => x.ms === e.ms) === i);

  const facts = thesisFacts(snap, ticker, lang, tz, coin, nowMs);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {!huge && (
        <>
          <Hook copy={copy} facts={facts} />
          <NowCard copy={copy} facts={facts} />
          <CallCard copy={copy} facts={facts} />
          <CtaRow copy={copy} onShare={onShare} onAlerts={onAlerts ?? onShare} />
        </>
      )}

      <div className="flex items-start justify-between gap-3">
        <Semaforo bullish={snap.bullish} copy={copy} huge={huge} />
        <p className="max-w-[46%] text-right font-display text-lg font-medium leading-tight text-cream sm:text-xl">
          {cycleTitle(snap.current, lang)}
        </p>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-sm text-cream-muted">
          <span className="tabular font-mono text-cream">
            {snap.dayNumber}/{snap.dayTotal}
          </span>
          <span>{Math.round(snap.timePct * 100)}%</span>
        </div>
        <div className="progress-track">
          <div
            className={cn("progress-fill", snap.bullish ? "bg-green" : "bg-red")}
            style={{ width: `${Math.min(100, snap.timePct * 100)}%` }}
          />
        </div>
        <span className="sr-only">
          {snap.dayNumber} / {snap.dayTotal}
        </span>
      </div>

      <div className={cn("flex gap-3", huge && "flex-col")}>
        <ClockBlock copy={copy} huge={huge} parts={elapsed} title={copy.elapsed} />
        <ClockBlock copy={copy} huge={huge} parts={remain} title={copy.remaining} />
      </div>

      {/* Presence counter stays hidden until the numbers are real, not "2 using now". */}

      <div className="grid grid-cols-2 gap-2">
        {events.map((e) => (
          <div key={e.label} className="rounded-lg bg-navy-card px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.12em] text-cream-faint">
              {e.label}
            </p>
            <p className="mt-0.5 text-sm text-cream">{formatDate(e.ms as number, lang, tz)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label={copy.spot}
          value={spot != null ? formatUsd(spot, lang, digits) : "—"}
          warn={frozen}
        />
        <Stat
          label={copy.chg24h}
          value={ticker ? formatPct(ticker.change24h, 1) : "—"}
          tone={ticker ? (ticker.change24h >= 0 ? "up" : "down") : undefined}
        />
        <Stat
          label={copy.vsAth}
          value={dd != null ? formatPct(dd, 0) : "—"}
          tone={dd != null && dd >= 0 ? "up" : "down"}
        />
        <Stat label={copy.vsStart} value={dd != null ? formatPct(dd, 0) : "—"} />
      </div>

      {frozen && (
        <p
          role="status"
          className="rounded-lg border border-gold/40 bg-gold-dim/40 px-3 py-2 text-sm text-gold"
        >
          {copy.frozenPrice}
        </p>
      )}
      {snap.modelLowPassed && (
        <p role="status" className="rounded-lg bg-red/20 px-3 py-2 text-sm text-cream">
          {copy.modelLowPassed}
        </p>
      )}
      {snap.missedMap && (
        <p role="status" className="rounded-lg bg-red/20 px-3 py-2 text-sm text-cream">
          {copy.missedMap}
        </p>
      )}
      {snap.inTurnZone && !snap.missedMap && (
        <p
          role="status"
          className="rounded-lg border border-gold/30 bg-navy-card px-3 py-2 text-sm text-cream"
        >
          {copy.turnZone}
        </p>
      )}

      {showRanges && (
        <div className="rounded-xl bg-navy-card px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cream-muted">
            {copy.analogZone}
          </p>
          <p className="mt-1 text-sm text-cream">{rangeLine}</p>
          <p className="mt-2 text-xs text-cream-faint">{copy.analogNote}</p>
        </div>
      )}

      <div className="rounded-xl border border-line bg-navy-card px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold">
          {copy.studyTitle}
        </p>
        <p className="mt-2 font-display text-base text-cream">
          {coin.name} · {coin.symbol}
        </p>
        <p className="mt-1 text-sm text-cream">{coin.thesis[lang]}</p>
        <p className="mt-2 text-sm text-cream-muted">{coin.volumeWhy[lang]}</p>
        <p className="mt-2 text-sm text-cream">{coin.study[lang]}</p>
        <p className="mt-2 text-xs text-cream-faint">{coin.peakedVsBtc[lang]}</p>
        {coin.allTimeHigh && (
          <p className="mt-1 text-xs text-cream-faint">
            {copy.allTime}:{" "}
            {formatUsd(coin.allTimeHigh.price, lang, priceDigits(coin.allTimeHigh.price))}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-line bg-navy-card px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold">
          {copy.looksLike}
        </p>
        <p className="mt-2 font-medium text-cream">{radar.rank1}</p>
        <p className="text-cream-muted">{radar.rank2}</p>
        <p className="mt-2 text-sm text-cream">{radar.reading}</p>
        <p className="mt-2 text-sm text-cream-muted">{radar.watch}</p>
      </div>

      {!huge && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button variant="outline" className="h-auto min-h-11 whitespace-normal py-2" onClick={speakMarket}>
            <Volume2 />
            {copy.btnMarket}
          </Button>
          <Button variant="outline" className="h-auto min-h-11 whitespace-normal py-2" onClick={speakAnalog}>
            <Volume2 />
            {copy.btnAnalog}
          </Button>
          <Button variant="outline" className="h-auto min-h-11 whitespace-normal py-2" onClick={onShare}>
            <Share2 />
            {copy.btnShare}
          </Button>
          <Button variant="gold" className="h-auto min-h-11 whitespace-normal py-2" onClick={onRoom}>
            <Maximize2 />
            {copy.btnRoom}
          </Button>
        </div>
      )}

      {!huge && onTips && <TipCard lang={lang} copy={copy} onOpen={onTips} />}

      {!huge && (
        <nav
          aria-label={copy.navMethod}
          className="flex flex-wrap items-center justify-center gap-x-5 text-sm text-cream-muted"
        >
          <Link to="/method" className="min-h-11 py-2">
            {copy.navMethod}
          </Link>
          <Link to="/test" className="min-h-11 py-2">
            {copy.navTest}
          </Link>
          <Link to="/faq" className="min-h-11 py-2">
            {copy.navFaq}
          </Link>
          <Link to="/contact" className="min-h-11 py-2">
            {copy.navContact}
          </Link>
        </nav>
      )}

      <p className="text-center text-xs text-cream-faint">{copy.footer}</p>
      <span className="sr-only">
        {todayPhrase(lang, {
          day: snap.dayNumber,
          total: snap.dayTotal,
          spot: spot != null ? formatUsdCompact(spot, lang) : "—",
          dd: dd != null ? formatPct(dd, 0) : "—",
          base: `${formatUsdCompact(snap.ranges.baseLo, lang)}–${formatUsdCompact(snap.ranges.baseHi, lang)}`,
          remain: remainSpeech(remain, lang),
          lowDate: lowFmt,
          inBase,
        })}
      </span>
    </div>
  );
}
