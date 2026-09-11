import { useState } from "react";
import { AlertSignup } from "@/components/alerts/AlertSignup";
import type { Copy } from "@/lib/i18n";
import type { AlertItem } from "@/lib/alerts/types";
import { explainAlert, type ExplainCtx } from "@/lib/alerts/explain";
import { formatDateTime, type Lang } from "@/lib/cycle/time";
import { cn } from "@/lib/utils";

type Filter = "all" | "matters" | "noise";

export function AlertsView({
  lang,
  tz,
  copy,
  alerts,
  onFlag,
  ctx,
}: {
  lang: Lang;
  tz: string;
  copy: Copy;
  alerts: AlertItem[];
  onFlag: (
    id: string,
    patch: Partial<Pick<AlertItem, "seen" | "matters" | "noise">>,
  ) => void;
  ctx?: ExplainCtx;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const rows = alerts.filter((a) => {
    if (filter === "matters") return a.matters && !a.noise;
    if (filter === "noise") return a.noise;
    return true;
  });

  return (
    <div className="flex flex-col gap-3 pb-8">
      <AlertSignup copy={copy} />
      <p className="text-sm leading-relaxed text-cream-muted">{copy.alertsIntro}</p>
      <div className="flex gap-1.5">
        {(
          [
            ["all", copy.all],
            ["matters", copy.matters],
            ["noise", copy.noise],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "min-h-11 rounded-md px-3 text-sm",
              filter === id ? "bg-cream text-navy" : "bg-navy-card text-cream-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="rounded-xl bg-navy-card px-4 py-8 text-center text-sm text-cream-muted">
          {copy.alertsEmpty}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {rows.map((a) => {
          const expl = explainAlert(a, lang, copy, tz, ctx);
          return (
            <li key={a.id} className="rounded-xl bg-navy-card px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="rounded-sm bg-navy-deep px-1.5 py-0.5 font-mono text-xs uppercase tracking-wide text-gold">
                  {copy.types[a.type] ?? a.type}
                </span>
                <span className="tabular font-mono text-xs text-cream-faint">
                  {formatDateTime(a.ts, lang, tz)}
                </span>
              </div>
              <p className="mt-2 text-base font-medium text-cream">{a.line1}</p>
              <p className="mt-1 text-sm leading-relaxed text-cream-muted">{a.line2}</p>

              <dl className="mt-3 flex flex-col gap-2.5 border-t border-line pt-3">
                <Block label={copy.whatItMeans}>{expl.meaning}</Block>
                <Block label={copy.whatItIsNot}>{expl.notThis}</Block>
                <Block label={copy.whatToWatch}>{expl.watch}</Block>
                <Block label={copy.commonSense} emphasis>
                  {expl.advice}
                </Block>
              </dl>

              <p className="mt-3 text-xs text-cream-faint">
                {copy.layers.clock}: {a.layers.clock} · {copy.layers.analog}:{" "}
                {a.layers.analog}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip
                  on={a.seen}
                  onClick={() => onFlag(a.id, { seen: !a.seen })}
                  label={copy.seen}
                />
                <Chip
                  on={a.matters}
                  onClick={() => onFlag(a.id, { matters: !a.matters, noise: false })}
                  label={copy.matters}
                />
                <Chip
                  on={a.noise}
                  onClick={() => onFlag(a.id, { noise: !a.noise, matters: false })}
                  label={copy.noise}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Block({
  label,
  children,
  emphasis,
}: {
  label: string;
  children: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        emphasis ? "rounded-md border border-gold/40 bg-navy-deep px-3 py-2.5" : undefined
      }
    >
      <dt className="text-xs font-medium uppercase tracking-wide text-gold">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-cream">{children}</dd>
    </div>
  );
}

function Chip({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full px-3 text-xs",
        on ? "bg-gold text-navy" : "bg-navy-elevated text-cream-muted",
      )}
    >
      {label}
    </button>
  );
}
