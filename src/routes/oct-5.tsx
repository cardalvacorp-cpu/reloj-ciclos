import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, Section } from "@/components/pages/PageShell";
import { Vote } from "@/components/home/Vote";
import { CopyButton } from "@/components/ui/copy-button";
import { useFacts } from "@/hooks/use-facts";
import { formatDate, formatUsd, formatUsdCompact } from "@/lib/cycle/time";
import { sharePostText, sundayUpdateText } from "@/lib/i18n";
import { getCycleLog } from "@/lib/log/server";
import type { LogSnap } from "@/lib/log/types";
import { SITE_URL } from "@/lib/site/brand";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TITLE = "October 5, 2026 Bitcoin cycle test | Watch Cycles";
const DESCRIPTION =
  "The 364-day down-leg from the Oct 6, 2025 high lands on Oct 5, 2026. If no major low, the old 1064/364 map is retired.";

export const Route = createFileRoute("/oct-5")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/oct-5` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/oct-5` }],
  }),
  component: TestPage,
});

function TestPage() {
  const { lang, copy, tz, snap, facts, symbol } = useFacts();
  const coinId = useAppStore((s) => s.coinId);
  const [log, setLog] = useState<LogSnap | null>(null);

  // The log is derived server-side from daily closes, so it needs no upkeep.
  useEffect(() => {
    let cancelled = false;
    setLog(null);
    void (async () => {
      try {
        const res = await getCycleLog({ data: { coinId } });
        if (!cancelled) setLog(res);
      } catch {
        if (!cancelled) setLog({ rows: [], source: "", generatedAt: Date.now(), stale: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coinId]);

  const windowFrom = snap ? formatDate(snap.officialWindow.startMs, lang, tz) : "—";
  const windowTo = snap ? formatDate(snap.officialWindow.endMs, lang, tz) : "—";
  const testDate = facts?.testDate ?? "—";

  const postArgs = facts && {
    symbol,
    phase: facts.phase,
    day: facts.dayNumber,
    total: facts.dayTotal,
    pct: facts.pct,
    spot: facts.spot,
    dd: facts.dd,
    highDate: snap ? formatDate(snap.athMs, lang, tz) : "—",
    testDate: facts.testDate,
    daysToTest: facts.daysToTest,
    base: facts.base,
    url: SITE_URL,
  };

  const post = postArgs && sharePostText(lang, postArgs);
  const sunday =
    postArgs && sundayUpdateText(lang, { ...postArgs, today: formatDate(Date.now(), lang, tz) });

  return (
    <PageShell
      title={{ es: `La prueba: ${testDate}`, en: `The test: ${testDate}` }}
      lead={{
        es: "Una fecha, un criterio de confirmación y una regla que mata el modelo. Puesto por escrito antes de que pase.",
        en: "One date, one confirmation criterion, and one rule that kills the model. Written down before the fact.",
      }}
    >
      <Section heading={{ es: "La cuenta", en: "The arithmetic" }}>
        <p>
          {lang === "es"
            ? `Techo del ciclo: 6 de octubre de 2025. Más 364 días de BAJA da ${testDate}. No hay nada más en el cálculo.`
            : `Cycle high: October 6, 2025. Plus 364 days of DOWN gives ${testDate}. There is nothing else in the calculation.`}
        </p>
        {facts && (
          <p className="font-mono tabular text-gold">
            {facts.daysToTest}
            {copy.daysShort} · {facts.dayNumber}/{facts.dayTotal} · {facts.pct}%
          </p>
        )}
      </Section>

      <Section heading={{ es: "La regla, escrita antes de la fecha", en: "The rule, written before the date" }}>
        <p className="text-cream">
          {lang === "es"
            ? "Si se forma un suelo de ciclo alrededor de esta ventana, el mapa 1.064 / 364 sigue teniendo voto."
            : "If a major cycle low forms around this window, the 1,064 / 364 map still has a vote."}
        </p>
        <p className="text-cream">
          {lang === "es"
            ? `Si pasa el ${testDate} sin un suelo mayor, el mapa viejo deja de ser el mapa.`
            : `If ${testDate} passes with no major low, the old map is no longer the map.`}
        </p>
        <p className="font-mono tabular text-gold">
          {windowFrom} → {windowTo}
        </p>
        <p className="text-xs text-cream-faint">
          {lang === "es"
            ? "La ventana es −1 / +12 días porque eso es exactamente lo que falló el modelo en C1 y C2. No se ensancha después de los hechos."
            : "The window is −1 / +12 days because that is exactly how far the model missed on C1 and C2. It does not get widened after the fact."}
        </p>
        <p className="text-cream-muted">
          {lang === "es"
            ? "El resultado se publica en esta página el mismo día. Acierto o fallo."
            : "The result gets published on this page the same day. Hit or miss."}
        </p>
      </Section>

      <Section heading={{ es: "Qué es un suelo mayor", en: 'What "major low" means here' }}>
        <p>
          {lang === "es"
            ? "No una vela roja cualquiera. Un suelo de escala de ciclo: un fondo duradero de la misma familia que los suelos anteriores, no un bajón de un día que muere enseguida."
            : "Not a random red candle. A cycle-scale low: a durable bottom in the same family as prior cycle troughs, not a one-day dip that immediately dies."}
        </p>
        <p className="text-cream-muted">
          {lang === "es"
            ? "No se va a hacer pasar un sacudón de −10% por lo que fueron C1 o C2."
            : "A −10% shake will not be passed off as C1 or C2."}
        </p>
      </Section>

      <Section heading={{ es: "Qué es el análogo (y qué no)", en: "What the analog is (and is not)" }}>
        <p>
          {lang === "es"
            ? "Los tramos de bajada anteriores terminaron mucho más abajo de donde ha llegado C3."
            : "Prior down-legs ended much deeper than C3 has traveled so far."}
        </p>
        {facts && (
          <p className="text-cream-muted">
            {lang === "es" ? "Zona análoga histórica: " : "Historical analog zone: "}
            <span className="font-mono tabular text-cream">{facts.base}</span>
            {lang === "es"
              ? ". Es solo esa memoria. No es una orden y no hace falta que se cumpla para que el reloj cuente."
              : ". That is only that memory. It is not an order, and it is not required for the clock to count."}
          </p>
        )}
        <p className="text-cream">
          {lang === "es"
            ? "El reloj puede llegar tarde en precio y aun así ir a tiempo. El reloj puede ir a tiempo y aun así estar equivocado."
            : "The clock can be late on price and still be on time. The clock can be on time and still be wrong."}
        </p>
      </Section>

      <Section heading={{ es: "Después de la fecha", en: "After the date" }}>
        <p className="text-cream">
          {lang === "es" ? "Si la ventana produce un suelo mayor:" : "If the window produces a major low:"}
        </p>
        <p className="text-cream-muted">
          {lang === "es"
            ? "El reloj aguantó. El precio pagó la cuenta del tiempo. Watch Cycles sigue siendo el objeto 1.064 / 364 en vivo hacia el siguiente tramo de subida."
            : "The clock held. Price paid the time bill. Watch Cycles stays the live 1,064 / 364 object into the next up-leg."}
        </p>
        <p className="mt-2 text-cream">
          {lang === "es" ? "Si pasa la fecha sin suelo:" : "If the date passes with no low:"}
        </p>
        <p className="text-cream-muted">
          {lang === "es"
            ? "Mapa retirado. No se inventa un día secreto nuevo. Lo siguiente que se escribe es qué sigue funcionando y en qué se convierte este sitio después de un análogo roto."
            : "Map retired. No new secret day gets invented. The next write-up is what still works and what this site becomes after a broken analog."}
        </p>
        <p className="mt-2 text-xs text-cream-faint">
          {lang === "es"
            ? "En cualquiera de los dos casos, la marca de tiempo de esta página es el registro."
            : "Either way, the timestamp on this page is the record."}
        </p>
      </Section>

      <Section heading={{ es: copy.historyTitle, en: copy.historyTitle }}>
        {log == null && <p className="text-cream-muted">{copy.historyLoading}</p>}
        {log && log.stale && <p className="text-gold">{copy.historyStale}</p>}
        {log && log.rows.length > 0 && (
          <>
            <div className="-mx-1 max-h-80 overflow-y-auto overflow-x-auto">
              <table className="w-full min-w-[380px] border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-navy-card">
                  <tr className="text-cream-faint">
                    <th className="py-1.5 pr-2 font-medium">
                      {lang === "es" ? "Fecha" : "Date"}
                    </th>
                    <th className="py-1.5 pr-2 text-right font-medium">
                      {lang === "es" ? "Día" : "Day"}
                    </th>
                    <th className="py-1.5 pr-2 text-right font-medium">{copy.spot}</th>
                    <th className="py-1.5 text-right font-medium">{copy.nowVsHigh}</th>
                  </tr>
                </thead>
                <tbody className="font-mono tabular">
                  {[...log.rows].reverse().map((h) => (
                    <tr key={`${h.date}-${h.day}`} className="border-t border-line">
                      <td className="py-1.5 pr-2 text-cream-muted">{h.date}</td>
                      <td className="py-1.5 pr-2 text-right text-cream">
                        {h.day}/{facts?.dayTotal ?? 364}
                      </td>
                      <td className="py-1.5 pr-2 text-right text-cream">
                        {formatUsd(h.close, lang, 0)}
                      </td>
                      <td
                        className={cn(
                          "py-1.5 text-right",
                          h.dd < 0 ? "text-red" : "text-cream-muted",
                        )}
                      >
                        {h.dd}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {log.source && (
              <p className="text-xs text-cream-faint">
                {copy.historySource(
                  log.source,
                  formatDate(log.generatedAt, lang, tz),
                )}
              </p>
            )}
          </>
        )}
        <p className="text-xs text-cream-faint">{copy.historyNote}</p>
      </Section>

      {post && sunday && (
        <Section heading={{ es: "Para publicar", en: "To post" }}>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-navy px-3 py-2 text-xs leading-relaxed text-cream-muted">
            {post}
          </pre>
          <CopyButton text={post} label={copy.shareCopyBtn} done={copy.shareCopied} />
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-gold">
            {copy.sundayTitle}
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-navy px-3 py-2 text-xs leading-relaxed text-cream-muted">
            {sunday}
          </pre>
          <CopyButton text={sunday} label={copy.sundayBtn} done={copy.shareCopied} />
        </Section>
      )}

      <Vote copy={copy} lang={lang} />

      {snap && (
        <p className="text-center text-xs text-cream-faint">
          {lang === "es" ? "Suelo severo del escenario: " : "Scenario severe low: "}
          <span className="font-mono tabular">
            {formatUsdCompact(snap.ranges.sevLo, lang)}–{formatUsdCompact(snap.ranges.mild, lang)}
          </span>
        </p>
      )}
    </PageShell>
  );
}
