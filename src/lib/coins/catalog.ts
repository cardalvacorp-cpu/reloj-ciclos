import type { FrozenDef, ModelSettings } from "@/lib/cycle/model";

export type CoinId =
  | "BTC"
  | "ETH"
  | "SOL"
  | "XRP"
  | "BNB"
  | "DOGE"
  | "ADA"
  | "LINK"
  | "AVAX"
  | "SUI"
  | "JUP";

export type CoinPairs = {
  kraken?: string;
  krakenWs?: string;
  binanceUs?: string;
  binance?: string;
  coinbase?: string;
  kucoin?: string;
  bitstamp?: string;
  paprika?: string;
};

export type ScoreDown = {
  id: string;
  phase: { es: string; en: string };
  modelDays: number;
  realDays: number | null;
  missDays: number | null;
  movePct: number | null;
};

export type CoinSpec = {
  id: CoinId;
  symbol: string;
  name: string;
  digits: number;
  pairs: CoinPairs;
  thesis: { es: string; en: string };
  volumeWhy: { es: string; en: string };
  study: { es: string; en: string };
  peakedVsBtc: { es: string; en: string };
  allTimeHigh?: { local: string; price: number };
  frozen: FrozenDef[];
  defaultModel: ModelSettings;
  halvings: Array<{ id: string; local: string; label: string }>;
  scoreDowns: ScoreDown[];
  analogC1: { label: { es: string; en: string }; days: number; dd: number };
  analogC2: { label: { es: string; en: string }; days: number; dd: number };
  ghostC1: Array<[number, number]>;
  ghostC2: Array<[number, number]>;
  analogDdC1: Array<[number, number]>;
  analogDdC2: Array<[number, number]>;
};

const TZ_DEFAULT = "America/Chicago";

function model(
  athLocal: string,
  athUsd: number,
  upDays: number,
  downDays: number,
  lows: [number, number, number, number, number],
): ModelSettings {
  return {
    tz: TZ_DEFAULT,
    athLocal,
    athUsd,
    upDays,
    downDays,
    lowMild: lows[0],
    lowBaseLo: lows[1],
    lowBaseHi: lows[2],
    lowSevLo: lows[3],
    lowSevHi: lows[4],
    realLow: null,
    realHigh: null,
    noAnalog: false,
  };
}

const BTC_GHOST_C1: Array<[number, number]> = [
  [0, 19800],
  [0.08, 14000],
  [0.18, 9000],
  [0.35, 7000],
  [0.55, 7500],
  [0.72, 6400],
  [0.88, 4200],
  [1, 3200],
];
const BTC_GHOST_C2: Array<[number, number]> = [
  [0, 69000],
  [0.1, 47000],
  [0.22, 39000],
  [0.45, 30000],
  [0.58, 20000],
  [0.7, 19000],
  [0.89, 19000],
  [1, 16500],
  [1.033, 15500],
];
const BTC_DD_C1: Array<[number, number]> = [
  [0, 0],
  [0.12, -45],
  [0.35, -65],
  [0.7, -72],
  [0.89, -78],
  [1, -84],
];
const BTC_DD_C2: Array<[number, number]> = [
  [0, 0],
  [0.12, -35],
  [0.45, -55],
  [0.65, -70],
  [0.89, -71],
  [1, -75],
  [1.03, -77],
];

export const COINS: Record<CoinId, CoinSpec> = {
  BTC: {
    id: "BTC",
    symbol: "BTC",
    name: "Bitcoin",
    digits: 0,
    pairs: {
      kraken: "XBTUSD",
      krakenWs: "BTC/USD",
      binanceUs: "BTCUSDT",
      binance: "BTCUSDT",
      coinbase: "BTC-USD",
      kucoin: "BTC-USDT",
      bitstamp: "btcusd",
      paprika: "btc-bitcoin",
    },
    thesis: {
      es: "Ancla del mercado. El próximo bull de las altcoins sale de este reloj.",
      en: "Market anchor. The next altcoin bull is timed off this clock.",
    },
    volumeWhy: {
      es: "Más volumen y más liquidez que cualquier otra. Sigue siendo lo que la gente compra primero.",
      en: "More volume and liquidity than anything else. Still what people buy first.",
    },
    study: {
      es: "Tres ciclos maduros miden lo mismo: SUBE 1.064 días, BAJA 364. C1 1.068/363 (−84%). C2 1.061/376 (−77%). C3 subió 1.050 hasta el 6 oct 2025 a $126.198.",
      en: "Three mature cycles rhyme: UP 1,064 days, DOWN 364. C1 1,068/363 (−84%). C2 1,061/376 (−77%). C3 rose 1,050 into Oct 6, 2025 at $126,198.",
    },
    peakedVsBtc: {
      es: "Este es el reloj. El techo C3 es el 6 oct 2025.",
      en: "This is the clock. The C3 high is Oct 6, 2025.",
    },
    frozen: [
      { id: "genesis", cycleKey: "G", kind: "genesis", start: "2009-01-03", end: "2010-07-18", listedDays: 561, modelDays: null },
      { id: "a_up", cycleKey: "A", kind: "up", start: "2010-07-18", end: "2011-06-08", listedDays: 325, modelDays: null },
      { id: "a_down", cycleKey: "A", kind: "down", start: "2011-06-08", end: "2011-11-19", listedDays: 164, modelDays: null },
      { id: "b_up", cycleKey: "B", kind: "up", start: "2011-11-19", end: "2013-11-30", listedDays: 742, modelDays: null },
      { id: "b_down", cycleKey: "B", kind: "down", start: "2013-11-30", end: "2015-01-14", listedDays: 410, modelDays: null },
      { id: "c1_up", cycleKey: "1", kind: "up", start: "2015-01-14", end: "2017-12-17", listedDays: 1068, modelDays: 1064 },
      { id: "c1_down", cycleKey: "1", kind: "down", start: "2017-12-17", end: "2018-12-15", listedDays: 363, modelDays: 364, priceStart: 19800, priceEnd: 3200, drawdownPct: -84 },
      { id: "c2_up", cycleKey: "2", kind: "up", start: "2018-12-15", end: "2021-11-10", listedDays: 1061, modelDays: 1064 },
      { id: "c2_down", cycleKey: "2", kind: "down", start: "2021-11-10", end: "2022-11-21", listedDays: 376, modelDays: 364, priceStart: 69000, priceEnd: 15500, drawdownPct: -77 },
      { id: "c3_up", cycleKey: "3", kind: "up", start: "2022-11-21", end: "2025-10-06", listedDays: 1050, modelDays: 1064, priceEnd: 126198 },
    ],
    defaultModel: model("2025-10-06T00:00", 126198, 1064, 364, [50, 70, 77, 80, 85]),
    halvings: [
      { id: "H1", local: "2012-11-28", label: "H1" },
      { id: "H2", local: "2016-07-09", label: "H2" },
      { id: "H3", local: "2020-05-11", label: "H3" },
      { id: "H4", local: "2024-04-19", label: "H4" },
    ],
    scoreDowns: [
      { id: "c1_down", phase: { es: "C1 BAJA", en: "C1 DOWN" }, modelDays: 364, realDays: 363, missDays: -1, movePct: -84 },
      { id: "c2_down", phase: { es: "C2 BAJA", en: "C2 DOWN" }, modelDays: 364, realDays: 376, missDays: 12, movePct: -77 },
    ],
    analogC1: { label: { es: "2018", en: "2018" }, days: 363, dd: -84 },
    analogC2: { label: { es: "2022", en: "2022" }, days: 376, dd: -77 },
    ghostC1: BTC_GHOST_C1,
    ghostC2: BTC_GHOST_C2,
    analogDdC1: BTC_DD_C1,
    analogDdC2: BTC_DD_C2,
  },

  ETH: {
    id: "ETH",
    symbol: "ETH",
    name: "Ethereum",
    digits: 0,
    pairs: {
      kraken: "ETHUSD",
      krakenWs: "ETH/USD",
      binanceUs: "ETHUSDT",
      binance: "ETHUSDT",
      coinbase: "ETH-USD",
      kucoin: "ETH-USDT",
      bitstamp: "ethusd",
      paprika: "eth-ethereum",
    },
    thesis: {
      es: "Contratos, staking y ETFs. Es lo segundo que compra quien entra al próximo bull.",
      en: "Contracts, staking, and ETFs. The second thing people buy into the next bull.",
    },
    volumeWhy: {
      es: "Segundo en capitalización y de los más altos en volumen diario (~$13B).",
      en: "Second by market cap and among the highest daily volume (~$13B).",
    },
    study: {
      es: "C2 copió a BTC en la SUBIDA: 1.067 días (15 dic 2018 → 16 nov 2021). La BAJA de ETH es más corta: C1 336 días (−94%), C2 214 días (−82%). Media = 275. C3 subió 1.163 días hasta el 24 ago 2025 a $4.954 — 43 días ANTES que BTC.",
      en: "C2 copied BTC on the way up: 1,067 days (Dec 15, 2018 → Nov 16, 2021). ETH downs are shorter: C1 336 days (−94%), C2 214 days (−82%). Mean = 275. C3 rose 1,163 days into Aug 24, 2025 at $4,954 — 43 days BEFORE BTC.",
    },
    peakedVsBtc: {
      es: "Techo 43 días antes que BTC (24 ago vs 6 oct 2025).",
      en: "Peaked 43 days before BTC (Aug 24 vs Oct 6, 2025).",
    },
    frozen: [
      { id: "genesis", cycleKey: "G", kind: "genesis", start: "2015-07-30", end: "2016-12-16", listedDays: 505, modelDays: null },
      { id: "c1_up", cycleKey: "1", kind: "up", start: "2016-12-16", end: "2018-01-13", listedDays: 393, modelDays: 1067, priceEnd: 1432 },
      { id: "c1_down", cycleKey: "1", kind: "down", start: "2018-01-13", end: "2018-12-15", listedDays: 336, modelDays: 275, priceStart: 1432, priceEnd: 83, drawdownPct: -94 },
      { id: "c2_up", cycleKey: "2", kind: "up", start: "2018-12-15", end: "2021-11-16", listedDays: 1067, modelDays: 1067, priceEnd: 4892 },
      { id: "c2_down", cycleKey: "2", kind: "down", start: "2021-11-16", end: "2022-06-18", listedDays: 214, modelDays: 275, priceStart: 4892, priceEnd: 896, drawdownPct: -82 },
      { id: "c3_up", cycleKey: "3", kind: "up", start: "2022-06-18", end: "2025-08-24", listedDays: 1163, modelDays: 1067, priceEnd: 4954 },
    ],
    defaultModel: model("2025-08-24T00:00", 4954, 1067, 275, [50, 70, 82, 85, 94]),
    halvings: [],
    scoreDowns: [
      { id: "c1_down", phase: { es: "C1 BAJA", en: "C1 DOWN" }, modelDays: 275, realDays: 336, missDays: 61, movePct: -94 },
      { id: "c2_down", phase: { es: "C2 BAJA", en: "C2 DOWN" }, modelDays: 275, realDays: 214, missDays: -61, movePct: -82 },
    ],
    analogC1: { label: { es: "2018", en: "2018" }, days: 336, dd: -94 },
    analogC2: { label: { es: "2022", en: "2022" }, days: 214, dd: -82 },
    ghostC1: [[0, 1432], [0.12, 700], [0.35, 400], [0.7, 200], [0.89, 110], [1, 83]],
    ghostC2: [[0, 4892], [0.15, 3000], [0.4, 1800], [0.7, 1100], [1, 896]],
    analogDdC1: [[0, 0], [0.12, -50], [0.35, -72], [0.7, -86], [0.89, -92], [1, -94]],
    analogDdC2: [[0, 0], [0.15, -38], [0.4, -63], [0.7, -77], [1, -82]],
  },

  SOL: {
    id: "SOL",
    symbol: "SOL",
    name: "Solana",
    digits: 2,
    pairs: {
      kraken: "SOLUSD",
      krakenWs: "SOL/USD",
      binanceUs: "SOLUSDT",
      binance: "SOLUSDT",
      coinbase: "SOL-USD",
      kucoin: "SOL-USDT",
      bitstamp: "solusd",
      paprika: "sol-solana",
    },
    thesis: {
      es: "L1 de alta beta. Es el altcoin que más se nombra para el próximo bull.",
      en: "High-beta L1. The altcoin named most often for the next bull.",
    },
    volumeWhy: {
      es: "Volumen diario de varios miles de millones. Retail y memes viven aquí.",
      en: "Billions in daily volume. Retail and memes live here.",
    },
    study: {
      es: "No copia 1.064/364. C1: 318 días SUBE (dic 2020 → 6 nov 2021 a $260) y 418 días BAJA (−97% a $8, 29 dic 2022). C3 subió solo 752 días hasta el 19 ene 2025 a $294 — 260 días ANTES que BTC. El suelo modelo (418d) cae el 13 mar 2026.",
      en: "Does not copy 1,064/364. C1: 318 days UP (Dec 2020 → Nov 6, 2021 at $260) and 418 days DOWN (−97% to $8 on Dec 29, 2022). C3 rose only 752 days into Jan 19, 2025 at $294 — 260 days BEFORE BTC. Model low (418d) lands Mar 13, 2026.",
    },
    peakedVsBtc: {
      es: "Techo 260 días antes que BTC (19 ene vs 6 oct 2025).",
      en: "Peaked 260 days before BTC (Jan 19 vs Oct 6, 2025).",
    },
    frozen: [
      { id: "genesis", cycleKey: "G", kind: "genesis", start: "2020-04-10", end: "2020-12-23", listedDays: 257, modelDays: null },
      { id: "c1_up", cycleKey: "1", kind: "up", start: "2020-12-23", end: "2021-11-06", listedDays: 318, modelDays: 752, priceEnd: 260 },
      { id: "c1_down", cycleKey: "1", kind: "down", start: "2021-11-06", end: "2022-12-29", listedDays: 418, modelDays: 418, priceStart: 260, priceEnd: 8.14, drawdownPct: -97 },
      { id: "c3_up", cycleKey: "3", kind: "up", start: "2022-12-29", end: "2025-01-19", listedDays: 752, modelDays: 752, priceEnd: 294.33 },
    ],
    defaultModel: model("2025-01-19T00:00", 294.33, 752, 418, [50, 80, 90, 94, 97]),
    halvings: [],
    scoreDowns: [
      { id: "c1_down", phase: { es: "C1 BAJA", en: "C1 DOWN" }, modelDays: 418, realDays: 418, missDays: 0, movePct: -97 },
    ],
    analogC1: { label: { es: "2021–22", en: "2021–22" }, days: 418, dd: -97 },
    analogC2: { label: { es: "2021–22", en: "2021–22" }, days: 418, dd: -97 },
    ghostC1: [[0, 260], [0.12, 90], [0.4, 32], [0.7, 12], [1, 8.14]],
    ghostC2: [[0, 260], [0.12, 90], [0.4, 32], [0.7, 12], [1, 8.14]],
    analogDdC1: [[0, 0], [0.12, -65], [0.4, -88], [0.7, -95], [1, -97]],
    analogDdC2: [[0, 0], [0.12, -65], [0.4, -88], [0.7, -95], [1, -97]],
  },

  XRP: {
    id: "XRP",
    symbol: "XRP",
    name: "XRP",
    digits: 4,
    pairs: {
      kraken: "XRPUSD",
      krakenWs: "XRP/USD",
      binanceUs: "XRPUSDT",
      binance: "XRPUSDT",
      coinbase: "XRP-USD",
      kucoin: "XRP-USDT",
      bitstamp: "xrpusd",
      paprika: "xrp-xrp",
    },
    thesis: {
      es: "Pagos e institucional. De lo más comprado en 2026; volumen alto de verdad.",
      en: "Payments and institutions. Among the most bought names in 2026; real volume.",
    },
    volumeWhy: {
      es: "Top 5 en volumen diario. El mercado lo trata como un major, no como un meme.",
      en: "Top-5 daily volume. The market treats it as a major, not a meme.",
    },
    study: {
      es: "C1 BAJA 345 días (−93% desde $3,84 el 4 ene 2018). C2 subió 851 días y bajó 430 (−85%) — el techo se adelantó por el juicio SEC. C3 subió 1.126 días hasta el 18 jul 2025 a $3,65. Modelo: SUBE 989 / BAJA 388. Suelo modelo: 10 ago 2026. Estamos en la ventana.",
      en: "C1 DOWN 345 days (−93% from $3.84 on Jan 4, 2018). C2 rose 851 days and fell 430 (−85%) — the high came early on the SEC case. C3 rose 1,126 days into Jul 18, 2025 at $3.65. Model: UP 989 / DOWN 388. Model low: Aug 10, 2026. We are in the window.",
    },
    peakedVsBtc: {
      es: "Techo 80 días antes que BTC (18 jul vs 6 oct 2025).",
      en: "Peaked 80 days before BTC (Jul 18 vs Oct 6, 2025).",
    },
    allTimeHigh: { local: "2018-01-04T00:00", price: 3.84 },
    frozen: [
      { id: "genesis", cycleKey: "G", kind: "genesis", start: "2013-08-04", end: "2017-03-22", listedDays: 1327, modelDays: null },
      { id: "c1_up", cycleKey: "1", kind: "up", start: "2017-03-22", end: "2018-01-04", listedDays: 288, modelDays: 989, priceEnd: 3.84 },
      { id: "c1_down", cycleKey: "1", kind: "down", start: "2018-01-04", end: "2018-12-15", listedDays: 345, modelDays: 388, priceStart: 3.84, priceEnd: 0.283, drawdownPct: -93 },
      { id: "c2_up", cycleKey: "2", kind: "up", start: "2018-12-15", end: "2021-04-14", listedDays: 851, modelDays: 989, priceEnd: 1.965 },
      { id: "c2_down", cycleKey: "2", kind: "down", start: "2021-04-14", end: "2022-06-18", listedDays: 430, modelDays: 388, priceStart: 1.965, priceEnd: 0.291, drawdownPct: -85 },
      { id: "c3_up", cycleKey: "3", kind: "up", start: "2022-06-18", end: "2025-07-18", listedDays: 1126, modelDays: 989, priceEnd: 3.65 },
    ],
    defaultModel: model("2025-07-18T00:00", 3.65, 989, 388, [50, 73, 85, 90, 93]),
    halvings: [],
    scoreDowns: [
      { id: "c1_down", phase: { es: "C1 BAJA", en: "C1 DOWN" }, modelDays: 388, realDays: 345, missDays: -43, movePct: -93 },
      { id: "c2_down", phase: { es: "C2 BAJA", en: "C2 DOWN" }, modelDays: 388, realDays: 430, missDays: 42, movePct: -85 },
    ],
    analogC1: { label: { es: "2018", en: "2018" }, days: 345, dd: -93 },
    analogC2: { label: { es: "2021–22", en: "2021–22" }, days: 430, dd: -85 },
    ghostC1: [[0, 3.84], [0.12, 1.6], [0.4, 0.7], [0.7, 0.38], [1, 0.283]],
    ghostC2: [[0, 1.965], [0.2, 1.1], [0.5, 0.55], [0.8, 0.35], [1, 0.291]],
    analogDdC1: [[0, 0], [0.12, -58], [0.4, -82], [0.7, -90], [1, -93]],
    analogDdC2: [[0, 0], [0.2, -44], [0.5, -72], [0.8, -82], [1, -85]],
  },

  BNB: {
    id: "BNB",
    symbol: "BNB",
    name: "BNB",
    digits: 2,
    pairs: {
      kraken: "BNBUSD",
      krakenWs: "BNB/USD",
      binanceUs: "BNBUSDT",
      binance: "BNBUSDT",
      kucoin: "BNB-USDT",
      paprika: "bnb-binance-coin",
    },
    thesis: {
      es: "Token del exchange más grande. Lo compran por fees, BNB Chain y flujo de Binance.",
      en: "Token of the largest exchange. Bought for fees, BNB Chain, and Binance flow.",
    },
    volumeWhy: {
      es: "Top 5 en cap. Menos volátil que SOL; el reloj más parecido a BTC de este ranking.",
      en: "Top-5 cap. Less violent than SOL; the clock in this list closest to BTC.",
    },
    study: {
      es: "C2: 885 días SUBE hasta $691 (10 may 2021) y 404 días BAJA (−73%). C3 subió 1.213 días hasta el 13 oct 2025 a $1.371 — 7 días DESPUÉS que BTC. Modelo: SUBE 1.049 / BAJA 367. Casi el reloj de Bitcoin.",
      en: "C2: 885 days UP to $691 (May 10, 2021) and 404 days DOWN (−73%). C3 rose 1,213 days into Oct 13, 2025 at $1,371 — 7 days AFTER BTC. Model: UP 1,049 / DOWN 367. Closest clock to Bitcoin.",
    },
    peakedVsBtc: {
      es: "Techo 7 días después que BTC (13 oct vs 6 oct 2025).",
      en: "Peaked 7 days after BTC (Oct 13 vs Oct 6, 2025).",
    },
    frozen: [
      { id: "genesis", cycleKey: "G", kind: "genesis", start: "2017-07-25", end: "2017-12-01", listedDays: 129, modelDays: null },
      { id: "c1_up", cycleKey: "1", kind: "up", start: "2017-12-01", end: "2018-01-12", listedDays: 42, modelDays: 1049, priceEnd: 24.91 },
      { id: "c1_down", cycleKey: "1", kind: "down", start: "2018-01-12", end: "2018-12-07", listedDays: 329, modelDays: 367, priceStart: 24.91, priceEnd: 4.19, drawdownPct: -83 },
      { id: "c2_up", cycleKey: "2", kind: "up", start: "2018-12-07", end: "2021-05-10", listedDays: 885, modelDays: 1049, priceEnd: 691 },
      { id: "c2_down", cycleKey: "2", kind: "down", start: "2021-05-10", end: "2022-06-18", listedDays: 404, modelDays: 367, priceStart: 691, priceEnd: 185, drawdownPct: -73 },
      { id: "c3_up", cycleKey: "3", kind: "up", start: "2022-06-18", end: "2025-10-13", listedDays: 1213, modelDays: 1049, priceEnd: 1371 },
    ],
    defaultModel: model("2025-10-13T00:00", 1371, 1049, 367, [50, 60, 73, 75, 83]),
    halvings: [],
    scoreDowns: [
      { id: "c1_down", phase: { es: "C1 BAJA", en: "C1 DOWN" }, modelDays: 367, realDays: 329, missDays: -38, movePct: -83 },
      { id: "c2_down", phase: { es: "C2 BAJA", en: "C2 DOWN" }, modelDays: 367, realDays: 404, missDays: 37, movePct: -73 },
    ],
    analogC1: { label: { es: "2018", en: "2018" }, days: 329, dd: -83 },
    analogC2: { label: { es: "2021–22", en: "2021–22" }, days: 404, dd: -73 },
    ghostC1: [[0, 24.91], [0.2, 12], [0.5, 8], [0.8, 5.2], [1, 4.19]],
    ghostC2: [[0, 691], [0.15, 420], [0.45, 280], [0.75, 210], [1, 185]],
    analogDdC1: [[0, 0], [0.2, -52], [0.5, -68], [0.8, -79], [1, -83]],
    analogDdC2: [[0, 0], [0.15, -39], [0.45, -59], [0.75, -70], [1, -73]],
  },

  DOGE: {
    id: "DOGE",
    symbol: "DOGE",
    name: "Dogecoin",
    digits: 5,
    pairs: {
      kraken: "XDGUSD",
      krakenWs: "DOGE/USD",
      binanceUs: "DOGEUSDT",
      binance: "DOGEUSDT",
      coinbase: "DOGE-USD",
      kucoin: "DOGE-USDT",
      bitstamp: "dogeusd",
      paprika: "doge-dogecoin",
    },
    thesis: {
      es: "El meme que la gente sigue comprando. Alto volumen retail para el próximo bull.",
      en: "The meme people still buy. High retail volume into the next bull.",
    },
    volumeWhy: {
      es: "Volumen enorme para su cap. No hizo ATH este ciclo: el reloj parte del techo de dic 2024, no del de 2021.",
      en: "Huge volume for its cap. No new ATH this cycle: the clock starts from the Dec 2024 high, not 2021.",
    },
    study: {
      es: "ATH real sigue en $0,738 el 8 may 2021. Este ciclo hizo techo el 8 dic 2024 a $0,484 (904 días SUBE desde jun 2022). Bajas: C1 324d, C2 406d. Modelo 898 / 365. Suelo modelo: 8 dic 2025 — ya pasó.",
      en: "True ATH is still $0.738 on May 8, 2021. This cycle topped Dec 8, 2024 at $0.484 (904 days UP from Jun 2022). Downs: C1 324d, C2 406d. Model 898 / 365. Model low: Dec 8, 2025 — already passed.",
    },
    peakedVsBtc: {
      es: "Techo de este ciclo 302 días antes que BTC (8 dic 2024 vs 6 oct 2025).",
      en: "This-cycle high 302 days before BTC (Dec 8, 2024 vs Oct 6, 2025).",
    },
    allTimeHigh: { local: "2021-05-08T00:00", price: 0.7376 },
    frozen: [
      { id: "genesis", cycleKey: "G", kind: "genesis", start: "2013-12-06", end: "2017-03-01", listedDays: 1181, modelDays: null },
      { id: "c1_up", cycleKey: "1", kind: "up", start: "2017-03-01", end: "2018-01-07", listedDays: 312, modelDays: 898, priceEnd: 0.0188 },
      { id: "c1_down", cycleKey: "1", kind: "down", start: "2018-01-07", end: "2018-11-27", listedDays: 324, modelDays: 365, priceStart: 0.0188, priceEnd: 0.002, drawdownPct: -89 },
      { id: "c2_up", cycleKey: "2", kind: "up", start: "2018-11-27", end: "2021-05-08", listedDays: 893, modelDays: 898, priceEnd: 0.7376 },
      { id: "c2_down", cycleKey: "2", kind: "down", start: "2021-05-08", end: "2022-06-18", listedDays: 406, modelDays: 365, priceStart: 0.7376, priceEnd: 0.0497, drawdownPct: -93 },
      { id: "c3_up", cycleKey: "3", kind: "up", start: "2022-06-18", end: "2024-12-08", listedDays: 904, modelDays: 898, priceEnd: 0.4835 },
    ],
    defaultModel: model("2024-12-08T00:00", 0.4835, 898, 365, [50, 80, 90, 93, 96]),
    halvings: [],
    scoreDowns: [
      { id: "c1_down", phase: { es: "C1 BAJA", en: "C1 DOWN" }, modelDays: 365, realDays: 324, missDays: -41, movePct: -89 },
      { id: "c2_down", phase: { es: "C2 BAJA", en: "C2 DOWN" }, modelDays: 365, realDays: 406, missDays: 41, movePct: -93 },
    ],
    analogC1: { label: { es: "2018", en: "2018" }, days: 324, dd: -89 },
    analogC2: { label: { es: "2021–22", en: "2021–22" }, days: 406, dd: -93 },
    ghostC1: [[0, 0.0188], [0.25, 0.008], [0.6, 0.0035], [1, 0.002]],
    ghostC2: [[0, 0.7376], [0.15, 0.32], [0.45, 0.12], [0.75, 0.06], [1, 0.0497]],
    analogDdC1: [[0, 0], [0.25, -57], [0.6, -81], [1, -89]],
    analogDdC2: [[0, 0], [0.15, -57], [0.45, -84], [0.75, -92], [1, -93]],
  },

  ADA: {
    id: "ADA",
    symbol: "ADA",
    name: "Cardano",
    digits: 4,
    pairs: {
      kraken: "ADAUSD",
      krakenWs: "ADA/USD",
      binanceUs: "ADAUSDT",
      binance: "ADAUSDT",
      coinbase: "ADA-USD",
      kucoin: "ADA-USDT",
      bitstamp: "adausd",
      paprika: "ada-cardano",
    },
    thesis: {
      es: "L1 clásica. Sigue en las listas de ‘qué comprar’ aunque no hizo ATH este ciclo.",
      en: "Classic L1. Still on buy lists even though it did not print a new ATH this cycle.",
    },
    volumeWhy: {
      es: "Volumen alto y base de holders enorme. El reloj de este ciclo es más corto que BTC.",
      en: "High volume and a huge holder base. This cycle’s clock is shorter than BTC.",
    },
    study: {
      es: "ATH $3,10 el 2 sep 2021 (C2: 1.000 días SUBE, 484 BAJA, −92%). Este ciclo techo el 3 dic 2024 a $1,32 (704 días). Modelo: 852 / 411. Suelo modelo: 18 ene 2026 — ya pasó. No copia 1.064/364.",
      en: "ATH $3.10 on Sep 2, 2021 (C2: 1,000 days UP, 484 DOWN, −92%). This cycle high Dec 3, 2024 at $1.32 (704 days). Model: 852 / 411. Model low: Jan 18, 2026 — already passed. Does not copy 1,064/364.",
    },
    peakedVsBtc: {
      es: "Techo de este ciclo 307 días antes que BTC (3 dic 2024).",
      en: "This-cycle high 307 days before BTC (Dec 3, 2024).",
    },
    allTimeHigh: { local: "2021-09-02T00:00", price: 3.099 },
    frozen: [
      { id: "genesis", cycleKey: "G", kind: "genesis", start: "2017-10-01", end: "2017-12-01", listedDays: 61, modelDays: null },
      { id: "c1_up", cycleKey: "1", kind: "up", start: "2017-12-01", end: "2018-01-04", listedDays: 34, modelDays: 852, priceEnd: 1.327 },
      { id: "c1_down", cycleKey: "1", kind: "down", start: "2018-01-04", end: "2018-12-07", listedDays: 337, modelDays: 411, priceStart: 1.327, priceEnd: 0.0274, drawdownPct: -98 },
      { id: "c2_up", cycleKey: "2", kind: "up", start: "2018-12-07", end: "2021-09-02", listedDays: 1000, modelDays: 852, priceEnd: 3.099 },
      { id: "c2_down", cycleKey: "2", kind: "down", start: "2021-09-02", end: "2022-12-30", listedDays: 484, modelDays: 411, priceStart: 3.099, priceEnd: 0.24, drawdownPct: -92 },
      { id: "c3_up", cycleKey: "3", kind: "up", start: "2022-12-30", end: "2024-12-03", listedDays: 704, modelDays: 852, priceEnd: 1.319 },
    ],
    defaultModel: model("2024-12-03T00:00", 1.319, 852, 411, [50, 85, 92, 95, 98]),
    halvings: [],
    scoreDowns: [
      { id: "c1_down", phase: { es: "C1 BAJA", en: "C1 DOWN" }, modelDays: 411, realDays: 337, missDays: -74, movePct: -98 },
      { id: "c2_down", phase: { es: "C2 BAJA", en: "C2 DOWN" }, modelDays: 411, realDays: 484, missDays: 73, movePct: -92 },
    ],
    analogC1: { label: { es: "2018", en: "2018" }, days: 337, dd: -98 },
    analogC2: { label: { es: "2021–22", en: "2021–22" }, days: 484, dd: -92 },
    ghostC1: [[0, 1.327], [0.2, 0.4], [0.5, 0.12], [0.8, 0.045], [1, 0.0274]],
    ghostC2: [[0, 3.099], [0.15, 1.4], [0.45, 0.55], [0.8, 0.3], [1, 0.24]],
    analogDdC1: [[0, 0], [0.2, -70], [0.5, -91], [0.8, -97], [1, -98]],
    analogDdC2: [[0, 0], [0.15, -55], [0.45, -82], [0.8, -90], [1, -92]],
  },

  LINK: {
    id: "LINK",
    symbol: "LINK",
    name: "Chainlink",
    digits: 2,
    pairs: {
      kraken: "LINKUSD",
      krakenWs: "LINK/USD",
      binanceUs: "LINKUSDT",
      binance: "LINKUSDT",
      coinbase: "LINK-USD",
      kucoin: "LINK-USDT",
      bitstamp: "linkusd",
      paprika: "link-chainlink",
    },
    thesis: {
      es: "Oráculos y tokenización. Sale en casi todas las listas del próximo bull institucional.",
      en: "Oracles and tokenization. Shows up on almost every next-bull institutional list.",
    },
    volumeWhy: {
      es: "Volumen constante de un major. Infraestructura, no meme.",
      en: "Steady major-volume. Infrastructure, not a meme.",
    },
    study: {
      es: "ATH $52,88 el 10 may 2021 (C2: 885 SUBE / 399 BAJA, −90%). Este ciclo techo el 13 dic 2024 a $30,81 (914 días). Modelo: 900 / 399. Suelo modelo: 16 ene 2026 — ya pasó.",
      en: "ATH $52.88 on May 10, 2021 (C2: 885 UP / 399 DOWN, −90%). This cycle high Dec 13, 2024 at $30.81 (914 days). Model: 900 / 399. Model low: Jan 16, 2026 — already passed.",
    },
    peakedVsBtc: {
      es: "Techo de este ciclo 297 días antes que BTC (13 dic 2024).",
      en: "This-cycle high 297 days before BTC (Dec 13, 2024).",
    },
    allTimeHigh: { local: "2021-05-10T00:00", price: 52.88 },
    frozen: [
      { id: "genesis", cycleKey: "G", kind: "genesis", start: "2017-09-20", end: "2017-12-01", listedDays: 72, modelDays: null },
      { id: "c1_up", cycleKey: "1", kind: "up", start: "2017-12-01", end: "2018-01-08", listedDays: 38, modelDays: 900, priceEnd: 1.435 },
      { id: "c1_down", cycleKey: "1", kind: "down", start: "2018-01-08", end: "2018-12-07", listedDays: 333, modelDays: 399, priceStart: 1.435, priceEnd: 0.197, drawdownPct: -86 },
      { id: "c2_up", cycleKey: "2", kind: "up", start: "2018-12-07", end: "2021-05-10", listedDays: 885, modelDays: 900, priceEnd: 52.88 },
      { id: "c2_down", cycleKey: "2", kind: "down", start: "2021-05-10", end: "2022-06-13", listedDays: 399, modelDays: 399, priceStart: 52.88, priceEnd: 5.36, drawdownPct: -90 },
      { id: "c3_up", cycleKey: "3", kind: "up", start: "2022-06-13", end: "2024-12-13", listedDays: 914, modelDays: 900, priceEnd: 30.81 },
    ],
    defaultModel: model("2024-12-13T00:00", 30.81, 900, 399, [50, 77, 90, 92, 95]),
    halvings: [],
    scoreDowns: [
      { id: "c1_down", phase: { es: "C1 BAJA", en: "C1 DOWN" }, modelDays: 399, realDays: 333, missDays: -66, movePct: -86 },
      { id: "c2_down", phase: { es: "C2 BAJA", en: "C2 DOWN" }, modelDays: 399, realDays: 399, missDays: 0, movePct: -90 },
    ],
    analogC1: { label: { es: "2018", en: "2018" }, days: 333, dd: -86 },
    analogC2: { label: { es: "2021–22", en: "2021–22" }, days: 399, dd: -90 },
    ghostC1: [[0, 1.435], [0.25, 0.6], [0.6, 0.28], [1, 0.197]],
    ghostC2: [[0, 52.88], [0.15, 28], [0.45, 12], [0.8, 6.5], [1, 5.36]],
    analogDdC1: [[0, 0], [0.25, -58], [0.6, -80], [1, -86]],
    analogDdC2: [[0, 0], [0.15, -47], [0.45, -77], [0.8, -88], [1, -90]],
  },

  AVAX: {
    id: "AVAX",
    symbol: "AVAX",
    name: "Avalanche",
    digits: 2,
    pairs: {
      kraken: "AVAXUSD",
      krakenWs: "AVAX/USD",
      binanceUs: "AVAXUSDT",
      binance: "AVAXUSDT",
      coinbase: "AVAX-USD",
      kucoin: "AVAX-USDT",
      paprika: "avax-avalanche",
    },
    thesis: {
      es: "L1 de alta beta. Lo compran quienes quieren más upside que ETH en el próximo bull.",
      en: "High-beta L1. Bought by people who want more upside than ETH in the next bull.",
    },
    volumeWhy: {
      es: "Volumen serio de L1. ATH sigue en 2021; este ciclo fue más corto y más violento.",
      en: "Serious L1 volume. ATH is still 2021; this cycle was shorter and more violent.",
    },
    study: {
      es: "ATH $146 el 21 nov 2021. C1 BAJA 404 días (−93%). Este ciclo techo el 4 dic 2024 a $55,70 (705 días SUBE). Modelo: 705 / 404. Suelo modelo: 12 ene 2026 — ya pasó. SUBE ~700 días, no 1.064.",
      en: "ATH $146 on Nov 21, 2021. C1 DOWN 404 days (−93%). This cycle high Dec 4, 2024 at $55.70 (705 days UP). Model: 705 / 404. Model low: Jan 12, 2026 — already passed. UP ~700 days, not 1,064.",
    },
    peakedVsBtc: {
      es: "Techo de este ciclo 306 días antes que BTC (4 dic 2024).",
      en: "This-cycle high 306 days before BTC (Dec 4, 2024).",
    },
    allTimeHigh: { local: "2021-11-21T00:00", price: 146.22 },
    frozen: [
      { id: "genesis", cycleKey: "G", kind: "genesis", start: "2020-09-22", end: "2020-12-31", listedDays: 100, modelDays: null },
      { id: "c1_up", cycleKey: "1", kind: "up", start: "2020-12-31", end: "2021-11-21", listedDays: 325, modelDays: 705, priceEnd: 146.22 },
      { id: "c1_down", cycleKey: "1", kind: "down", start: "2021-11-21", end: "2022-12-30", listedDays: 404, modelDays: 404, priceStart: 146.22, priceEnd: 10.65, drawdownPct: -93 },
      { id: "c3_up", cycleKey: "3", kind: "up", start: "2022-12-30", end: "2024-12-04", listedDays: 705, modelDays: 705, priceEnd: 55.7 },
    ],
    defaultModel: model("2024-12-04T00:00", 55.7, 705, 404, [50, 85, 93, 95, 97]),
    halvings: [],
    scoreDowns: [
      { id: "c1_down", phase: { es: "C1 BAJA", en: "C1 DOWN" }, modelDays: 404, realDays: 404, missDays: 0, movePct: -93 },
    ],
    analogC1: { label: { es: "2021–22", en: "2021–22" }, days: 404, dd: -93 },
    analogC2: { label: { es: "2021–22", en: "2021–22" }, days: 404, dd: -93 },
    ghostC1: [[0, 146.22], [0.15, 70], [0.4, 28], [0.75, 14], [1, 10.65]],
    ghostC2: [[0, 146.22], [0.15, 70], [0.4, 28], [0.75, 14], [1, 10.65]],
    analogDdC1: [[0, 0], [0.15, -52], [0.4, -81], [0.75, -90], [1, -93]],
    analogDdC2: [[0, 0], [0.15, -52], [0.4, -81], [0.75, -90], [1, -93]],
  },

  SUI: {
    id: "SUI",
    symbol: "SUI",
    name: "Sui",
    digits: 4,
    pairs: {
      kraken: "SUIUSD",
      krakenWs: "SUI/USD",
      binanceUs: "SUIUSDT",
      binance: "SUIUSDT",
      coinbase: "SUI-USD",
      kucoin: "SUI-USDT",
      paprika: "sui-sui",
    },
    thesis: {
      es: "L1 joven de alto rendimiento. Aparece en las listas 2026 junto a SOL.",
      en: "Young high-performance L1. Shows up on 2026 lists next to SOL.",
    },
    volumeWhy: {
      es: "Volumen de L1 nueva. Un solo ciclo medible: no le pongas 1.064 días.",
      en: "New-L1 volume. One measurable cycle: do not force 1,064 days on it.",
    },
    study: {
      es: "Listada may 2023. Un ciclo: 437 días SUBE desde $0,10 (25 oct 2023) hasta $5,35 el 4 ene 2025. Sin BAJA cerrada; el análogo de SOL es 418 días. Suelo modelo: 26 feb 2026 — ya pasó. Movimiento corto, no el de Bitcoin.",
      en: "Listed May 2023. One cycle: 437 days UP from $0.10 (Oct 25, 2023) to $5.35 on Jan 4, 2025. No closed DOWN; SOL’s analog is 418 days. Model low: Feb 26, 2026 — already passed. Short clock, not Bitcoin’s.",
    },
    peakedVsBtc: {
      es: "Techo 275 días antes que BTC (4 ene vs 6 oct 2025).",
      en: "Peaked 275 days before BTC (Jan 4 vs Oct 6, 2025).",
    },
    frozen: [
      { id: "genesis", cycleKey: "G", kind: "genesis", start: "2023-05-03", end: "2023-10-25", listedDays: 175, modelDays: null },
      { id: "c1_up", cycleKey: "1", kind: "up", start: "2023-10-25", end: "2024-03-27", listedDays: 154, modelDays: 437, priceEnd: 2.208 },
      { id: "c1_down", cycleKey: "1", kind: "down", start: "2024-03-27", end: "2024-08-05", listedDays: 131, modelDays: 418, priceStart: 2.208, priceEnd: 0.47, drawdownPct: -79 },
      { id: "c3_up", cycleKey: "3", kind: "up", start: "2024-08-05", end: "2025-01-04", listedDays: 152, modelDays: 437, priceEnd: 5.353 },
    ],
    defaultModel: model("2025-01-04T00:00", 5.353, 437, 418, [50, 79, 86, 90, 95]),
    halvings: [],
    scoreDowns: [
      { id: "c1_down", phase: { es: "C1 BAJA", en: "C1 DOWN" }, modelDays: 418, realDays: 131, missDays: -287, movePct: -79 },
    ],
    analogC1: { label: { es: "2024", en: "2024" }, days: 131, dd: -79 },
    analogC2: { label: { es: "SOL 2022", en: "SOL 2022" }, days: 418, dd: -97 },
    ghostC1: [[0, 2.208], [0.3, 1.1], [0.7, 0.62], [1, 0.47]],
    ghostC2: [[0, 5.353], [0.12, 1.85], [0.4, 0.64], [0.7, 0.27], [1, 0.16]],
    analogDdC1: [[0, 0], [0.3, -50], [0.7, -72], [1, -79]],
    analogDdC2: [[0, 0], [0.12, -65], [0.4, -88], [0.7, -95], [1, -97]],
  },

  JUP: {
    id: "JUP",
    symbol: "JUP",
    name: "Jupiter",
    digits: 4,
    pairs: {
      kraken: "JUPUSD",
      krakenWs: "JUP/USD",
      binanceUs: "JUPUSDT",
      binance: "JUPUSDT",
      kucoin: "JUP-USDT",
      paprika: "jup-jupiter-exchange-token",
    },
    thesis: {
      es: "El exchange de Solana. Lo compran quienes apuestan al flujo de SOL en el próximo bull.",
      en: "Solana’s exchange. Bought by people betting on SOL flow in the next bull.",
    },
    volumeWhy: {
      es: "Volumen alto en la temporada de Solana. DEX, perps y airdrops: no es un meme suelto.",
      en: "High volume in Solana season. DEX, perps, and airdrops: not a loose meme.",
    },
    study: {
      es: "Listada 31 ene 2024. ATH real $2,00 ese día (wick de listing); no volvió a hacerlo. C1: 49 días SUBE hasta $1,85 (1 abr 2024) y 158 días BAJA (−64% a $0,66). Este ciclo techo el 5 dic 2024 a $1,44 (297 días SUBE desde el suelo de feb). BAJA medida 434 días hasta $0,135 el 12 feb 2026 (−91%). Modelo: 297 / 434. Suelo modelo: 12 feb 2026 — ya pasó. Reloj corto, no 1.064/364.",
      en: "Listed Jan 31, 2024. True ATH $2.00 that day (listing wick); never printed it again. C1: 49 days UP to $1.85 (Apr 1, 2024) and 158 days DOWN (−64% to $0.66). This cycle high Dec 5, 2024 at $1.44 (297 days UP from the Feb low). Measured DOWN 434 days to $0.135 on Feb 12, 2026 (−91%). Model: 297 / 434. Model low: Feb 12, 2026 — already passed. Short clock, not 1,064/364.",
    },
    peakedVsBtc: {
      es: "Techo de este ciclo 305 días antes que BTC (5 dic 2024 vs 6 oct 2025).",
      en: "This-cycle high 305 days before BTC (Dec 5, 2024 vs Oct 6, 2025).",
    },
    allTimeHigh: { local: "2024-01-31T00:00", price: 2.0 },
    frozen: [
      { id: "genesis", cycleKey: "G", kind: "genesis", start: "2024-01-31", end: "2024-02-12", listedDays: 12, modelDays: null },
      { id: "c1_up", cycleKey: "1", kind: "up", start: "2024-02-12", end: "2024-04-01", listedDays: 49, modelDays: 297, priceEnd: 1.85 },
      { id: "c1_down", cycleKey: "1", kind: "down", start: "2024-04-01", end: "2024-09-06", listedDays: 158, modelDays: 434, priceStart: 1.85, priceEnd: 0.66, drawdownPct: -64 },
      { id: "c3_up", cycleKey: "3", kind: "up", start: "2024-09-06", end: "2024-12-05", listedDays: 90, modelDays: 297, priceEnd: 1.439 },
    ],
    defaultModel: model("2024-12-05T00:00", 1.439, 297, 434, [50, 70, 77, 85, 91]),
    halvings: [],
    scoreDowns: [
      { id: "c1_down", phase: { es: "C1 BAJA", en: "C1 DOWN" }, modelDays: 434, realDays: 158, missDays: -276, movePct: -64 },
    ],
    analogC1: { label: { es: "2024", en: "2024" }, days: 158, dd: -64 },
    analogC2: { label: { es: "2025–26", en: "2025–26" }, days: 434, dd: -91 },
    ghostC1: [[0, 1.85], [0.2, 1.2], [0.5, 0.85], [0.8, 0.7], [1, 0.66]],
    ghostC2: [[0, 1.439], [0.12, 1.34], [0.28, 0.3], [0.53, 0.68], [0.71, 0.33], [0.81, 0.22], [1, 0.135]],
    analogDdC1: [[0, 0], [0.2, -35], [0.5, -54], [0.8, -62], [1, -64]],
    analogDdC2: [[0, 0], [0.12, -7], [0.28, -79], [0.53, -53], [0.71, -77], [0.81, -85], [1, -91]],
  },
};

export const COIN_LIST: CoinId[] = [
  "BTC",
  "ETH",
  "SOL",
  "JUP",
  "XRP",
  "BNB",
  "DOGE",
  "ADA",
  "LINK",
  "AVAX",
  "SUI",
];

export function getCoin(id: string | null | undefined): CoinSpec {
  if (id && id in COINS) return COINS[id as CoinId];
  return COINS.BTC;
}

export function isCoinId(id: unknown): id is CoinId {
  return typeof id === "string" && id in COINS;
}
