import type { CoinSpec } from "@/lib/coins/catalog";
import { formatUsdCompact, type Lang } from "@/lib/cycle/time";
import type { Snapshot } from "@/lib/cycle/model";
import type { TfTarget } from "./targets";

export type LevelRow = {
  id: string;
  label: string;
  price: number | null;
  tone: "gold" | "green" | "red" | "cream" | "muted";
  meaning: string;
};

export function chartLegend(
  lang: Lang,
  snap: Snapshot,
  spot: number | null,
  fib: TfTarget | null,
  showRanges: boolean,
  coin: CoinSpec,
): LevelRow[] {
  const es = lang === "es";
  const r = snap.ranges;
  const rows: LevelRow[] = [];
  const down = snap.dayTotal;
  const base = `${formatUsdCompact(r.baseLo, lang)}–${formatUsdCompact(r.baseHi, lang)}`;
  const ghost1 = coin.ghostC1[coin.ghostC1.length - 1]?.[1] ?? null;
  const ghost2 = coin.ghostC2[coin.ghostC2.length - 1]?.[1] ?? null;
  const a1 = coin.analogC1.label[lang];
  const a2 = coin.analogC2.label[lang];

  rows.push({
    id: "ath",
    label: "ATH",
    price: r.ath,
    tone: "gold",
    meaning: es
      ? `Techo de este ciclo de ${coin.symbol}. Todos los % de caída y Fibonacci del mapa diario salen de aquí.`
      : `This cycle’s high for ${coin.symbol}. Every drop % and the daily Fibonacci map is measured from here.`,
  });

  if (fib) {
    rows.push({
      id: "fib-bull",
      label: es ? `Alcista Fib ${fib.bullFib}` : `Bullish Fib ${fib.bullFib}`,
      price: fib.bull,
      tone: "green",
      meaning: es
        ? `Siguiente resistencia Fibonacci por encima del precio. En BAJA es un rebote, no un nuevo techo.`
        : `Next Fibonacci resistance above price. In DOWN this is a bounce, not a new high.`,
    });
  }

  rows.push({
    id: "live",
    label: es ? "EN VIVO" : "LIVE",
    price: spot,
    tone: "cream",
    meaning: es
      ? `Precio de ${coin.symbol} ahora. La línea blanca. No es un objetivo.`
      : `${coin.symbol}’s price right now. The white line. Not a target.`,
  });

  if (fib) {
    rows.push({
      id: "fib-bear",
      label: es ? `Bajista Fib ${fib.bearFib}` : `Bearish Fib ${fib.bearFib}`,
      price: fib.bear,
      tone: "red",
      meaning: es
        ? `Siguiente soporte Fibonacci por debajo del precio. Si se pierde, el mapa busca el siguiente Fib.`
        : `Next Fibonacci support below price. If it breaks, the map looks to the next Fib.`,
    });
  }

  if (showRanges) {
    rows.push({
      id: "mild",
      label: es ? `−${coin.defaultModel.lowMild}% suave` : `−${coin.defaultModel.lowMild}% mild`,
      price: r.mild,
      tone: "muted",
      meaning: es
        ? "Mitad del ATH. Caída suave del modelo, no el suelo."
        : "Half the ATH. The model’s mild drop, not the low.",
    });
    rows.push({
      id: "base-hi",
      label: es
        ? `Base alta (−${coin.defaultModel.lowBaseLo}%)`
        : `Base high (−${coin.defaultModel.lowBaseLo}%)`,
      price: r.baseHi,
      tone: "green",
      meaning: es
        ? `Techo de la zona base. Aquí el modelo busca un suelo candidato (${base}).`
        : `Top of the base zone. Here the model looks for a candidate low (${base}).`,
    });
    rows.push({
      id: "base-lo",
      label: es
        ? `Base baja (−${coin.defaultModel.lowBaseHi}%)`
        : `Base low (−${coin.defaultModel.lowBaseHi}%)`,
      price: r.baseLo,
      tone: "green",
      meaning: es
        ? `Piso de la zona base. El analog ${a2} cayó cerca de aquí. Candidato, no confirmado.`
        : `Bottom of the base zone. The ${a2} analog fell near here. Candidate, not confirmed.`,
    });
    rows.push({
      id: "sev-hi",
      label: es
        ? `Severo alto (−${coin.defaultModel.lowSevLo}%)`
        : `Severe high (−${coin.defaultModel.lowSevLo}%)`,
      price: r.sevHi,
      tone: "red",
      meaning: es
        ? "Empieza la caída severa. Más profundo que el mapa base."
        : "Severe drop starts here. Deeper than the base map.",
    });
    rows.push({
      id: "sev-lo",
      label: es
        ? `Severo bajo (−${coin.defaultModel.lowSevHi}%)`
        : `Severe low (−${coin.defaultModel.lowSevHi}%)`,
      price: r.sevLo,
      tone: "red",
      meaning: es
        ? `Fondo severo del modelo (cerca de ${a1}). No es una predicción; es el borde del rango.`
        : `Model severe floor (near ${a1}). Not a prediction; it is the edge of the range.`,
    });
  }

  rows.push({
    id: "g2022",
    label: a2,
    price: ghost2,
    tone: "gold",
    meaning: es
      ? `Fantasma del oso ${a2} estirado sobre estos ${down} días. La línea punteada amarilla. No es un precio de hoy.`
      : `Ghost of the ${a2} bear stretched over these ${down} days. The gold dotted line. Not today’s price.`,
  });
  rows.push({
    id: "g2018",
    label: a1,
    price: ghost1,
    tone: "red",
    meaning: es
      ? `Fantasma del oso ${a1} sobre el mismo reloj. La línea punteada roja. Reloj se parece; el precio de hoy no.`
      : `Ghost of the ${a1} bear on the same clock. The red dotted line. The clock rhymes; today’s price does not.`,
  });

  rows.push({
    id: "scale",
    label: es ? "Escala" : "Scale",
    price: null,
    tone: "muted",
    meaning: es
      ? "Los números grandes sin etiqueta son solo la regla logarítmica, no objetivos."
      : "The big unlabeled numbers are only the log ruler, not targets.",
  });

  return rows;
}
