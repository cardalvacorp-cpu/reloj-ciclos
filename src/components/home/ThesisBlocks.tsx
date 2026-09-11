import { Link } from "@tanstack/react-router";
import { Bell, BookOpen, CalendarClock, Share2 } from "lucide-react";
import type { Copy } from "@/lib/i18n";
import type { CoinSpec } from "@/lib/coins/catalog";
import type { Snapshot } from "@/lib/cycle/model";
import { cycleTitle } from "@/lib/cycle/model";
import {
  MS_DAY,
  formatDate,
  formatPct,
  formatUsd,
  formatUsdCompact,
  priceDigits,
  type Lang,
} from "@/lib/cycle/time";
import { ROUTES } from "@/lib/site/brand";
import type { Ticker } from "@/lib/price/server";
import { cn } from "@/lib/utils";

export type ThesisFacts = {
  pct: number;
  dayNumber: number;
  dayTotal: number;
  spot: string;
  dd: string;
  testDate: string;
  daysToTest: number;
  base: string;
  phase: string;
};

/** Every home block reads from one derived set of facts, so they cannot disagree. */
export function thesisFacts(
  snap: Snapshot,
  ticker: Ticker | null,
  lang: Lang,
  tz: string,
  coin: CoinSpec,
  nowMs: number,
): ThesisFacts {
  const spot = ticker?.spot ?? null;
  const digits = spot != null ? priceDigits(spot) : coin.digits;
  return {
    pct: Math.round(snap.timePct * 100),
    dayNumber: snap.dayNumber,
    dayTotal: snap.dayTotal,
    spot: spot != null ? formatUsd(spot, lang, digits) : "—",
    dd: snap.drawdownVsAth != null ? formatPct(snap.drawdownVsAth, 0) : "—",
    testDate: formatDate(snap.modelLowMs, lang, tz),
    daysToTest: Math.max(0, Math.ceil((snap.modelLowMs - nowMs) / MS_DAY)),
    base: `${formatUsdCompact(snap.ranges.baseLo, lang)}–${formatUsdCompact(snap.ranges.baseHi, lang)}`,
    phase: cycleTitle(snap.current, lang),
  };
}

/** The one line that has to land before anything else on the page. */
export function Hook({ copy, facts }: { copy: Copy; facts: ThesisFacts }) {
  return (
    <div className="rounded-xl border border-gold/40 bg-navy-card px-4 py-4 text-center shadow-panel">
      <p className="font-display text-2xl font-semibold leading-tight text-gold sm:text-3xl">
        {copy.hookLine(`${facts.pct}%`, facts.dd)}
      </p>
      <p className="mt-2 text-sm leading-snug text-cream-muted">{copy.hookNote}</p>
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: "gold" | "red" }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.12em] text-cream-faint">{label}</p>
      <p
        className={cn(
          "mt-0.5 truncate font-mono tabular text-sm text-cream",
          tone === "gold" && "text-gold",
          tone === "red" && "text-red",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function NowCard({ copy, facts }: { copy: Copy; facts: ThesisFacts }) {
  return (
    <section
      aria-label={copy.nowTitle}
      className="rounded-xl border border-line bg-navy-card px-4 py-3"
    >
      <h2 className="text-[11px] uppercase tracking-[0.16em] text-gold">{copy.nowTitle}</h2>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-3">
        <Cell label={copy.nowPhase} value={facts.phase} />
        <Cell label={copy.daysLabel} value={`${facts.dayNumber}/${facts.dayTotal}`} />
        <Cell label={copy.spot} value={facts.spot} />
        <Cell label={copy.nowVsHigh} value={facts.dd} tone="red" />
        <Cell
          label={copy.nowToTest}
          value={`${facts.daysToTest}${copy.daysShort} · ${facts.testDate}`}
          tone="gold"
        />
      </div>
    </section>
  );
}

export function CallCard({ copy, facts }: { copy: Copy; facts: ThesisFacts }) {
  return (
    <section
      aria-label={copy.callTitle}
      className="rounded-xl border border-gold/30 bg-navy-card px-4 py-3"
    >
      <h2 className="text-[11px] uppercase tracking-[0.16em] text-gold">{copy.callTitle}</h2>
      <p className="mt-2 text-sm leading-snug text-cream">{copy.callBody(facts.testDate)}</p>
      <p className="mt-2 text-sm leading-snug text-cream-muted">
        {copy.callFail(facts.testDate)}
      </p>
      <p className="mt-2 text-xs text-cream-faint">{copy.scenario}</p>
    </section>
  );
}

const CTA_CLASS =
  "flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-line px-2 text-center text-sm text-cream";

export function CtaRow({
  copy,
  onShare,
  onAlerts,
}: {
  copy: Copy;
  onShare: () => void;
  onAlerts: () => void;
}) {
  return (
    <nav aria-label={copy.callTitle} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Link to={ROUTES.method} className={CTA_CLASS}>
        <BookOpen className="size-4 shrink-0" />
        {copy.ctaMethod}
      </Link>
      <Link to={ROUTES.test} className={cn(CTA_CLASS, "border-gold/50 text-gold")}>
        <CalendarClock className="size-4 shrink-0" />
        {copy.ctaTest}
      </Link>
      <button type="button" className={CTA_CLASS} onClick={onShare}>
        <Share2 className="size-4 shrink-0" />
        {copy.ctaShare}
      </button>
      <button type="button" className={CTA_CLASS} onClick={onAlerts}>
        <Bell className="size-4 shrink-0" />
        {copy.ctaAlerts}
      </button>
    </nav>
  );
}
