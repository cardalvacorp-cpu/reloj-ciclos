import type { CoinSpec } from "@/lib/coins/catalog";
import { formatDate, formatUsdCompact, type Lang } from "./time";
import type { ModelSettings, Snapshot } from "./model";

export type RadarReading = {
  analogId: "none" | "c1" | "c2" | "a" | "b";
  copiesPrice: boolean;
  copiesTime: boolean;
  rank1: string;
  rank2: string;
  reading: string;
  watch: string;
};

function interp(points: Array<[number, number]>, t: number): number {
  if (t <= points[0][0]) return points[0][1];
  if (t >= points[points.length - 1][0]) return points[points.length - 1][1];
  for (let i = 1; i < points.length; i++) {
    const [t0, v0] = points[i - 1];
    const [t1, v1] = points[i];
    if (t <= t1) {
      const u = (t - t0) / (t1 - t0);
      return v0 + u * (v1 - v0);
    }
  }
  return points[points.length - 1][1];
}

export function analogDrawdown(
  points: Array<[number, number]>,
  timePct: number,
): number {
  return interp(points, timePct);
}

export function buildRadar(
  lang: Lang,
  snap: Snapshot,
  settings: ModelSettings,
  coin: CoinSpec,
): RadarReading {
  const tPct = snap.timePct * 100;
  const dd = snap.drawdownVsAth ?? 0;
  const c1 = analogDrawdown(coin.analogDdC1, snap.timePct);
  const c2 = analogDrawdown(coin.analogDdC2, snap.timePct);
  const copiesTime = tPct >= 70;
  const priceGapC2 = Math.abs(dd - c2);
  const copiesPrice = priceGapC2 < 20 && dd <= -50;
  const es = lang === "es";
  const base = `${formatUsdCompact(snap.ranges.baseLo, lang)}–${formatUsdCompact(snap.ranges.baseHi, lang)}`;
  const lowDate = formatDate(snap.modelLowMs, lang, settings.tz);
  const a1 = coin.analogC1.label[lang];
  const a2 = coin.analogC2.label[lang];

  if (settings.noAnalog) {
    return {
      analogId: "none",
      copiesPrice: false,
      copiesTime: false,
      rank1: es ? "SIN ANÁLOGO" : "NO ANALOG",
      rank2: es ? "Este ciclo no copia." : "This cycle does not rhyme.",
      reading: es
        ? "Marcaste que este ciclo no copia. El radar queda sin mapa de osos pasados."
        : "You marked that this cycle does not rhyme. Radar has no past-bear map.",
      watch: es
        ? "Usa el suelo real, no fuerces el ancla."
        : "Use the real low. Do not force the anchor.",
    };
  }

  if (snap.bullish || snap.current.kind !== "down") {
    return {
      analogId: "none",
      copiesPrice: false,
      copiesTime: false,
      rank1: es ? "SUBE. El mapa de osos no aplica." : "UP. The bear map does not apply.",
      rank2: snap.modelLowPassed
        ? es
          ? "El suelo modelo ya pasó. Marca el suelo real si lo viste."
          : "The model low has passed. Mark the real low if you saw it."
        : es
          ? "Estamos en la SUBIDA de este reloj."
          : "This clock is in an UP phase.",
      reading: es
        ? `${coin.symbol} va ${dd.toFixed(0)}% vs el techo de este ciclo. El analogía de osos es para BAJA, no para esta fase.`
        : `${coin.symbol} is ${dd.toFixed(0)}% vs this cycle’s high. Bear analogs are for DOWN, not this phase.`,
      watch: snap.modelLowPassed
        ? es
          ? `Siguiente techo modelo: ${formatDate(snap.nextHighMs ?? snap.current.endMs, lang, settings.tz)}.`
          : `Next model high: ${formatDate(snap.nextHighMs ?? snap.current.endMs, lang, settings.tz)}.`
        : es
          ? `Sigue el reloj de ${settings.upDays} días. El precio es escenario.`
          : `Stay with the ${settings.upDays}-day clock. Price is a scenario.`,
    };
  }

  const defaultLike =
    snap.current.id === "c3_down" && tPct >= 80 && tPct <= 95 && dd > -50 && dd < -25;

  if (defaultLike) {
    return {
      analogId: "none",
      copiesPrice: false,
      copiesTime: true,
      rank1: es ? "1º Ningún bear clásico." : "1st No classic bear.",
      rank2: es
        ? `2º ${a2} solo en calendario.`
        : `2nd ${a2} on the calendar only.`,
      reading: es
        ? `Lectura: ${Math.round(tPct)}% del tiempo y solo ${dd.toFixed(0)}%.`
        : `Reading: ${Math.round(tPct)}% of time and only ${dd.toFixed(0)}%.`,
      watch: es
        ? `Vigilar ANTES: ${a2} → ${base} y ${lowDate}; ${a1} más profundo; si esa fecha pasa sin suelo, los ciclos viejos ya no sirven de mapa.`
        : `Watch BEFORE: ${a2} → ${base} and ${lowDate}; ${a1} deeper; if that date passes with no low, old cycles are no longer the map.`,
    };
  }

  if (copiesPrice) {
    return {
      analogId: "c2",
      copiesPrice: true,
      copiesTime,
      rank1: es
        ? `1º ${a2} en precio y tiempo.`
        : `1st ${a2} on price and time.`,
      rank2: es ? `2º ${a1} como cola.` : `2nd ${a1} as a tail.`,
      reading: es
        ? `Hoy ${dd.toFixed(0)}% vs ATH. ${a2} a este % de tiempo iba ${c2.toFixed(0)}%. ${a1} iba ${c1.toFixed(0)}%.`
        : `Now ${dd.toFixed(0)}% vs ATH. ${a2} at this time share was ${c2.toFixed(0)}%. ${a1} was ${c1.toFixed(0)}%.`,
      watch: es
        ? `Precio en ${base} antes del día ${settings.downDays} = suelo candidato, no confirmado.`
        : `Price in ${base} before day ${settings.downDays} = candidate low, not confirmed.`,
    };
  }

  return {
    analogId: "none",
    copiesPrice: false,
    copiesTime,
    rank1: es ? "1º Ningún bear clásico." : "1st No classic bear.",
    rank2: es
      ? "2º El reloj se parece; el precio no."
      : "2nd The clock rhymes; the price does not.",
    reading: es
      ? `${Math.round(tPct)}% del tiempo, ${dd.toFixed(0)}% vs ATH. ${a1} a este punto iba ${c1.toFixed(0)}%; ${a2} iba ${c2.toFixed(0)}%.`
      : `${Math.round(tPct)}% of time, ${dd.toFixed(0)}% vs ATH. ${a1} at this point was ${c1.toFixed(0)}%; ${a2} was ${c2.toFixed(0)}%.`,
    watch: es
      ? `Desvío de más de 20 puntos a >70% del tiempo. El mapa ${a1}/${a2} no está en precio.`
      : `More than 20 points off at >70% of time. The ${a1}/${a2} map is not in price.`,
  };
}

export const GHOST_C1 = [
  [0, 19800],
  [0.08, 14000],
  [0.18, 9000],
  [0.35, 7000],
  [0.55, 7500],
  [0.72, 6400],
  [0.88, 4200],
  [1, 3200],
] as Array<[number, number]>;

export const GHOST_C2 = [
  [0, 69000],
  [0.1, 47000],
  [0.22, 39000],
  [0.45, 30000],
  [0.58, 20000],
  [0.7, 19000],
  [0.89, 19000],
  [1, 16500],
  [1.033, 15500],
] as Array<[number, number]>;
