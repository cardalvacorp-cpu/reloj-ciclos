import type { Copy } from "@/lib/i18n";
import type { Lang } from "@/lib/cycle/time";
import type { PresenceSnap } from "@/lib/presence/types";

export function PresenceStrip({
  lang,
  copy,
  presence,
}: {
  lang: Lang;
  copy: Copy;
  presence: PresenceSnap;
}) {
  const nf = new Intl.NumberFormat(lang === "es" ? "es-MX" : "en-US");
  return (
    <div className="rounded-xl bg-navy-card px-3 py-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="tabular font-mono text-2xl font-medium text-gold">
            {nf.format(presence.live)}
          </p>
          <p className="text-xs text-cream-muted">{copy.usingNow}</p>
        </div>
        <div>
          <p className="tabular font-mono text-2xl font-medium text-cream">
            {nf.format(presence.visits)}
          </p>
          <p className="text-xs text-cream-muted">{copy.visitsLabel}</p>
        </div>
        <div>
          <p className="tabular font-mono text-2xl font-medium text-cream">
            ~{presence.avgMin}m
          </p>
          <p className="text-xs text-cream-muted">{copy.avgStay}</p>
        </div>
      </div>
    </div>
  );
}
