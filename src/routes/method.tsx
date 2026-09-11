import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/pages/PageShell";
import { getCoin } from "@/lib/coins/catalog";
import { SITE_URL } from "@/lib/site/brand";
import { useAppStore } from "@/lib/store";

const TITLE = "Bitcoin 1064 / 364 cycle method | Watch Cycles";
const DESCRIPTION =
  "How the Bitcoin 1,064-day up / 364-day down clock is built, which dates it uses, and what would retire it.";

export const Route = createFileRoute("/method")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/method` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/method` }],
  }),
  component: MethodPage,
});

const LEG_LABEL: Record<string, { es: string; en: string }> = {
  c1_up: { es: "C1 SUBE", en: "C1 UP" },
  c1_down: { es: "C1 BAJA", en: "C1 DOWN" },
  c2_up: { es: "C2 SUBE", en: "C2 UP" },
  c2_down: { es: "C2 BAJA", en: "C2 DOWN" },
  c3_up: { es: "C3 SUBE", en: "C3 UP" },
};

function MethodPage() {
  const lang = useAppStore((s) => s.lang);
  const btc = getCoin("BTC");
  const rows = btc.frozen.filter((f) => LEG_LABEL[f.id]);

  return (
    <PageShell
      title={{ es: "Método", en: "Method" }}
      lead={{
        es: "Dos números y las fechas exactas de donde salen. Si las fechas no te convencen, el reloj tampoco debería.",
        en: "Two numbers, and the exact dates they came from. If the dates do not convince you, the clock should not either.",
      }}
    >
      <Section heading={{ es: "Los dos números", en: "The two numbers" }}>
        <p>
          {lang === "es"
            ? "SUBE ≈ 1.064 días. BAJA ≈ 364 días. Nada más. No hay indicadores, no hay modelo de precio, no hay flujo de fondos. Es un cronómetro con dos tiempos."
            : "UP ≈ 1,064 days. DOWN ≈ 364 days. That is all. No indicators, no price model, no fund flows. It is a stopwatch with two legs."}
        </p>
        <p className="text-cream-muted">
          {lang === "es"
            ? "El halving se marca en el mapa pero no mueve el reloj. Es una referencia, no una entrada del modelo."
            : "The halving is marked on the map but does not move the clock. It is a reference, not a model input."}
        </p>
      </Section>

      <Section heading={{ es: "Fechas usadas", en: "Dates used" }}>
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-xs">
            <thead>
              <tr className="text-cream-faint">
                <th className="py-1.5 pr-2 font-medium">{lang === "es" ? "Tramo" : "Leg"}</th>
                <th className="py-1.5 pr-2 font-medium">{lang === "es" ? "Desde" : "From"}</th>
                <th className="py-1.5 pr-2 font-medium">{lang === "es" ? "Hasta" : "To"}</th>
                <th className="py-1.5 pr-2 text-right font-medium">
                  {lang === "es" ? "Real" : "Real"}
                </th>
                <th className="py-1.5 pr-2 text-right font-medium">
                  {lang === "es" ? "Modelo" : "Model"}
                </th>
                <th className="py-1.5 text-right font-medium">
                  {lang === "es" ? "Desvío" : "Miss"}
                </th>
              </tr>
            </thead>
            <tbody className="font-mono tabular">
              {rows.map((r) => {
                const miss = r.modelDays == null ? null : r.listedDays - r.modelDays;
                return (
                  <tr key={r.id} className="border-t border-line">
                    <td className="py-1.5 pr-2 font-sans text-cream">{LEG_LABEL[r.id][lang]}</td>
                    <td className="py-1.5 pr-2 text-cream-muted">{r.start}</td>
                    <td className="py-1.5 pr-2 text-cream-muted">{r.end}</td>
                    <td className="py-1.5 pr-2 text-right text-cream">{r.listedDays}</td>
                    <td className="py-1.5 pr-2 text-right text-cream-muted">
                      {r.modelDays ?? "—"}
                    </td>
                    <td className="py-1.5 text-right text-gold">
                      {miss == null ? "—" : miss > 0 ? `+${miss}` : miss}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-cream-faint">
          {lang === "es"
            ? "Las bajas cerradas: C1 −84% en 363 días (modelo 364, desvío −1). C2 −77% en 376 días (modelo 364, desvío +12). Esas dos cifras son todo el historial que tiene el reloj."
            : "Closed down legs: C1 −84% in 363 days (model 364, miss −1). C2 −77% in 376 days (model 364, miss +12). Those two are the entire track record."}
        </p>
      </Section>

      <Section heading={{ es: "Qué cuenta como techo", en: "What counts as a high" }}>
        <p>
          {lang === "es"
            ? "Un solo día con fecha: el cierre diario más alto del tramo SUBE. Ese día es el día 0 del tramo BAJA. No se usa el máximo intradía ni un promedio de varios días."
            : "One dated day: the highest daily close of the UP leg. That day is day 0 of the DOWN leg. Not the intraday wick, not a multi-day average."}
        </p>
        <p className="text-cream-muted">
          {lang === "es"
            ? "Techo del ciclo 3: 6 de octubre de 2025, $126,198."
            : "Cycle 3 high: October 6, 2025, $126,198."}
        </p>
      </Section>

      <Section heading={{ es: "Qué cuenta como suelo", en: "What counts as a low" }}>
        <p>
          {lang === "es"
            ? "El cierre diario más bajo del tramo BAJA. Ese día es el día 0 del siguiente tramo SUBE. Un suelo solo se marca cuando ya pasó — nunca en tiempo real."
            : "The lowest daily close of the DOWN leg. That day is day 0 of the next UP leg. A low is only marked after the fact — never in real time."}
        </p>
        <p className="text-cream-muted">
          {lang === "es"
            ? "Los días son días de calendario entre las dos fechas. Sin ajustes, sin días hábiles, sin redondeo."
            : "Days are calendar days between the two dates. No adjustments, no trading days, no rounding."}
        </p>
      </Section>

      <Section heading={{ es: "Qué es esto", en: "What this is" }}>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            {lang === "es"
              ? "Una capa de conteo de días desde los techos y suelos mayores anteriores."
              : "A day-count overlay from prior major lows and highs."}
          </li>
          <li>
            {lang === "es"
              ? "Una fecha pública que puede estar equivocada."
              : "A public date that can be wrong."}
          </li>
          <li>
            {lang === "es"
              ? "Una lectura en vivo de cuánto del tramo de bajada se gastó frente a cuánto ha devuelto el precio."
              : "A live reading of how much of the down-leg is spent versus how much price has given back."}
          </li>
        </ul>
      </Section>

      <Section heading={{ es: "Qué NO es", en: "What this is not" }}>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-cream-muted">
          <li>{lang === "es" ? "Una señal de trading." : "A trading signal."}</li>
          <li>
            {lang === "es"
              ? "Una garantía de que el precio tenga que visitar ninguna zona."
              : "A guarantee that price must visit any zone."}
          </li>
          <li>
            {lang === "es"
              ? "Una afirmación de que Bitcoin lo gobierne un temporizador."
              : "A claim that Bitcoin is governed by a timer."}
          </li>
          <li>{lang === "es" ? "Asesoría financiera." : "Financial advice."}</li>
        </ul>
        <p className="mt-1 text-cream">
          {lang === "es"
            ? "La rima del pasado puede fallar. Qué techo y qué suelo elijas cambia el conteo. Intradía o cierre cambia el conteo. Por eso la fecha es el producto: se puede comprobar."
            : "Past rhyme can fail. Which high and low you pick changes the count. Intraday vs close changes the count. That is why the date is the product: it can be checked."}
        </p>
      </Section>

      <Section heading={{ es: "Las cajas de precio", en: "Price boxes" }}>
        <p>
          {lang === "es"
            ? "Cualquier rango en dólares del sitio es un análogo histórico, no un motor de pronóstico."
            : "Any dollar range on the site is a historical analog, not a forecast engine."}
        </p>
        <p className="text-cream-muted">
          {lang === "es"
            ? "Los tramos de bajada anteriores cortaron mucho más profundo de lo que ha cortado C3. Eso es contexto. El reloj no produce ese número."
            : "Prior down-legs cut much deeper than C3 has so far. That is context. The clock does not produce that number."}
        </p>
        <p className="text-cream">
          {lang === "es"
            ? "Si llega el 5 de octubre y el precio no ha hecho un suelo mayor, no se desliza el análogo hasta que encaje. Se retira el mapa."
            : "If Oct 5 arrives and price has not made a major low, the analog does not get slid around until it fits. The map gets retired."}
        </p>
      </Section>

      <Section heading={{ es: "Qué lo falsifica", en: "What would falsify it" }}>
        <p className="text-cream">
          {lang === "es"
            ? "El mapa viejo se retira si el 5 de octubre de 2026 pasa sin un suelo de ciclo mayor en la ventana alrededor de esa fecha."
            : "The old map is retired if October 5, 2026 passes without a major cycle low in the window around that date."}
        </p>
        <p className="text-cream-muted">
          {lang === "es"
            ? "El resultado se escribe en la fecha. Acierto o fallo. Un suelo posterior puede pasar igual — simplemente no sería este reloj."
            : "The result gets written on the date. Hit or miss. A later low can still happen. It just would not be this clock."}
        </p>
      </Section>

      <Section heading={{ es: "Cómo leer la portada", en: "How to read the homepage" }}>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            <span className="text-cream">{lang === "es" ? "Fase" : "Phase"}</span>
            {lang === "es" ? " — SUBE o BAJA, y qué ciclo" : " — UP or DOWN, and which cycle"}
          </li>
          <li>
            <span className="text-cream">{lang === "es" ? "Días" : "Days"}</span>
            {lang === "es" ? " — transcurridos / 364 (o 1.064)" : " — elapsed / 364 (or 1,064)"}
          </li>
          <li>
            <span className="text-cream">{lang === "es" ? "Vs techo" : "Vs high"}</span>
            {lang === "es" ? " — porcentaje desde el techo de C3" : " — percent off the C3 high"}
          </li>
          <li>
            <span className="text-cream">
              {lang === "es" ? "Falta para la prueba" : "To the test"}
            </span>
            {lang === "es" ? " — días al 5 de octubre de 2026" : " — days to October 5, 2026"}
          </li>
          <li>
            <span className="text-cream">
              {lang === "es" ? "La línea de tensión" : "The tension line"}
            </span>
            {lang === "es"
              ? " — cuando el tiempo y el precio no coinciden"
              : " — when time and price disagree"}
          </li>
        </ul>
        <p className="mt-1 text-cream">
          {lang === "es"
            ? "Cuando el tiempo casi se acabó y el precio apenas ha pagado, ese desacuerdo es la lectura."
            : "When time is almost spent and price has barely paid, that disagreement is the reading."}
        </p>
      </Section>

      <Section heading={{ es: "Altcoins", en: "Alts" }}>
        <p>
          {lang === "es"
            ? "Bitcoin es el reloj. Las otras monedas vienen después. No cronometres un bull de altcoins con la pestaña de un widget."
            : "Bitcoin is the clock. Other coins are later. Do not time an altcoin bull off a widget tab."}
        </p>
        <p className="text-cream-muted">
          {lang === "es"
            ? "Cada moneda de la lista se midió por separado, con su propio techo, su propio suelo y sus propios días. Tienen menos ciclos cerrados que Bitcoin, así que su reloj es más frágil."
            : "Every coin in the list was measured separately, with its own high, its own low and its own day counts. They have fewer closed cycles than Bitcoin, so their clock is more fragile."}
        </p>
      </Section>
    </PageShell>
  );
}
