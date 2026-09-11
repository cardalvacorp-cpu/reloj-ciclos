import type { Lang } from "@/lib/cycle/time";
import { formatDateTime, fmtCycle } from "@/lib/cycle/time";
import type { Copy } from "@/lib/i18n";
import type { AlertItem } from "./types";

export type AlertExplain = {
  meaning: string;
  notThis: string;
  watch: string;
  advice: string;
};

export type ExplainCtx = {
  symbol: string;
  upDays: number;
  downDays: number;
  baseZone: string;
};

const FALLBACK_CTX: ExplainCtx = {
  symbol: "BTC",
  upDays: 1064,
  downDays: 364,
  baseZone: "$29k–$38k",
};

function bits(ctx: ExplainCtx, lang: Lang) {
  const es = lang === "es";
  return {
    down: es ? `${fmtCycle(ctx.downDays, lang)} días` : `${fmtCycle(ctx.downDays, lang)}-day`,
    up: es ? `${fmtCycle(ctx.upDays, lang)} días` : `${fmtCycle(ctx.upDays, lang)}-day`,
    dayN: es ? `día ${ctx.downDays}` : `day ${ctx.downDays}`,
    base: ctx.baseZone,
    symbol: ctx.symbol,
    window: es ? "la ventana del suelo modelo" : "the model low window",
  };
}

function ratioFrom(line: string): string | null {
  const m = line.match(/([\d.]+)\s*[×xX]/);
  return m ? m[1] : null;
}

function downPhase(phase: string) {
  return /down|baja/i.test(phase);
}

function lateness(pct: number): "early" | "mid" | "late" | "window" {
  if (pct >= 95) return "window";
  if (pct >= 80) return "late";
  if (pct >= 40) return "mid";
  return "early";
}

function stamp(a: AlertItem, lang: Lang, tz: string, clock: string) {
  const when = formatDateTime(a.ts, lang, tz);
  const side = downPhase(a.phase)
    ? lang === "es"
      ? "BAJA"
      : "DOWN"
    : lang === "es"
      ? "SUBE"
      : "UP";
  return lang === "es"
    ? `A las ${when}, reloj ${clock} ${side}`
    : `At ${when}, clock ${clock} ${side}`;
}

function adviceVolume(a: AlertItem, lang: Lang, tz: string, clock: string, ctx: ExplainCtx): string {
  const es = lang === "es";
  const x = ratioFrom(a.line1);
  const how = x ? `${x}×` : es ? "alto" : "heavy";
  const late = lateness(a.pct);
  const head = stamp(a, lang, tz, clock);
  const b = bits(ctx, lang);
  if (downPhase(a.phase) && (late === "late" || late === "window")) {
    return es
      ? `${head}. Sentido común: vas tarde en los ${b.down} de bajada, cerca de ${b.window}. Un volumen ${how} ahora suele ser venta, cobertura o un sacudón — no “ya es el suelo”. No persigas un rebote. Anota la hora y el múltiplo, y espera a ver si el precio entra en ${b.base} en esa ventana. Si no entra, este print no cambia el reloj. No es asesoría.`
      : `${head}. Common sense: you are late in the ${b.down} down clock, near ${b.window}. A ${how} volume burst now is usually selling, covering, or a shakeout — not “the bottom is in.” Don’t chase a bounce. Write the time and the multiple, then wait to see if price actually enters ${b.base} in that window. If it doesn’t, this print does not change the clock. Not financial advice.`;
  }
  if (downPhase(a.phase)) {
    return es
      ? `${head}. Sentido común: en la primera o media parte de BAJA, volumen ${how} suele seguir la tendencia, no invertirla. No asumas giro. Déjalo marcado y sigue el reloj, no la vela.`
      : `${head}. Common sense: early or mid DOWN, ${how} volume usually continues the trend; it does not reverse it. Don’t assume a turn. Mark it and follow the clock, not the candle.`;
  }
  return es
    ? `${head}. Sentido común: en SUBE, volumen ${how} puede ser continuación o distribución. Una vela no mueve el reloj de ${b.up}. No la trates como techo.`
    : `${head}. Common sense: in UP, ${how} volume can be continuation or distribution. One candle does not move the ${b.up} clock. Don’t treat it as the high.`;
}

function adviceAnalog(a: AlertItem, lang: Lang, tz: string, clock: string, ctx: ExplainCtx): string {
  const es = lang === "es";
  const head = stamp(a, lang, tz, clock);
  const b = bits(ctx, lang);
  return es
    ? `${head}. Sentido común: el calendario dice “oso tardío”; el precio no se ha caído como los osos pasados de ${b.symbol}. No fuerces el guion de “compra el suelo” si no está en ${b.base}. Dos caminos honestos: (1) esperar ${b.window} y la zona base; (2) si esa fecha pasa sin suelo, soltar los ciclos viejos como mapa. No inventes el piso solo porque el reloj va al ${Math.round(a.pct)}%. No es asesoría.`
    : `${head}. Common sense: the calendar says “late bear”; price has not crashed like ${b.symbol}’s past bears. Don’t force the “buy the old low” script if it is not in ${b.base}. Two honest paths: (1) wait for ${b.window} and the base zone; (2) if that date passes with no low, drop old cycles as the map. Don’t invent a bottom just because the clock is at ${Math.round(a.pct)}%. Not financial advice.`;
}

function advicePreTurn(a: AlertItem, lang: Lang, tz: string, clock: string, ctx: ExplainCtx): string {
  const es = lang === "es";
  const head = stamp(a, lang, tz, clock);
  const b = bits(ctx, lang);
  return es
    ? `${head}. Sentido común: la fecha se acerca, no llega. Usa estos días para ver si el precio siquiera está cerca de la zona base. No adelantes el ${b.dayN} ni compres “porque faltan 2 semanas”. El pre-giro es un recordatorio, no un gatillo.`
    : `${head}. Common sense: the date is approaching, not arriving. Use these days to see whether price is even near the base zone. Don’t front-run ${b.dayN} or buy “because two weeks are left.” Pre-turn is a reminder, not a trigger.`;
}

function adviceTurn(a: AlertItem, lang: Lang, tz: string, clock: string, copy: Copy): string {
  const es = lang === "es";
  const head = stamp(a, lang, tz, clock);
  const missed = /miss|pasó|paso/i.test(a.line1 + a.line2);
  if (missed) {
    return es
      ? `${head}. Sentido común: el mapa de fecha se pasó. Deja de usar 2018/2022 como GPS. El suelo real, si llega, será el que marques — no el del calendario viejo. No persigas un suelo que el modelo ya dijo que no llegó a tiempo.`
      : `${head}. Common sense: the date map has passed. Stop using 2018/2022 as GPS. The real low, if it comes, is the one you mark — not the old calendar. Don’t chase a low the model already said missed its window.`;
  }
  return es
    ? `${head}. Sentido común: esta es la cita del modelo, no la confirmación. Mira si el precio está en la zona base durante la ventana. Si sigue alto, el reloj puede ir bien de tiempo y mal de precio — o el análogo está roto. ${copy.candidate} No es asesoría.`
    : `${head}. Common sense: this is the model’s appointment, not confirmation. See whether price is in the base zone during the window. If it is still high, the clock can be right on time and wrong on price — or the analog is broken. ${copy.candidate} Not financial advice.`;
}

function adviceBreakout(
  a: AlertItem,
  lang: Lang,
  tz: string,
  clock: string,
  copy: Copy,
  ctx: ExplainCtx,
): string {
  const es = lang === "es";
  const head = stamp(a, lang, tz, clock);
  const trap = a.line2 === copy.trap || a.noise;
  const b = bits(ctx, lang);
  if (trap) {
    return es
      ? `${head}. Sentido común: un salto lejos del ${b.dayN}, dentro de la caja roja, es el tipo de movimiento que suele devolverse. No lo trates como el nuevo reloj SUBE. Márcalo Ruido si el precio no se queda.`
      : `${head}. Common sense: a jump far from ${b.dayN}, inside the red box, is the kind of move that often gives the price back. Don’t treat it as the new UP clock. Mark Noise if price does not hold.`;
  }
  if (downPhase(a.phase) && lateness(a.pct) !== "early") {
    return es
      ? `${head}. Sentido común: un arranque bajista tarde en BAJA es el movimiento que faltaba para parecerse a osos pasados. Empieza a importar el precio, no solo el calendario. Aun así no es pánico: vigila ${b.base}, no vendas el reloj por una racha de velas. No es asesoría.`
      : `${head}. Common sense: a bearish breakout late in DOWN is the missing move that would start to look like past bears. Price starts to matter, not just the calendar. Still not a panic: watch ${b.base}; don’t sell the clock on a streak of candles. Not financial advice.`;
  }
  return es
    ? `${head}. Sentido común: un arranque es clima, no estación. Espera que el precio se quede fuera del promedio más de un día antes de tratarlo como giro de fase.`
    : `${head}. Common sense: a breakout is weather, not the season. Wait for price to stay away from the average more than a day before treating it as a phase turn.`;
}

function adviceMove(a: AlertItem, lang: Lang, tz: string, clock: string, ctx: ExplainCtx): string {
  const es = lang === "es";
  const head = stamp(a, lang, tz, clock);
  const up = /up|subió|subio/i.test(a.line1);
  const b = bits(ctx, lang);
  if (downPhase(a.phase)) {
    return es
      ? `${head}. Sentido común: un golpe de 5–60 min es el parte del tiempo, no el cambio de estación. En BAJA, un verde fuerte puede ser squeeze; un rojo fuerte puede ser la caída que el analogía echaba de menos. No cambies el plan por un movimiento. Anótalo y mira si el reloj y la zona base siguen iguales.`
      : `${head}. Common sense: a 5–60 min jolt is a weather report, not a season change. In DOWN, a sharp green can be a squeeze; a sharp red can be the delayed drop the analog was missing. Don’t change the plan off one move. Log it and see whether the clock and the base zone are still the same.`;
  }
  return es
    ? `${head}. Sentido común: en SUBE, un golpe ${up ? "al alza" : "a la baja"} no redefine los ${b.up}. Si es ruido, márcalo. Si se sostiene días, entonces mira el mapa, no el minuto.`
    : `${head}. Common sense: in UP, a ${up ? "green" : "red"} jolt does not redefine the ${b.up}. If it is noise, mark it. If it holds for days, then look at the map, not the minute.`;
}

function adviceBuy(a: AlertItem, lang: Lang, tz: string, clock: string, ctx: ExplainCtx): string {
  const es = lang === "es";
  const head = stamp(a, lang, tz, clock);
  const x = ratioFrom(a.line1);
  const how = x ? `${x}×` : es ? "grande" : "big";
  const b = bits(ctx, lang);
  if (downPhase(a.phase) && (lateness(a.pct) === "late" || lateness(a.pct) === "window")) {
    return es
      ? `${head}. Sentido común: tarde en BAJA, “están comprando en grande” (${how}) suele ser cobertura de cortos o gente cazando un rebote — no el suelo confirmado. Mira si el precio se QUEDA arriba en las siguientes horas. Si devuelve la vela, era un sacudón. No persigas. Espera ${b.base} o ${b.window}. No es asesoría.`
      : `${head}. Common sense: late in DOWN, “they are buying big” (${how}) is often short-covering or dip-buying — not a confirmed low. Watch whether price HOLDS over the next hours. If the candle is given back, it was a squeeze. Don’t chase. Wait for ${b.base} or ${b.window}. Not financial advice.`;
  }
  if (downPhase(a.phase)) {
    return es
      ? `${head}. Sentido común: comprar en grande a mitad de BAJA no apaga el reloj de ${b.down}. Puede ser un rebote para vender más arriba. No lo trates como giro a SUBE.`
      : `${head}. Common sense: big buying mid-DOWN does not turn off the ${b.down} clock. It can be a bounce to sell higher. Don’t treat it as a turn to UP.`;
  }
  return es
    ? `${head}. Sentido común: en SUBE, compras ${how} suelen ser continuación. Una vela no es el techo ni una nueva euforia. Sigue el reloj de ${b.up}.`
    : `${head}. Common sense: in UP, ${how} buying is usually continuation. One candle is not the high and not a new mania. Stay with the ${b.up} clock.`;
}

function adviceSell(a: AlertItem, lang: Lang, tz: string, clock: string, ctx: ExplainCtx): string {
  const es = lang === "es";
  const head = stamp(a, lang, tz, clock);
  const x = ratioFrom(a.line1);
  const how = x ? `${x}×` : es ? "grande" : "big";
  const b = bits(ctx, lang);
  if (downPhase(a.phase) && (lateness(a.pct) === "late" || lateness(a.pct) === "window")) {
    return es
      ? `${head}. Sentido común: tarde en BAJA, “están vendiendo en grande” (${how}) es el movimiento que el analogía echaba de menos. No es pánico: es flujo. Anota si el precio se acerca a ${b.base}. No vendas el reloj por una racha de velas. No es asesoría.`
      : `${head}. Common sense: late in DOWN, “they are selling big” (${how}) is the missing move the analog wanted. Not a panic: it’s flow. Note whether price is moving toward ${b.base}. Don’t sell the clock on a streak of candles. Not financial advice.`;
  }
  if (downPhase(a.phase)) {
    return es
      ? `${head}. Sentido común: ventas ${how} temprano o a mitad de BAJA suelen seguir la tendencia. El reloj ya decía bajada. No hace falta inventar un crash extra; sí conviene no pelearle al flujo.`
      : `${head}. Common sense: ${how} selling early or mid DOWN usually follows the trend. The clock already said down. Don’t invent an extra crash; do not fight the flow.`;
  }
  return es
    ? `${head}. Sentido común: en SUBE, ventas ${how} pueden ser toma de ganancia, no el techo. Una vela roja no cierra los ${b.up}. Márcala y mira si el mapa sigue en SUBE.`
    : `${head}. Common sense: in UP, ${how} selling can be profit-taking, not the high. One red candle does not end the ${b.up}. Mark it and see if the map is still UP.`;
}

function adviceWhale(a: AlertItem, lang: Lang, tz: string, clock: string): string {
  const es = lang === "es";
  const head = stamp(a, lang, tz, clock);
  return es
    ? `${head}. Sentido común: tamaño no es identidad. Trátalo como flujo, igual que el volumen. Anótalo; no le pongas nombre. No es asesoría.`
    : `${head}. Common sense: size is not identity. Treat it as flow, same as volume. Log it; don’t name it. Not financial advice.`;
}

export function explainAlert(
  a: AlertItem,
  lang: Lang,
  copy: Copy,
  tz = "America/Chicago",
  ctx: ExplainCtx = FALLBACK_CTX,
): AlertExplain {
  const es = lang === "es";
  const clock = a.layers.clock;
  const analog = a.layers.analog;
  const b = bits(ctx, lang);

  if (a.type === "BUY") {
    const x = ratioFrom(a.line1);
    const how = x ? (es ? `${x} veces` : `${x}×`) : es ? "grande" : "big";
    return {
      meaning: es
        ? `La última vela cerró más alta que su apertura, con volumen ${how} el promedio. En la cinta eso se lee como “están comprando en grande”: más agresividad compradora que vendedora en esa vela. ${a.line2}`
        : `The last candle closed higher than it opened, with volume ${how} the average. On the tape that reads as “they are buying big amounts”: more aggressive buying than selling on that candle. ${a.line2}`,
      notThis: es
        ? `No son wallets con nombre. Reloj no ve quién. Verde + volumen alto = presión de compra en esa vela, no “una ballena identificada”.`
        : `These are not named wallets. Reloj cannot see who. Green + high volume = buying pressure on that candle, not “an identified whale.”`,
      watch: es
        ? `Reloj: ${clock}. Si el precio se queda arriba, el flujo de compra aguantó. Si la vela se devuelve, era un sacudón.`
        : `Clock: ${clock}. If price holds up, the buy flow stuck. If the candle is given back, it was a squeeze.`,
      advice: adviceBuy(a, lang, tz, clock, ctx),
    };
  }

  if (a.type === "SELL") {
    const x = ratioFrom(a.line1);
    const how = x ? (es ? `${x} veces` : `${x}×`) : es ? "grande" : "big";
    return {
      meaning: es
        ? `La última vela cerró más baja que su apertura, con volumen ${how} el promedio. En la cinta eso se lee como “están vendiendo en grande”: más agresividad vendedora que compradora en esa vela. ${a.line2}`
        : `The last candle closed lower than it opened, with volume ${how} the average. On the tape that reads as “they are selling big amounts”: more aggressive selling than buying on that candle. ${a.line2}`,
      notThis: es
        ? `No son wallets con nombre. Rojo + volumen alto = presión de venta en esa vela, no un fondo identificado.`
        : `These are not named wallets. Red + high volume = selling pressure on that candle, not an identified fund.`,
      watch: es
        ? `Reloj: ${clock}. Si el precio sigue abajo, el flujo de venta continúa. En BAJA tarde, vigila si se acerca a ${b.base}.`
        : `Clock: ${clock}. If price stays down, sell flow is continuing. Late DOWN, watch whether it is moving toward ${b.base}.`,
      advice: adviceSell(a, lang, tz, clock, ctx),
    };
  }

  if (a.type === "VOLUME") {
    const x = ratioFrom(a.line1);
    const how = x ? (es ? `${x} veces` : `${x}×`) : es ? "varias veces" : "many times";
    return {
      meaning: es
        ? `El volumen de ${b.symbol} en la última vela fue ${how} el promedio de las últimas 20. Reloj llama Extremo a un flujo mucho más grande de lo normal: se transó mucho ${b.symbol} en poco tiempo. Es una señal de flujo (dinero moviéndose), no un nombre de persona.`
        : `${b.symbol}’s latest candle traded ${how} the average of the last 20 candles. Reloj calls this Extreme when flow is far above normal: a lot of ${b.symbol} changed hands in a short time. It is a flow signal (money moving), not a person’s name.`,
      notThis: es
        ? `No es una ballena identificada. Reloj no ve wallets ni sabe quién compró o vendió. Solo compara el tamaño del flujo con el volumen típico.`
        : `This is not an identified whale. Reloj cannot see wallets and does not know who bought or sold. It only compares the size of the flow with typical volume.`,
      watch: es
        ? `Reloj: ${clock}. En la fase BAJA, volumen extremo puede ser venta, cobertura o un sacudón. Por sí solo no dice que el suelo ya llegó. ${analog}`
        : `Clock: ${clock}. In the DOWN phase, extreme volume can be selling, covering, or a shakeout. By itself it does not say the low is in. ${analog}`,
      advice: adviceVolume(a, lang, tz, clock, ctx),
    };
  }

  if (a.type === "ANALOG") {
    return {
      meaning: es
        ? `Compara el reloj BAJA de ${b.down} con los osos pasados de ${b.symbol}. Hoy el calendario ya va muy avanzado, pero el precio no se ha hundido como en esos ciclos. Por eso Reloj dice “ningún bear clásico”: el tiempo se parece; el precio no.`
        : `This compares the ${b.down} DOWN clock with ${b.symbol}’s past bears. The calendar is already late in the fall, but price has not crashed like those cycles. That is why Reloj says “no classic bear”: time looks like a late bear; the price does not.`,
      notThis: es
        ? `No es una orden de compra ni de venta. “Análogo / parecido” solo pregunta si este ciclo rima con uno pasado. Rima en el calendario, no en el porcentaje de caída.`
        : `This is not a buy or sell order. “Analog” only asks whether this cycle rhymes with a past one. It rhymes on the calendar, not on the size of the drop.`,
      watch: es
        ? `Vigilar ${b.window} y la zona base ${b.base}. Si la fecha del suelo modelo pasa sin suelo, los ciclos viejos dejan de ser el mapa.`
        : `Watch ${b.window} and the ${b.base} base zone. If the model low date passes with no low, old cycles stop being the map.`,
      advice: adviceAnalog(a, lang, tz, clock, ctx),
    };
  }

  if (a.type === "PRE_TURN") {
    return {
      meaning: es
        ? `${a.line1}. Faltan pocos días para el final del reloj de esta fase (${clock}). Reloj avisa antes del giro para que mires la ventana de suelo, no para que operes el día exacto.`
        : `${a.line1}. Only a few days remain on this phase clock (${clock}). Reloj warns before the turn so you watch the low window — not so you trade an exact day.`,
      notThis: es
        ? `No confirma el suelo. Un pre-giro es tiempo del modelo, no una vela mágica.`
        : `This does not confirm the low. A pre-turn is model time, not a magic candle.`,
      watch: es ? `${copy.turnZone} ${analog}` : `${copy.turnZone} ${analog}`,
      advice: advicePreTurn(a, lang, tz, clock, ctx),
    };
  }

  if (a.type === "TURN") {
    return {
      meaning: es
        ? `${a.line1}. ${a.line2} Un giro en Reloj es la zona de tiempo (y a veces de precio) donde el modelo busca el suelo o el techo — candidato, no hecho.`
        : `${a.line1}. ${a.line2} A turn in Reloj is the time zone (and sometimes the price zone) where the model looks for the low or the high — a candidate, not a fact.`,
      notThis: es
        ? `No es “ya tocó fondo” ni “compra ahora”. Si el mapa se pasa de fecha, el aviso lo dice claro.`
        : `This is not “the bottom is in” and not “buy now.” If the map’s date has passed, the alert says so.`,
      watch: es ? `Reloj: ${clock}. ${analog}` : `Clock: ${clock}. ${analog}`,
      advice: adviceTurn(a, lang, tz, clock, copy),
    };
  }

  if (a.type === "BREAKOUT") {
    return {
      meaning: es
        ? `${a.line1}. El precio cerró fuera de su promedio reciente con volumen fuerte varias velas seguidas. Eso es un arranque de flujo, no un cambio de ciclo por sí solo.`
        : `${a.line1}. Price closed away from its recent average with strong volume on several candles. That is a flow breakout, not a cycle change by itself.`,
      notThis: es
        ? a.line2 === copy.trap
          ? `Reloj lo marca TRAMPA si el rebote ocurre dentro de la caja roja y aún falta mucho para el ${b.dayN}: un salto que suele devolver el precio.`
          : `No es un whale print ni la confirmación del suelo.`
        : a.line2 === copy.trap
          ? `Reloj marks TRAP if the bounce is inside the red box and ${b.dayN} is still far off: a jump that often gives the price back.`
          : `This is not a whale print and not confirmation of the low.`,
      watch: es ? `Reloj: ${clock}. ${analog}` : `Clock: ${clock}. ${analog}`,
      advice: adviceBreakout(a, lang, tz, clock, copy, ctx),
    };
  }

  if (a.type === "MOVE") {
    return {
      meaning: es
        ? `${a.line1}. ${a.line2} Reloj avisa cuando el spot se mueve agresivo en 5, 15 o 60 minutos — un golpe de precio, no un cambio de fase.`
        : `${a.line1}. ${a.line2} Reloj alerts when spot moves aggressively in 5, 15, or 60 minutes — a price jolt, not a phase change.`,
      notThis: es
        ? `No es analogía de osos pasados. Es flujo de precio en el momento.`
        : `This is not a past-bear analog. It is price flow right now.`,
      watch: es
        ? `Reloj: ${clock}. En BAJA, un salto fuerte puede ser sacudón. Márcalo Ruido si no te sirve.`
        : `Clock: ${clock}. In DOWN, a sharp jump can be a shakeout. Mark Noise if it is not useful.`,
      advice: adviceMove(a, lang, tz, clock, ctx),
    };
  }

  if (a.type === "WHALE") {
    return {
      meaning: es
        ? `${a.line1}. ${a.line2} Aquí “ballena” es un umbral de tamaño que tú pusiste en Ajustes, no un nombre público.`
        : `${a.line1}. ${a.line2} Here “whale” is a size threshold you set in Settings, not a public name.`,
      notThis: es
        ? `No identifica a una persona ni a un fondo.`
        : `It does not identify a person or a fund.`,
      watch: es ? `Reloj: ${clock}.` : `Clock: ${clock}.`,
      advice: adviceWhale(a, lang, tz, clock),
    };
  }

  return {
    meaning: a.line2 || copy.flowNote,
    notThis: copy.flowNote,
    watch: es ? `Reloj: ${clock}. ${analog}` : `Clock: ${clock}. ${analog}`,
    advice: es
      ? `${stamp(a, lang, tz, clock)}. Lee el aviso con el reloj, no solo con la vela. No es asesoría.`
      : `${stamp(a, lang, tz, clock)}. Read the alert with the clock, not only the candle. Not financial advice.`,
  };
}
