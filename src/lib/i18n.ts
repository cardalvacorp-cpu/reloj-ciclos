import { fmtCycle, type Lang } from "@/lib/cycle/time";

export type Copy = {
  appName: string;
  headerStrip: string;
  tabs: { clock: string; map: string; chart: string; alerts: string };
  settings: string;
  bullish: string;
  bearish: string;
  elapsed: string;
  remaining: string;
  years: string;
  months: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  spot: string;
  vsAth: string;
  vsStart: string;
  chg24h: string;
  looksLike: string;
  btnMarket: string;
  btnAnalog: string;
  btnShare: string;
  btnRoom: string;
  exitRoom: string;
  frozenPrice: string;
  turnZone: string;
  modelLowPassed: string;
  missedMap: string;
  scenario: string;
  rangeTitle: string;
  rangeBody: (low: string, mild: string, base: string) => string;
  footer: string;
  youAreHere: string;
  now: string;
  jumpNow: string;
  future: string;
  inProgress: string;
  genesis: string;
  up: string;
  down: string;
  halvingsNote: string;
  tapPhase: string;
  dateFrom: string;
  dateTo: string;
  analog: string;
  detail: string;
  hInPhase: string;
  daysLabel: string;
  model: string;
  real: string;
  miss: string;
  move: string;
  avgMiss: string;
  scoreTitle: string;
  ifWrong: string;
  markLow: string;
  markHigh: string;
  noRhyme: string;
  lowDate: string;
  lowPrice: string;
  highDate: string;
  highPrice: string;
  save: string;
  cancel: string;
  tf: string;
  log: string;
  presets: {
    phase: string;
    c3: string;
    from2015: string;
    genesis: string;
    to2038: string;
  };
  alertsEmpty: string;
  alertsIntro: string;
  whatItMeans: string;
  whatItIsNot: string;
  whatToWatch: string;
  commonSense: string;
  matters: string;
  noise: string;
  seen: string;
  all: string;
  layers: { clock: string; analog: string; flow: string };
  types: Record<string, string>;
  volNormal: string;
  volHigh: string;
  volAgg: string;
  volExt: string;
  flowNote: string;
  trap: string;
  candidate: string;
  lab: string;
  myBase: string;
  preset364: string;
  presetC2: string;
  presetC3: string;
  exportJson: string;
  exportCsv: string;
  importJson: string;
  reset: string;
  tz: string;
  athDate: string;
  athUsd: string;
  upDays: string;
  downDays: string;
  lowPct: string;
  multiples: string;
  whalePrint: string;
  whaleCluster: string;
  volAggTh: string;
  volExtTh: string;
  showRanges: string;
  muteBounce: string;
  notify: string;
  lang: string;
  installTitle: string;
  installIos: string;
  installAnd: string;
  installIconHint: string;
  notifyDenied: string;
  onb1: string;
  onb2: string;
  onb3: string;
  onb4: string;
  start: string;
  skip: string;
  shareFail: string;
  copied: string;
  phaseEnd: string;
  nextHigh: string;
  nextLow: string;
  followingHigh: string;
  today: string;
  volume: string;
  zones: string;
  ghosts: string;
  chartEmpty: string;
  retry: string;
  live: string;
  expandChart: string;
  exitChart: string;
  rotateHint: string;
  enableMoveAlerts: string;
  alertsOn: string;
  chartPrice: string;
  chartCycle: string;
  cycleStart: string;
  cycleEnd: string;
  cycleHint: string;
  cycleTint: string;
  bullTarget: string;
  bearTarget: string;
  targets: string;
  targetsNote: string;
  chartKey: string;
  chartKeyNote: string;
  chartEasy: string;
  chartMapLines: string;
  chartGhostsOn: string;
  chartNowHint: string;
  chartMapHint: string;
  chartAnalogHint: string;
  chartAll: string;
  chartAllHint: string;
  chartEpoch: (up: boolean) => string;
  chartEpochTf: (up: boolean) => string;
  chartEpochHint: (up: boolean, day: number, total: number) => string;
  chartIfUp: string;
  chartIfDown: string;
  nextBull: string;
  nextBear: string;
  usingNow: string;
  visitsLabel: string;
  avgStay: string;
  notAdvice: string;
  roomHint: string;
  priceFrozenShort: string;
  pickCoin: string;
  measured: string;
  whyThese: string;
  studyTitle: string;
  cycleAth: string;
  allTime: string;
  peakedVs: string;
  coinsStrip: string;
  presetDown: string;
  presetPrior: string;
  presetC3up: string;
  tipTitle: string;
  tipBody: string;
  tipCoffee: string;
  tipDinner: string;
  tipTheClock: string;
  tipOther: string;
  tipPayPal: string;
  tipNotFee: string;
  tipOrCrypto: string;
  tipPaypalCoins: string;
  tipCopy: string;
  tipCopied: string;
  tipQr: string;
  tipThanks: string;
  tipEmpty: string;
  tipPaste: string;
  tipPaypalMe: string;
  tipPaypalEmpty: string;
  tipViaPaypal: string;
  tipScanPaypal: string;
  tipAddr: string;
  tipClose: string;

  /* Brand + home thesis */
  brandSubtitle: string;
  hookLine: (pct: string, dd: string) => string;
  hookNote: string;
  nowTitle: string;
  nowPhase: string;
  nowVsHigh: string;
  nowToTest: string;
  daysShort: string;
  testTitle: string;
  callTitle: string;
  callBody: (date: string) => string;
  callFail: (date: string) => string;
  analogZone: string;
  analogNote: string;
  cardTension: (pct: string, dd: string) => [string, string, string];
  copyImage: string;
  copyPost: string;
  cardPortrait: string;
  cardLandscape: string;
  ctaMethod: string;
  ctaTest: string;
  ctaShare: string;
  ctaAlerts: string;

  /* Thesis pages */
  navHome: string;
  navMethod: string;
  navTest: string;
  navFaq: string;
  navContact: string;
  historyTitle: string;
  historyNote: string;
  historySource: (source: string, when: string) => string;
  historyStale: string;
  historyLoading: string;

  /* Share + vote + updates */
  shareCopyBtn: string;
  shareCopied: string;
  sundayTitle: string;
  sundayBtn: string;
  voteTitle: string;
  voteQuestion: string;
  voteYes: string;
  voteNo: string;
  voteTally: (yes: number, total: number) => string;
  voteThanks: string;
  voteLocal: string;

  /* Alert signup */
  alertsEmailTitle: string;
  alertsEmailBody: string;
  alertsEmailPlaceholder: string;
  alertsEmailCta: string;
  alertsEmailSaved: string;
  alertsTriggers: string[];

  /* Donation */
  donateLine: string;
  donateSigned: string;
};

const ES: Copy = {
  appName: "Watch Cycles",
  headerStrip: "Tiempo = 1.064 / 364. Precio = escenario. No es asesoría.",
  tabs: { clock: "Reloj", map: "Mapa", chart: "Chart", alerts: "Alertas" },
  settings: "Ajustes",
  bullish: "ALCISTA",
  bearish: "BAJISTA",
  elapsed: "Recorrido",
  remaining: "Falta",
  years: "años",
  months: "meses",
  days: "días",
  hours: "h",
  minutes: "min",
  seconds: "s",
  spot: "Spot",
  vsAth: "vs ATH",
  vsStart: "vs inicio",
  chg24h: "24h",
  looksLike: "Parecido ahora",
  btnMarket: "¿Qué hace el mercado?",
  btnAnalog: "¿A cuál se parece?",
  btnShare: "Compartir tarjeta",
  btnRoom: "Modo sala",
  exitRoom: "Salir de sala",
  frozenPrice: "Precio congelado. El reloj de ciclo sigue vivo.",
  turnZone:
    "Zona de posible cambio. El modelo ya se desvió entre −1 y +12 días.",
  modelLowPassed: "El suelo modelo ya pasó. Pon el suelo REAL para recalcular.",
  missedMap: "El mapa de osos pasados falló en tiempo. No fuerces el ancla.",
  scenario: "Escenario. El reloj no produce precio.",
  rangeTitle: "Rango de suelo",
  rangeBody: (low, mild, base) =>
    `Suelo ${low} · ${mild} · zona base ${base}`,
  footer: "Watch Cycles. Tiempo = 1.064 / 364. Precio = escenario. No es asesoría.",
  youAreHere: "ESTÁS AQUÍ",
  now: "Ahora",
  jumpNow: "Ir a ahora",
  future: "Futuro",
  inProgress: "En curso",
  genesis: "Génesis",
  up: "SUBE",
  down: "BAJA",
  halvingsNote: "El halving no mueve el reloj. Solo es una marca H.",
  tapPhase: "Toca una fase para ver fechas, días y analogía.",
  dateFrom: "Desde",
  dateTo: "Hasta",
  analog: "Análogo",
  detail: "Detalle",
  hInPhase: "H en esta fase",
  daysLabel: "Días",
  model: "Modelo",
  real: "Real",
  miss: "Desvío",
  move: "% movimiento",
  avgMiss: "Error medio de las bajas",
  scoreTitle: "Marcador de aciertos",
  ifWrong: "Si me equivoco",
  markLow: "Marcar suelo real",
  markHigh: "Marcar techo real",
  noRhyme: "Este ciclo no copia",
  lowDate: "Fecha del suelo",
  lowPrice: "Precio del suelo (USD)",
  highDate: "Fecha del techo",
  highPrice: "Precio del techo (USD)",
  save: "Guardar",
  cancel: "Cancelar",
  tf: "Intervalo",
  log: "Log",
  presets: {
    phase: "Fase actual",
    c3: "Ciclo 3",
    from2015: "Desde 2015",
    genesis: "Génesis",
    to2038: "Hasta 2038",
  },
  alertsEmpty: "Sin avisos todavía. El radar y el flujo aparecerán aquí.",
  alertsIntro:
    "Cada aviso es un hecho del reloj, del parecido con ciclos pasados, o del flujo de precio. Abajo: qué significa, qué no es, qué vigilar, y el sentido común para esa hora. No es consejo financiero.",
  whatItMeans: "Qué significa",
  whatItIsNot: "Qué no es",
  whatToWatch: "Qué vigilar",
  commonSense: "Sentido común",
  matters: "Me importa",
  noise: "Ruido",
  seen: "Ya lo vi",
  all: "Todas",
  layers: { clock: "Reloj", analog: "Parecido", flow: "Flujo" },
  types: {
    BREAKOUT: "ARRANQUE",
    WHALE: "BALLENA",
    VOLUME: "VOLUMEN",
    BUY: "COMPRAN",
    SELL: "VENDEN",
    ANALOG: "PARECIDO",
    TURN: "GIRO",
    PRE_TURN: "PRE-GIRO",
    MOVE: "MOVIMIENTO",
  },
  volNormal: "Normal",
  volHigh: "Alto",
  volAgg: "Agresivo",
  volExt: "Extremo",
  flowNote: "Señal de flujo grande, no una ballena identificada.",
  trap: "TRAMPA",
  candidate: "Suelo candidato, no confirmado.",
  lab: "Laboratorio",
  myBase: "Mi base",
  preset364: "BAJA medida",
  presetC2: "BAJA anterior",
  presetC3: "SUBE real",
  exportJson: "Exportar JSON",
  exportCsv: "Exportar CSV",
  importJson: "Importar ancla",
  reset: "Reset a mi base",
  tz: "Zona horaria",
  athDate: "ATH fecha-hora",
  athUsd: "ATH USD",
  upDays: "Días SUBE",
  downDays: "Días BAJA",
  lowPct: "% suelo",
  multiples: "Múltiplos de techo",
  whalePrint: "Print",
  whaleCluster: "Cluster /h",
  volAggTh: "Vol agresivo",
  volExtTh: "Vol extremo",
  showRanges: "Mostrar rangos",
  muteBounce: "Silenciar rebotes en caja roja",
  notify: "Alertas al teléfono (movimiento agresivo)",
  lang: "Idioma",
  installTitle: "Añadir a pantalla de inicio",
  installIos:
    "En Safari: botón Compartir → Añadir a pantalla de inicio. El icono es tu retrato. Se abre a pantalla completa con esta imagen.",
  installAnd:
    "En Chrome: menú ⋮ → Instalar aplicación o Añadir a pantalla de inicio. El icono es tu retrato.",
  installIconHint: "Así se ve en la pantalla de inicio.",
  notifyDenied: "Notificaciones bloqueadas en el navegador.",
  onb1: "Cada moneda tiene su propio reloj. BTC sube 1.064 y baja 364. Las otras se midieron coin por coin.",
  onb2: "Hoy estás en la BAJA. El día y el total salen del ciclo de esa moneda.",
  onb3: "El precio es un rango, no un target.",
  onb4: "Elige idioma y empieza. Esto es una predicción personal, no asesoría.",
  start: "Empezar",
  skip: "Saltar",
  shareFail: "No se pudo compartir. Se descargó la tarjeta.",
  copied: "Copiado",
  phaseEnd: "Fin de fase",
  nextHigh: "Próximo techo",
  nextLow: "Próximo suelo",
  followingHigh: "Siguiente techo",
  today: "HOY",
  volume: "Volumen",
  zones: "Zonas",
  ghosts: "Osos pasados",
  chartEmpty: "No se pudieron cargar las velas. El reloj sigue vivo.",
  retry: "Reintentar",
  live: "EN VIVO",
  expandChart: "Pantalla completa",
  exitChart: "Cerrar",
  rotateHint: "Gira el teléfono. Pellizca y arrastra el chart como en TradingView.",
  enableMoveAlerts: "Activar alertas en el teléfono cuando el precio se mueva agresivo.",
  alertsOn: "Alertas de movimiento: ON",
  chartPrice: "Precio",
  chartCycle: "Verde / Rojo",
  cycleStart: "Empieza",
  cycleEnd: "Termina",
  cycleHint: "Pellizca o usa + / − para ver fechas, precio y velas.",
  cycleTint:
    "Verde = ciclo que SUBE. Rojo = ciclo que BAJA. Los días son los de esa moneda.",
  bullTarget: "Alcista",
  bearTarget: "Bajista",
  targets: "Objetivos de precio",
  targetsNote:
    "Fibonacci del swing de cada intervalo, elegido con el reloj. No es una orden. El mapa de ciclo sigue siendo la zona de suelo.",
  chartKey: "Qué es cada número",
  chartKeyNote:
    "Cada caja con nombre a la derecha es una línea. Léelas de arriba abajo. No es asesoría.",
  chartEasy: "Ahora",
  chartMapLines: "Mapa del ciclo",
  chartGhostsOn: "Osos pasados",
  chartNowHint: "Precio de ahora, y el siguiente Fib si sube o si baja.",
  chartMapHint: "ATH, −50%, zona base y caída severa del reloj.",
  chartAnalogHint: "Este reloj contra los osos pasados de esta moneda.",
  chartAll: "Todos los números",
  chartAllHint:
    "Todas las líneas juntas: ATH, Fibonacci, EN VIVO, −50%, base, severo y osos pasados.",
  chartEpoch: (up) => (up ? "Días SUBE" : "Días BAJA"),
  chartEpochTf: (up) => (up ? "SUBE" : "BAJA"),
  chartEpochHint: (up, day, total) =>
    `Chart solo de esta época. ${up ? "Alcista." : "Bajista."} Vas ${day} de ${total}. El hueco a la derecha es lo que falta.`,
  chartIfUp: "Si sube",
  chartIfDown: "Si baja",
  nextBull: "Siguiente alcista",
  nextBear: "Siguiente bajista · base",
  usingNow: "usando ahora",
  visitsLabel: "visitas",
  avgStay: "tiempo medio",
  notAdvice: "No es asesoría.",
  roomHint: "Números grandes. El reloj sigue a 1 Hz.",
  priceFrozenShort: "Precio congelado",
  pickCoin: "Moneda",
  measured: "Ciclo medido",
  whyThese:
    "Lo que la gente está comprando para el próximo bull. Cada reloj se midió coin por coin — no copian 1.064/364 de BTC.",
  studyTitle: "Estudio de este ciclo",
  cycleAth: "Techo de este ciclo",
  allTime: "ATH histórico",
  peakedVs: "Vs Bitcoin",
  coinsStrip: "BTC · ETH · SOL · JUP · XRP · BNB · DOGE · ADA · LINK · AVAX · SUI",
  presetDown: "BAJA medida",
  presetPrior: "BAJA anterior",
  presetC3up: "SUBE real de este ciclo",
  tipTitle: "Donar",
  tipBody: "Donaciones para mantener el sitio vivo. — Watch Cycles",
  tipCoffee: "Café",
  tipDinner: "Cena",
  tipTheClock: "El reloj",
  tipOther: "Otra cantidad",
  tipPayPal: "Pagar con PayPal",
  tipNotFee: "No es un cobro por consejo. El reloj es gratis y sigue gratis.",
  tipOrCrypto: "O envía cripto",
  tipPaypalCoins:
    "BTC, ETH y PYUSD (Solana) directo al monedero de PayPal. Las otras, en la app.",
  tipCopy: "Copiar",
  tipCopied: "Copiado",
  tipQr: "QR para escanear",
  tipThanks: "Gracias. El reloj queda para todos.",
  tipEmpty: "Cuando la dirección esté publicada, copia o escanea el QR.",
  tipPaste:
    "Pega aquí el usuario de PayPal.me y las direcciones públicas. Se guarda en este dispositivo.",
  tipPaypalMe: "Usuario de PayPal.me",
  tipPaypalEmpty:
    "Falta el usuario de PayPal.me. Pégalo en Ajustes para encender el botón.",
  tipViaPaypal:
    "Mándalo con cripto de PayPal al mismo monedero. Copia la dirección.",
  tipScanPaypal: "Escanea para donar",
  tipAddr: "Dirección",
  tipClose: "Cerrar",

  brandSubtitle: "Reloj del ciclo de Bitcoin",
  hookLine: (pct, dd) => `${pct} del tiempo · solo ${dd} en precio`,
  hookNote:
    "El tiempo del ciclo ya casi se acabó. La caída de precio no ha llegado. Una de las dos cede.",
  nowTitle: "Dónde estamos",
  nowPhase: "Fase",
  nowVsHigh: "vs techo",
  nowToTest: "Falta para la prueba",
  daysShort: "d",
  testTitle: "Prueba del suelo del ciclo",
  callTitle: "La predicción",
  callBody: (date) =>
    `La predicción es una fecha, no un precio: ${date}. O se forma un suelo de ciclo alrededor de ahí, o el mapa se retira.`,
  callFail: (date) =>
    `Si pasa el ${date} sin un suelo mayor, el mapa viejo deja de ser el mapa. Se dice aquí, con fecha.`,
  analogZone: "Zona análoga histórica",
  analogNote:
    "Memoria de lo que hicieron C1 y C2, no un objetivo. El reloj no produce precio.",
  cardTension: (pct, dd) => [
    `${pct} del tiempo.`,
    `Solo ${dd} en precio.`,
    "Una de las dos cede.",
  ],
  copyImage: "Copiar imagen",
  copyPost: "Copiar el texto",
  cardPortrait: "Vertical",
  cardLandscape: "Horizontal",
  ctaMethod: "Método",
  ctaTest: "La prueba",
  ctaShare: "Compartir",
  ctaAlerts: "Alertas",

  navHome: "Reloj",
  navMethod: "Método",
  navTest: "La prueba",
  navFaq: "Preguntas",
  navContact: "Contacto",
  historyTitle: "Registro",
  historyNote:
    "Se genera solo, cada semana, con los cierres diarios del mercado contra el techo publicado. Nadie lo escribe a mano, así que no se puede maquillar después.",
  historySource: (source, when) => `Fuente: ${source} · actualizado ${when}`,
  historyStale:
    "No se pudo contactar a los exchanges. Se muestra el último registro bueno.",
  historyLoading: "Generando el registro…",

  shareCopyBtn: "Copiar texto para X",
  shareCopied: "Copiado",
  sundayTitle: "Actualización de domingo",
  sundayBtn: "Copiar la actualización",
  voteTitle: "Voto público",
  voteQuestion: "¿Aguanta el ciclo esta vez?",
  voteYes: "Sí",
  voteNo: "No",
  voteTally: (yes, total) =>
    total === 0 ? "Sé el primero en votar." : `${yes}% dice que sí · ${total} votos`,
  voteThanks: "Voto registrado.",
  voteLocal: "Se guarda en este dispositivo.",

  alertsEmailTitle: "Avísame",
  alertsEmailBody:
    "Tres disparadores, nada más. Sin boletín, sin spam, sin vender el correo.",
  alertsEmailPlaceholder: "tu@correo.com",
  alertsEmailCta: "Apuntarme",
  alertsEmailSaved: "Guardado en este dispositivo. El envío por correo todavía no está conectado.",
  alertsTriggers: [
    "7 días antes de la prueba del suelo del ciclo.",
    "El precio entra en la zona base.",
    "Movimiento agresivo del precio.",
  ],

  donateLine: "Donaciones para mantener el sitio vivo.",
  donateSigned: "— Watch Cycles",
};

const EN: Copy = {
  appName: "Watch Cycles",
  headerStrip: "Time = 1,064 / 364. Price = scenario. Not financial advice.",
  tabs: { clock: "Clock", map: "Map", chart: "Chart", alerts: "Alerts" },
  settings: "Settings",
  bullish: "BULLISH",
  bearish: "BEARISH",
  elapsed: "Elapsed",
  remaining: "Left",
  years: "years",
  months: "months",
  days: "days",
  hours: "h",
  minutes: "min",
  seconds: "s",
  spot: "Spot",
  vsAth: "vs ATH",
  vsStart: "vs start",
  chg24h: "24h",
  looksLike: "Looks like now",
  btnMarket: "What is the market doing?",
  btnAnalog: "What does it look like?",
  btnShare: "Share card",
  btnRoom: "Room mode",
  exitRoom: "Exit room",
  frozenPrice: "Price frozen. The cycle clock is still live.",
  turnZone: "Possible turn zone. This model has already missed by −1 to +12 days.",
  modelLowPassed: "The model low has passed. Set the REAL low to recalculate.",
  missedMap: "The past-bear map missed on time. Do not force the anchor.",
  scenario: "Scenario. The clock does not produce price.",
  rangeTitle: "Low range",
  rangeBody: (low, mild, base) => `Low ${low} · ${mild} · base zone ${base}`,
  footer: "Watch Cycles. Time = 1,064 / 364. Price = scenario. Not financial advice.",
  youAreHere: "YOU ARE HERE",
  now: "Now",
  jumpNow: "Go to now",
  future: "Future",
  inProgress: "In progress",
  genesis: "Genesis",
  up: "UP",
  down: "DOWN",
  halvingsNote: "The halving does not move the clock. It is only an H mark.",
  tapPhase: "Tap a phase for dates, days, range and analog.",
  dateFrom: "From",
  dateTo: "To",
  analog: "Analog",
  detail: "Detail",
  hInPhase: "H in this phase",
  daysLabel: "Days",
  model: "Model",
  real: "Real",
  miss: "Miss",
  move: "% move",
  avgMiss: "Average down-phase miss",
  scoreTitle: "Hit tracker",
  ifWrong: "If I am wrong",
  markLow: "Mark real low",
  markHigh: "Mark real high",
  noRhyme: "This cycle does not rhyme",
  lowDate: "Low date",
  lowPrice: "Low price (USD)",
  highDate: "High date",
  highPrice: "High price (USD)",
  save: "Save",
  cancel: "Cancel",
  tf: "Timeframe",
  log: "Log",
  presets: {
    phase: "Current phase",
    c3: "Cycle 3",
    from2015: "Since 2015",
    genesis: "Genesis",
    to2038: "Until 2038",
  },
  alertsEmpty: "No alerts yet. Radar and flow will land here.",
  alertsIntro:
    "Each alert is a fact from the clock, from how this cycle compares to past ones, or from price flow. Below: what it means, what it is not, what to watch, and common sense for that moment. Not financial advice.",
  whatItMeans: "What this means",
  whatItIsNot: "What this is not",
  whatToWatch: "What to watch",
  commonSense: "Common sense",
  matters: "Matters",
  noise: "Noise",
  seen: "Seen",
  all: "All",
  layers: { clock: "Clock", analog: "Analog", flow: "Flow" },
  types: {
    BREAKOUT: "BREAKOUT",
    WHALE: "WHALE",
    VOLUME: "VOLUME",
    BUY: "BUYING",
    SELL: "SELLING",
    ANALOG: "ANALOG",
    TURN: "TURN",
    PRE_TURN: "PRE-TURN",
    MOVE: "MOVE",
  },
  volNormal: "Normal",
  volHigh: "High",
  volAgg: "Aggressive",
  volExt: "Extreme",
  flowNote: "Large-flow signal, not an identified whale.",
  trap: "TRAP",
  candidate: "Candidate low, not confirmed.",
  lab: "Laboratory",
  myBase: "My base",
  preset364: "Measured DOWN",
  presetC2: "Prior DOWN",
  presetC3: "Real UP",
  exportJson: "Export JSON",
  exportCsv: "Export CSV",
  importJson: "Import anchor",
  reset: "Reset to my base",
  tz: "Timezone",
  athDate: "ATH date-time",
  athUsd: "ATH USD",
  upDays: "UP days",
  downDays: "DOWN days",
  lowPct: "Low %",
  multiples: "Ceiling multiples",
  whalePrint: "Print",
  whaleCluster: "Cluster /h",
  volAggTh: "Aggressive vol",
  volExtTh: "Extreme vol",
  showRanges: "Show ranges",
  muteBounce: "Mute bounces in the red box",
  notify: "Phone alerts (aggressive moves)",
  lang: "Language",
  installTitle: "Add to Home Screen",
  installIos:
    "In Safari: Share → Add to Home Screen. The icon is this portrait. Opens full-screen on this image.",
  installAnd:
    "In Chrome: menu ⋮ → Install app or Add to Home Screen. The icon is this portrait.",
  installIconHint: "This is how it looks on the Home Screen.",
  notifyDenied: "Notifications blocked in the browser.",
  onb1: "Each coin has its own clock. BTC rises 1,064 and falls 364. The others were measured coin by coin.",
  onb2: "You are in the DOWN phase. Day and total come from that coin’s cycle.",
  onb3: "Price is a range, not a target.",
  onb4: "Pick a language and start. This is a personal forecast, not advice.",
  start: "Start",
  skip: "Skip",
  shareFail: "Could not share. The card was downloaded.",
  copied: "Copied",
  phaseEnd: "Phase end",
  nextHigh: "Next high",
  nextLow: "Next low",
  followingHigh: "Following high",
  today: "TODAY",
  volume: "Volume",
  zones: "Zones",
  ghosts: "Past bears",
  chartEmpty: "Could not load candles. The cycle clock is still live.",
  retry: "Retry",
  live: "LIVE",
  expandChart: "Full screen",
  exitChart: "Close",
  rotateHint: "Turn the phone on its side. Pinch and drag the chart like TradingView.",
  enableMoveAlerts: "Turn on phone alerts when price makes an aggressive move.",
  alertsOn: "Move alerts: ON",
  chartPrice: "Price",
  chartCycle: "Green / Red",
  cycleStart: "Starts",
  cycleEnd: "Ends",
  cycleHint: "Pinch or use + / − to see dates, price, and candles.",
  cycleTint:
    "Green = UP cycle. Red = DOWN cycle. Day counts are this coin’s, not Bitcoin’s.",
  bullTarget: "Bullish",
  bearTarget: "Bearish",
  targets: "Price targets",
  targetsNote:
    "Fibonacci from each timeframe’s swing, picked with the clock. Not a call. The cycle map is still the low zone.",
  chartKey: "What each number is",
  chartKeyNote:
    "Every named box on the right is a line. Read them from the top down. Not financial advice.",
  chartEasy: "Now",
  chartMapLines: "Cycle map",
  chartGhostsOn: "Past bears",
  chartNowHint: "Price now, and the next Fib if it goes up or down.",
  chartMapHint: "ATH, −50%, base zone, and the severe drop on the clock.",
  chartAnalogHint: "This clock against this coin’s past bears.",
  chartAll: "All numbers",
  chartAllHint:
    "Every line together: ATH, Fibonacci, LIVE, −50%, base, severe, and past bears.",
  chartEpoch: (up) => (up ? "Days UP" : "Days DOWN"),
  chartEpochTf: (up) => (up ? "UP" : "DOWN"),
  chartEpochHint: (up, day, total) =>
    `Chart of this epoch only. ${up ? "Bullish." : "Bearish."} Day ${day} of ${total}. Empty space on the right is what's left.`,
  chartIfUp: "If it goes up",
  chartIfDown: "If it goes down",
  nextBull: "Next bullish",
  nextBear: "Next bearish · base",
  usingNow: "using now",
  visitsLabel: "visits",
  avgStay: "avg time",
  notAdvice: "Not financial advice.",
  roomHint: "Large numbers. The clock still ticks at 1 Hz.",
  priceFrozenShort: "Price frozen",
  pickCoin: "Coin",
  measured: "Measured cycle",
  whyThese:
    "What people are buying for the next bull. Each clock was measured coin by coin — they do not copy BTC’s 1,064/364.",
  studyTitle: "This cycle’s study",
  cycleAth: "This-cycle high",
  allTime: "All-time high",
  peakedVs: "Vs Bitcoin",
  coinsStrip: "BTC · ETH · SOL · JUP · XRP · BNB · DOGE · ADA · LINK · AVAX · SUI",
  presetDown: "Measured DOWN",
  presetPrior: "Prior DOWN",
  presetC3up: "This cycle’s real UP",
  tipTitle: "Donate",
  tipBody: "Donations to keep the website alive. — Watch Cycles",
  tipCoffee: "Coffee",
  tipDinner: "Dinner",
  tipTheClock: "The clock",
  tipOther: "Other amount",
  tipPayPal: "Pay with PayPal",
  tipNotFee: "Not a fee for advice. The clock is free and stays free.",
  tipOrCrypto: "Or send crypto",
  tipPaypalCoins:
    "BTC, ETH, and PYUSD (Solana) straight to the PayPal wallet. Other coins, in the app.",
  tipCopy: "Copy",
  tipCopied: "Copied",
  tipQr: "QR to scan",
  tipThanks: "Thank you. The clock stays for everyone.",
  tipEmpty: "When the address is published, copy it or scan the QR.",
  tipPaste:
    "Paste the PayPal.me username and public addresses here. They stay on this device.",
  tipPaypalMe: "PayPal.me username",
  tipPaypalEmpty: "PayPal.me username is missing. Paste it in Settings to turn the button on.",
  tipViaPaypal: "Send it with PayPal crypto to the same wallet. Copy the address.",
  tipScanPaypal: "Scan to donate",
  tipAddr: "Address",
  tipClose: "Close",

  brandSubtitle: "Bitcoin cycle clock",
  hookLine: (pct, dd) => `${pct} of the time · only ${dd} in price`,
  hookNote:
    "Cycle time is nearly spent. The price drawdown has not arrived. One of the two gives.",
  nowTitle: "Where we are",
  nowPhase: "Phase",
  nowVsHigh: "vs high",
  nowToTest: "To the test",
  daysShort: "d",
  testTitle: "Cycle-low test",
  callTitle: "The call",
  callBody: (date) =>
    `The call is a date, not a price: ${date}. Either a cycle low forms around then, or the map gets retired.`,
  callFail: (date) =>
    `If ${date} passes with no major low, the old map is no longer the map. Said here, with a date.`,
  analogZone: "Historical analog zone",
  analogNote:
    "A memory of what C1 and C2 did, not a target. The clock does not produce price.",
  cardTension: (pct, dd) => [
    `${pct} of the time.`,
    `Only ${dd} in price.`,
    "One of the two gives.",
  ],
  copyImage: "Copy image",
  copyPost: "Copy post",
  cardPortrait: "Portrait",
  cardLandscape: "Landscape",
  ctaMethod: "Method",
  ctaTest: "The test",
  ctaShare: "Share",
  ctaAlerts: "Alerts",

  navHome: "Clock",
  navMethod: "Method",
  navTest: "The test",
  navFaq: "FAQ",
  navContact: "Contact",
  historyTitle: "Log",
  historyNote:
    "Generated automatically each week from the market's daily closes against the published high. Nobody types it in, so it cannot be tidied up after the fact.",
  historySource: (source, when) => `Source: ${source} · updated ${when}`,
  historyStale: "Could not reach the exchanges. Showing the last good log.",
  historyLoading: "Building the log…",

  shareCopyBtn: "Copy post text",
  shareCopied: "Copied",
  sundayTitle: "Sunday update",
  sundayBtn: "Copy the update",
  voteTitle: "Public vote",
  voteQuestion: "Does the cycle hold this time?",
  voteYes: "Yes",
  voteNo: "No",
  voteTally: (yes, total) =>
    total === 0 ? "Be the first to vote." : `${yes}% say yes · ${total} votes`,
  voteThanks: "Vote recorded.",
  voteLocal: "Stored on this device.",

  alertsEmailTitle: "Tell me when",
  alertsEmailBody: "Three triggers, nothing else. No newsletter, no spam, no selling the address.",
  alertsEmailPlaceholder: "you@email.com",
  alertsEmailCta: "Sign me up",
  alertsEmailSaved: "Saved on this device. Email delivery is not wired up yet.",
  alertsTriggers: [
    "7 days before the cycle-low test.",
    "Price enters the base zone.",
    "Aggressive price move.",
  ],

  donateLine: "Donations to keep the website alive.",
  donateSigned: "— Watch Cycles",
};

export function copy(lang: Lang): Copy {
  return lang === "es" ? ES : EN;
}

export function clockStrip(lang: Lang, up: number, down: number): string {
  const u = fmtCycle(up, lang);
  const d = fmtCycle(down, lang);
  return lang === "es"
    ? `Tiempo = ${u} / ${d}. Precio = escenario. No es asesoría.`
    : `Time = ${u} / ${d}. Price = scenario. Not financial advice.`;
}

export type PostArgs = {
  symbol: string;
  phase: string;
  day: number;
  total: number;
  pct: number;
  spot: string;
  dd: string;
  highDate: string;
  testDate: string;
  daysToTest: number;
  base: string;
  url: string;
};

/**
 * Ready-to-post text for X. Same facts as the share card and, like the card,
 * no dollar zone — the analog belongs on /method and /oct-5, not on the meme.
 */
export function sharePostText(lang: Lang, a: PostArgs): string {
  if (lang === "es") {
    return [
      a.phase,
      `${a.day}/${a.total} · ${a.dd} desde el techo del ${a.highDate}`,
      `${a.daysToTest} días para la prueba · ${a.testDate}`,
      ``,
      `${a.pct}% del tiempo está gastado. La mayor parte de la caída no.`,
      `Una de las dos cede.`,
      ``,
      a.url,
      `No es asesoría.`,
    ].join("\n");
  }
  return [
    a.phase,
    `${a.day}/${a.total} · ${a.dd} from the ${a.highDate} high`,
    `${a.daysToTest} days to the test · ${a.testDate}`,
    ``,
    `${a.pct}% of the time is spent. Most of the drawdown is not.`,
    `One of the two gives.`,
    ``,
    a.url,
    `Not financial advice.`,
  ].join("\n");
}

/** Weekly status post — longer than the share text, same discipline. */
export function sundayUpdateText(
  lang: Lang,
  a: PostArgs & { today: string; daysToTest: number },
): string {
  if (lang === "es") {
    return [
      `Watch Cycles — actualización del ${a.today}`,
      ``,
      `Fase: ${a.symbol} BAJA, día ${a.day} de ${a.total} (${a.pct}% del tiempo).`,
      `Precio: ${a.spot}, ${a.dd} contra el techo del ciclo.`,
      `Faltan ${a.daysToTest} días para la prueba del ${a.testDate}.`,
      `Zona base del escenario: ${a.base}.`,
      ``,
      `Lo que se vigila: que el precio entre en la zona base antes de la fecha.`,
      `Regla de invalidación: si pasa el ${a.testDate} sin suelo, el mapa viejo deja de ser el mapa.`,
      ``,
      `${a.url} · No es asesoría.`,
    ].join("\n");
  }
  return [
    `Watch Cycles — ${a.today} update`,
    ``,
    `Phase: ${a.symbol} DOWN, day ${a.day} of ${a.total} (${a.pct}% of the time).`,
    `Price: ${a.spot}, ${a.dd} against the cycle high.`,
    `${a.daysToTest} days to the ${a.testDate} test.`,
    `Scenario base zone: ${a.base}.`,
    ``,
    `What is being watched: price entering the base zone before the date.`,
    `Invalidation rule: if ${a.testDate} passes with no low, the old map is no longer the map.`,
    ``,
    `${a.url} · Not financial advice.`,
  ].join("\n");
}

export function marketPhrase(
  lang: Lang,
  args: {
    day: number;
    total: number;
    remain: string;
    lowDate: string;
    nextHigh: string;
    bullish: boolean;
  },
): string {
  if (args.bullish) {
    return lang === "es"
      ? `Alcista. Día ${args.day} de ${args.total}. Faltan ${args.remain} al ${args.nextHigh}.`
      : `Bullish. Day ${args.day} of ${args.total}. ${args.remain} left until ${args.nextHigh}.`;
  }
  return lang === "es"
    ? `Bajista. Día ${args.day} de ${args.total}. Faltan ${args.remain} al ${args.lowDate}. Después, alcista hasta el ${args.nextHigh}.`
    : `Bearish. Day ${args.day} of ${args.total}. ${args.remain} left until ${args.lowDate}. Then bullish until ${args.nextHigh}.`;
}

export function todayPhrase(
  lang: Lang,
  args: {
    day: number;
    total: number;
    spot: string;
    dd: string;
    base: string;
    remain: string;
    lowDate: string;
    inBase: boolean;
  },
): string {
  if (lang === "es") {
    return `Bajista. ${args.day}/${args.total}. Spot ${args.spot} (${args.dd}). Zona base ${args.base} ${args.inBase ? "alcanzada" : "todavía no"}. Faltan ${args.remain} al ${args.lowDate}. El reloj puede parecerse a osos pasados; el precio no.`;
  }
  return `Bearish. ${args.day}/${args.total}. Spot ${args.spot} (${args.dd}). Base zone ${args.base} ${args.inBase ? "reached" : "not reached"}. ${args.remain} to ${args.lowDate}. The clock may look like past bears; price does not.`;
}
