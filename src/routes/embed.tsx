import { createFileRoute } from "@tanstack/react-router";
import { useFacts } from "@/hooks/use-facts";
import { BRAND, SITE_URL } from "@/lib/site/brand";
import { cn } from "@/lib/utils";

/**
 * Minimal iframe widget. No tabs, no chart, no donation — just the live reading
 * and a link back. Anything heavier makes people not embed it.
 */
export const Route = createFileRoute("/embed")({
  head: () => ({
    meta: [
      { title: `${BRAND} — live reading` },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: EmbedPage,
});

function Cell({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.12em] text-cream-faint">{label}</p>
      <p className={cn("truncate font-mono tabular text-sm text-cream", tone)}>{value}</p>
    </div>
  );
}

function EmbedPage() {
  const { lang, copy, facts, snap } = useFacts();

  return (
    <div className="app-shell min-h-dvh px-3 py-3">
      <h1 className="sr-only">
        {BRAND} — {facts ? `${facts.phase} ${facts.dayNumber}/${facts.dayTotal}` : "live reading"}
      </h1>
      <a
        href={SITE_URL}
        target="_blank"
        rel="noopener"
        className="flex items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" width={24} height={24} className="size-6 rounded" />
          <span className="font-display text-sm text-cream">{BRAND}</span>
        </span>
        <span className="text-[11px] text-gold">watchcycles.com</span>
      </a>

      {facts && snap && (
        <>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium text-cream",
                snap.bullish ? "bg-green" : "bg-red",
              )}
            >
              {facts.phase}
            </span>
            <span className="font-mono tabular text-lg text-cream">
              {facts.dayNumber}/{facts.dayTotal}
            </span>
          </div>

          <div className="progress-track mt-2">
            <div
              className={cn("progress-fill", snap.bullish ? "bg-green" : "bg-red")}
              style={{ width: `${Math.min(100, facts.pct)}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <Cell label={copy.spot} value={facts.spot} />
            <Cell label={copy.nowVsHigh} value={facts.dd} tone="text-red" />
            <Cell
              label={copy.nowToTest}
              value={`${facts.daysToTest}${copy.daysShort}`}
              tone="text-gold"
            />
          </div>

          <p className="mt-2 text-[10px] leading-snug text-cream-faint">
            {facts.testDate} ·{" "}
            {lang === "es"
              ? "Tiempo = 1.064 / 364. No es asesoría."
              : "Time = 1,064 / 364. Not financial advice."}
          </p>
        </>
      )}
    </div>
  );
}
