import { useState, type ReactNode } from "react";
import type { Copy } from "@/lib/i18n";
import type { CoinSpec } from "@/lib/coins/catalog";
import type { Phase, Snapshot } from "@/lib/cycle/model";
import { phaseShort } from "@/lib/cycle/model";
import {
  formatDate,
  formatInt,
  formatPct,
  formatUsdCompact,
  MS_DAY,
  type Lang,
} from "@/lib/cycle/time";
import { cn } from "@/lib/utils";

function colorFor(p: Phase): string {
  if (p.kind === "genesis") return "bg-genesis";
  if (p.kind === "up") return "bg-green";
  return "bg-red";
}

function analogFor(p: Phase, lang: Lang, coin: CoinSpec): string {
  if (p.id === "c1_down") {
    const a = coin.analogC1;
    return lang === "es"
      ? `Foto ${a.label.es} · ${a.dd}% · ${a.days} d`
      : `${a.label.en} photo · ${a.dd}% · ${a.days} d`;
  }
  if (p.id === "c2_down") {
    const a = coin.analogC2;
    return lang === "es"
      ? `Foto ${a.label.es} · ${a.dd}% · ${a.days} d`
      : `${a.label.en} photo · ${a.dd}% · ${a.days} d`;
  }
  if (p.id === "c3_down") {
    return lang === "es"
      ? "En curso. El reloj puede parecerse a osos pasados; el precio no."
      : "In progress. Clock may look like past bears; price does not.";
  }
  if (p.kind === "genesis") {
    return lang === "es"
      ? "Días reales, no el modelo de esta moneda."
      : "Real days, not this coin’s model.";
  }
  if (p.future) {
    return lang === "es"
      ? "Predicción si el suelo modelo se confirma."
      : "Forecast if the model low is confirmed.";
  }
  return lang === "es" ? "Historia congelada." : "Frozen history.";
}

export function MapView({
  lang,
  tz,
  copy,
  snap,
  nowMs,
  coin,
}: {
  lang: Lang;
  tz: string;
  copy: Copy;
  snap: Snapshot;
  nowMs: number;
  coin: CoinSpec;
}) {
  const [selected, setSelected] = useState<Phase | null>(null);
  const total = snap.phases[snap.phases.length - 1].endMs - snap.phases[0].startMs;
  const start = snap.phases[0].startMs;
  const pick = selected ?? snap.current;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div>
        <h2 className="font-display text-xl text-cream">
          {formatDate(snap.phases[0].startMs, lang, tz)} →{" "}
          {formatDate(snap.phases[snap.phases.length - 1].endMs, lang, tz)}
        </h2>
        <p className="mt-1 text-sm text-cream-muted">{copy.tapPhase}</p>
        {coin.halvings.length > 0 && (
          <p className="mt-1 text-xs text-cream-faint">{copy.halvingsNote}</p>
        )}
      </div>

      <div className="relative rounded-xl bg-navy-card p-3">
        <div className="relative">
          {snap.phases.map((p) => {
            const active = snap.current.id === p.id;
            const h = Math.max(
              active ? 72 : 52,
              ((p.endMs - p.startMs) / total) * 1400,
            );
            const on = pick.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className={cn(
                  "relative mb-0.5 flex w-full items-center gap-2 rounded-sm px-2 text-left",
                  p.future && "opacity-45",
                  on && "ring-1 ring-gold",
                )}
                style={{ minHeight: h }}
                aria-current={active ? "true" : undefined}
              >
                <span
                  className={cn("w-2 self-stretch rounded-full", colorFor(p))}
                  aria-hidden
                />
                <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-1 pr-10">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium text-cream">
                      {phaseShort(p, lang)}
                    </span>
                    <span className="tabular shrink-0 font-mono text-xs text-cream-muted">
                      {formatInt(p.listedDays, lang)}
                      {p.modelDays != null && p.listedDays !== p.modelDays
                        ? ` / ${formatInt(p.modelDays, lang)}`
                        : ""}
                    </span>
                  </span>
                  <span className="tabular font-mono text-xs text-cream-faint">
                    {formatDate(p.startMs, lang, tz)} → {formatDate(p.endMs, lang, tz)}
                  </span>
                  {active && (
                    <span className="text-xs font-semibold tracking-wide text-gold">
                      {copy.youAreHere} · {formatDate(nowMs, lang, tz)}
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {snap.halvings.map((h) => {
            const pct = ((h.ms - start) / total) * 100;
            if (pct < 0 || pct > 100) return null;
            return (
              <div
                key={h.id}
                className="pointer-events-none absolute right-2 z-10 -translate-y-1/2"
                style={{ top: `${pct}%` }}
              >
                <span className="rounded-sm bg-navy-deep px-1.5 py-0.5 font-mono text-xs text-gold">
                  {h.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <PhaseDetail
        lang={lang}
        tz={tz}
        copy={copy}
        pick={pick}
        snap={snap}
        nowMs={nowMs}
        coin={coin}
      />

      <ScoreTable copy={copy} lang={lang} snap={snap} />
    </div>
  );
}

function Field({
  label,
  children,
  tone,
}: {
  label: string;
  children: ReactNode;
  tone?: "cream" | "gold" | "red" | "green";
}) {
  const color =
    tone === "gold"
      ? "text-gold"
      : tone === "red"
        ? "text-red"
        : tone === "green"
          ? "text-green"
          : "text-cream";
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-cream-faint">{label}</p>
      <p className={cn("tabular mt-1 font-mono text-base font-medium", color)}>
        {children}
      </p>
    </div>
  );
}

function PhaseDetail({
  lang,
  tz,
  copy,
  pick,
  snap,
  nowMs,
  coin,
}: {
  lang: Lang;
  tz: string;
  copy: Copy;
  pick: Phase;
  snap: Snapshot;
  nowMs: number;
  coin: CoinSpec;
}) {
  const isCurrent = pick.id === snap.current.id;
  const remainDays = Math.max(0, Math.ceil((pick.endMs - nowMs) / MS_DAY));
  const untilStart = Math.max(0, Math.ceil((pick.startMs - nowMs) / MS_DAY));
  const miss =
    pick.modelDays != null ? pick.listedDays - pick.modelDays : null;
  const hs = snap.halvings.filter(
    (h) => h.ms >= pick.startMs && h.ms < pick.endMs,
  );
  const showRange = pick.kind === "down" && (isCurrent || pick.future);
  const status = pick.inProgress
    ? copy.inProgress
    : pick.future
      ? copy.future
      : null;

  return (
    <section className="rounded-xl bg-navy-card px-4 py-4">
      <p className="text-xs uppercase tracking-[0.16em] text-gold">
        {copy.detail}
      </p>
      <h3 className="mt-1 font-display text-xl text-cream">
        {phaseShort(pick, lang)}
        {status ? ` · ${status}` : ""}
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field label={copy.dateFrom}>
          {formatDate(pick.startMs, lang, tz)}
        </Field>
        <Field label={copy.dateTo}>{formatDate(pick.endMs, lang, tz)}</Field>
        {isCurrent && (
          <Field label={copy.today} tone="gold">
            {formatDate(nowMs, lang, tz)}
          </Field>
        )}
        {isCurrent && (
          <Field label={copy.daysLabel} tone="gold">
            {formatInt(snap.dayNumber, lang)} / {formatInt(snap.dayTotal, lang)}
          </Field>
        )}
        {!isCurrent && (
          <Field label={copy.daysLabel}>
            {formatInt(pick.listedDays, lang)}
          </Field>
        )}
        {pick.modelDays != null && (
          <Field label={copy.model}>{formatInt(pick.modelDays, lang)}</Field>
        )}
        {miss != null && miss !== 0 && !pick.inProgress && (
          <Field label={copy.miss} tone={miss > 0 ? "red" : "green"}>
            {miss > 0 ? "+" : ""}
            {miss} d
          </Field>
        )}
        {isCurrent && nowMs < pick.endMs && (
          <Field label={copy.remaining}>
            {formatInt(remainDays, lang)} {copy.days}
          </Field>
        )}
        {pick.future && (
          <Field label={copy.remaining}>
            {formatInt(untilStart, lang)} {copy.days}
          </Field>
        )}
      </div>

      {pick.priceStart != null && pick.priceEnd != null && (
        <p
          className={cn(
            "tabular mt-4 font-mono text-sm",
            pick.kind === "down" ? "text-red" : "text-green",
          )}
        >
          {formatUsdCompact(pick.priceStart, lang)} →{" "}
          {formatUsdCompact(pick.priceEnd, lang)}
          {pick.drawdownPct != null ? `  (${formatPct(pick.drawdownPct, 0)})` : ""}
        </p>
      )}
      {pick.priceStart != null && pick.priceEnd == null && isCurrent && (
        <p className="tabular mt-4 font-mono text-sm text-cream">
          ATH {formatUsdCompact(pick.priceStart, lang)}
        </p>
      )}

      {showRange && (
        <p className="mt-3 text-sm text-cream-muted">
          {copy.rangeBody(
            formatDate(pick.endMs, lang, tz),
            `${formatUsdCompact(snap.ranges.sevLo, lang)}–${formatUsdCompact(snap.ranges.mild, lang)}`,
            `${formatUsdCompact(snap.ranges.baseLo, lang)}–${formatUsdCompact(snap.ranges.baseHi, lang)}`,
          )}
        </p>
      )}

      {hs.length > 0 && (
        <p className="tabular mt-3 font-mono text-sm text-gold">
          {copy.hInPhase}:{" "}
          {hs
            .map((h) => `${h.label} ${formatDate(h.ms, lang, tz)}`)
            .join(" · ")}
        </p>
      )}

      <p className="mt-4 text-sm text-cream-muted">
        {copy.analog}: {analogFor(pick, lang, coin)}
      </p>
    </section>
  );
}

function ScoreTable({
  copy,
  lang,
  snap,
}: {
  copy: Copy;
  lang: Lang;
  snap: Snapshot;
}) {
  return (
    <section className="rounded-xl bg-navy-card px-4 py-3">
      <h3 className="font-display text-lg text-cream">{copy.scoreTitle}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[280px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.12em] text-cream-faint">
            <tr>
              <th className="pb-2 font-medium">{copy.tabs.clock}</th>
              <th className="pb-2 font-medium">{copy.model}</th>
              <th className="pb-2 font-medium">{copy.real}</th>
              <th className="pb-2 font-medium">{copy.miss}</th>
              <th className="pb-2 font-medium">{copy.move}</th>
            </tr>
          </thead>
          <tbody className="tabular font-mono text-cream">
            {snap.score.rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="py-2 font-sans">{lang === "es" ? r.phase.es : r.phase.en}</td>
                <td>{r.modelDays}</td>
                <td>{r.realDays ?? "TBD"}</td>
                <td>
                  {r.missDays == null
                    ? "TBD"
                    : `${r.missDays > 0 ? "+" : ""}${r.missDays} d`}
                </td>
                <td>{r.movePct == null ? "—" : formatPct(r.movePct, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-cream-muted">
        {copy.avgMiss}: {snap.score.avgMiss} {copy.days}
      </p>
    </section>
  );
}
