import {
  MS_DAY,
  addDaysUtc,
  calendarDays,
  parseLocalToUtcMs,
  type Lang,
} from "./time";

export type PhaseKind = "genesis" | "up" | "down";
export type PhaseId =
  | "genesis"
  | "a_up"
  | "a_down"
  | "b_up"
  | "b_down"
  | "c1_up"
  | "c1_down"
  | "c2_up"
  | "c2_down"
  | "c3_up"
  | "c3_down"
  | "c4_up"
  | "c4_down"
  | "c5_up"
  | "c5_down"
  | "c6_up"
  | "c6_down";

export type Phase = {
  id: PhaseId;
  cycleKey: "G" | "A" | "B" | "1" | "2" | "3" | "4" | "5" | "6";
  kind: PhaseKind;
  startMs: number;
  endMs: number;
  listedDays: number;
  modelDays: number | null;
  frozen: boolean;
  future: boolean;
  inProgress: boolean;
  priceStart?: number;
  priceEnd?: number;
  drawdownPct?: number;
};

export type ExtremeMark = {
  local: string;
  price: number;
} | null;

export type ModelSettings = {
  tz: string;
  athLocal: string;
  athUsd: number;
  upDays: number;
  downDays: number;
  lowMild: number;
  lowBaseLo: number;
  lowBaseHi: number;
  lowSevLo: number;
  lowSevHi: number;
  realLow: ExtremeMark;
  realHigh: ExtremeMark;
  noAnalog: boolean;
};

export const DEFAULT_MODEL: ModelSettings = {
  tz: "America/Chicago",
  athLocal: "2025-10-06T00:00",
  athUsd: 126198,
  upDays: 1064,
  downDays: 364,
  lowMild: 50,
  lowBaseLo: 70,
  lowBaseHi: 77,
  lowSevLo: 80,
  lowSevHi: 85,
  realLow: null,
  realHigh: null,
  noAnalog: false,
};

export type FrozenDef = {
  id: PhaseId;
  cycleKey: Phase["cycleKey"];
  kind: PhaseKind;
  start: string;
  end: string;
  listedDays: number;
  modelDays: number | null;
  priceStart?: number;
  priceEnd?: number;
  drawdownPct?: number;
};

export const HALVINGS = [
  { id: "H1", local: "2012-11-28", label: "H1" },
  { id: "H2", local: "2016-07-09", label: "H2" },
  { id: "H3", local: "2020-05-11", label: "H3" },
  { id: "H4", local: "2024-04-19", label: "H4" },
] as const;

export type HalvingMark = {
  id: string;
  label: string;
  ms: number;
};

export type HalvingDef = { id: string; local: string; label: string };

export function halvingMarks(tz: string, list: readonly HalvingDef[] = HALVINGS): HalvingMark[] {
  return list.map((h) => ({
    id: h.id,
    label: h.label,
    ms: parseLocalToUtcMs(h.local, tz),
  }));
}

function futurePhase(
  id: PhaseId,
  cycleKey: Phase["cycleKey"],
  kind: PhaseKind,
  startMs: number,
  days: number,
  nowMs: number,
  modelDays: number,
): Phase {
  const endMs = addDaysUtc(startMs, days);
  return {
    id,
    cycleKey,
    kind,
    startMs,
    endMs,
    listedDays: days,
    modelDays,
    frozen: false,
    future: nowMs < startMs,
    inProgress: nowMs >= startMs && nowMs < endMs,
  };
}

export function buildPhases(
  settings: ModelSettings,
  nowMs: number,
  frozenDefs: FrozenDef[],
): Phase[] {
  const tz = settings.tz;
  const frozen: Phase[] = frozenDefs.map((d) => {
    const startMs = parseLocalToUtcMs(d.start, tz);
    const endMs = parseLocalToUtcMs(d.end, tz);
    return {
      id: d.id,
      cycleKey: d.cycleKey,
      kind: d.kind,
      startMs,
      endMs,
      listedDays: d.listedDays,
      modelDays: d.modelDays,
      frozen: true,
      future: false,
      inProgress: nowMs >= startMs && nowMs < endMs,
      priceStart: d.priceStart,
      priceEnd: d.id === "c3_up" ? settings.athUsd : d.priceEnd,
      drawdownPct: d.drawdownPct,
    };
  });

  const athMs = settings.realHigh
    ? parseLocalToUtcMs(settings.realHigh.local, tz)
    : parseLocalToUtcMs(settings.athLocal, tz);

  const modelLowMs = addDaysUtc(athMs, settings.downDays);
  const realLowMs = settings.realLow
    ? parseLocalToUtcMs(settings.realLow.local, tz)
    : null;
  const c3DownEnd = realLowMs ?? modelLowMs;

  const c3Down: Phase = {
    id: "c3_down",
    cycleKey: "3",
    kind: "down",
    startMs: athMs,
    endMs: c3DownEnd,
    listedDays: Math.round((c3DownEnd - athMs) / MS_DAY),
    modelDays: settings.downDays,
    frozen: false,
    future: nowMs < athMs,
    inProgress: nowMs >= athMs && nowMs < c3DownEnd,
    priceStart: settings.realHigh?.price ?? settings.athUsd,
    priceEnd: settings.realLow?.price,
  };

  let cursor = c3DownEnd;
  const c4up = futurePhase(
    "c4_up",
    "4",
    "up",
    cursor,
    settings.upDays,
    nowMs,
    settings.upDays,
  );
  cursor = c4up.endMs;
  const c4down = futurePhase(
    "c4_down",
    "4",
    "down",
    cursor,
    settings.downDays,
    nowMs,
    settings.downDays,
  );
  cursor = c4down.endMs;
  const c5up = futurePhase(
    "c5_up",
    "5",
    "up",
    cursor,
    settings.upDays,
    nowMs,
    settings.upDays,
  );
  cursor = c5up.endMs;
  const c5down = futurePhase(
    "c5_down",
    "5",
    "down",
    cursor,
    settings.downDays,
    nowMs,
    settings.downDays,
  );
  cursor = c5down.endMs;
  const c6up = futurePhase(
    "c6_up",
    "6",
    "up",
    cursor,
    settings.upDays,
    nowMs,
    settings.upDays,
  );
  cursor = c6up.endMs;
  const c6down = futurePhase(
    "c6_down",
    "6",
    "down",
    cursor,
    settings.downDays,
    nowMs,
    settings.downDays,
  );

  return [...frozen, c3Down, c4up, c4down, c5up, c5down, c6up, c6down];
}

export function phaseAt(phases: Phase[], nowMs: number): Phase {
  const hit = phases.find((p) => nowMs >= p.startMs && nowMs < p.endMs);
  if (hit) return hit;
  if (nowMs < phases[0].startMs) return phases[0];
  return phases[phases.length - 1];
}

export type PriceRanges = {
  ath: number;
  mild: number;
  baseLo: number;
  baseHi: number;
  sevLo: number;
  sevHi: number;
  ceiling3: number;
  ceiling5: number;
  ceiling8: number;
  ceiling12: number;
  lowUsed: number;
};

export function computeRanges(
  settings: ModelSettings,
  lowOverride?: number | null,
): PriceRanges {
  const ath = settings.realHigh?.price ?? settings.athUsd;
  const mild = ath * (1 - settings.lowMild / 100);
  const baseHi = ath * (1 - settings.lowBaseLo / 100);
  const baseLo = ath * (1 - settings.lowBaseHi / 100);
  const sevHi = ath * (1 - settings.lowSevLo / 100);
  const sevLo = ath * (1 - settings.lowSevHi / 100);
  const lowUsed = lowOverride ?? settings.realLow?.price ?? (baseLo + baseHi) / 2;
  return {
    ath,
    mild,
    baseLo,
    baseHi,
    sevLo,
    sevHi,
    ceiling3: lowUsed * 3,
    ceiling5: lowUsed * 5,
    ceiling8: lowUsed * 8,
    ceiling12: lowUsed * 12,
    lowUsed,
  };
}

export type ScoreRow = {
  id: string;
  phase: { es: string; en: string };
  modelDays: number;
  realDays: number | null;
  missDays: number | null;
  movePct: number | null;
};

export type CycleBook = {
  frozen: FrozenDef[];
  halvings: readonly HalvingDef[];
  scoreDowns: ScoreRow[];
};

export function scorecard(
  settings: ModelSettings,
  prior: ScoreRow[] = [],
): {
  rows: ScoreRow[];
  avgMiss: number;
} {
  const c3Real = settings.realLow
    ? calendarDays(settings.athLocal.slice(0, 10), settings.realLow.local.slice(0, 10))
    : null;
  const rows: ScoreRow[] = [
    ...prior,
    {
      id: "c3_down",
      phase: { es: "C3 BAJA", en: "C3 DOWN" },
      modelDays: settings.downDays,
      realDays: c3Real,
      missDays: c3Real == null ? null : c3Real - settings.downDays,
      movePct: null,
    },
  ];
  const misses = rows
    .filter((r) => r.missDays != null)
    .map((r) => Math.abs(r.missDays as number));
  const avgMiss =
    misses.length === 0
      ? 0
      : Math.round((misses.reduce((a, b) => a + b, 0) / misses.length) * 10) / 10;
  return { rows, avgMiss };
}

export type Snapshot = {
  phases: Phase[];
  current: Phase;
  athMs: number;
  modelLowMs: number;
  c3DownEnd: number;
  elapsedMs: number;
  remainingMs: number;
  dayNumber: number;
  dayTotal: number;
  timePct: number;
  bullish: boolean;
  modelLowPassed: boolean;
  inTurnZone: boolean;
  officialWindow: { startMs: number; endMs: number };
  inOfficialWindow: boolean;
  missedMap: boolean;
  nextHighMs: number | null;
  nextLowMs: number | null;
  followingHighMs: number | null;
  ranges: PriceRanges;
  drawdownVsAth: number | null;
  score: { rows: ScoreRow[]; avgMiss: number };
  halvings: HalvingMark[];
};

export function buildSnapshot(
  nowMs: number,
  settings: ModelSettings,
  spot: number | null,
  book: CycleBook,
): Snapshot {
  const phases = buildPhases(settings, nowMs, book.frozen);
  const current = phaseAt(phases, nowMs);
  const athMs = phases.find((p) => p.id === "c3_down")!.startMs;
  const c3Down = phases.find((p) => p.id === "c3_down")!;
  const modelLowMs = addDaysUtc(athMs, settings.downDays);
  const c3DownEnd = c3Down.endMs;

  const elapsedMs = Math.max(0, nowMs - current.startMs);
  const remainingMs = current.endMs - nowMs;
  const dayTotal =
    current.id === "c3_down" ? settings.downDays : current.listedDays;
  const dayNumber = Math.min(
    Math.max(0, Math.floor(elapsedMs / MS_DAY)),
    Math.max(dayTotal, 1),
  );
  const span = Math.max(1, current.endMs - current.startMs);
  const timePct = Math.min(1, Math.max(0, elapsedMs / span));
  const bullish = current.kind === "up" || current.kind === "genesis";
  const modelLowPassed = nowMs > modelLowMs && !settings.realLow;
  const inTurnZone = remainingMs > 0 && remainingMs <= 30 * MS_DAY;

  const officialWindow = {
    startMs: addDaysUtc(modelLowMs, -1),
    endMs: addDaysUtc(modelLowMs, 12),
  };
  const inOfficialWindow =
    nowMs >= officialWindow.startMs && nowMs <= officialWindow.endMs;
  const missedMap = nowMs > officialWindow.endMs && !settings.realLow;

  const c4up = phases.find((p) => p.id === "c4_up")!;
  let nextHighMs: number | null = null;
  let nextLowMs: number | null = null;
  let followingHighMs: number | null = null;
  if (current.id === "c3_down") {
    nextLowMs = c3DownEnd;
    nextHighMs = c4up.endMs;
    followingHighMs = c4up.endMs;
  } else if (current.kind === "up") {
    nextHighMs = current.endMs;
    nextLowMs = phases.find((p) => p.startMs === current.endMs)?.endMs ?? null;
    followingHighMs =
      phases.find((p) => p.kind === "up" && p.startMs > current.endMs)?.endMs ??
      null;
  } else {
    nextLowMs = current.endMs;
    const nxt = phases.find((p) => p.startMs === current.endMs);
    nextHighMs = nxt?.endMs ?? null;
    followingHighMs = nextHighMs;
  }

  const athPx = settings.realHigh?.price ?? settings.athUsd;
  const drawdownVsAth =
    spot != null && athPx > 0 ? ((spot - athPx) / athPx) * 100 : null;
  const ranges = computeRanges(settings, settings.realLow?.price ?? null);

  return {
    phases,
    current,
    athMs,
    modelLowMs,
    c3DownEnd,
    elapsedMs,
    remainingMs,
    dayNumber,
    dayTotal,
    timePct,
    bullish,
    modelLowPassed,
    inTurnZone,
    officialWindow,
    inOfficialWindow,
    missedMap,
    nextHighMs,
    nextLowMs,
    followingHighMs,
    ranges,
    drawdownVsAth,
    score: scorecard(settings, book.scoreDowns),
    halvings: halvingMarks(settings.tz, book.halvings),
  };
}

export function cycleTitle(phase: Phase, lang: Lang): string {
  if (phase.id === "genesis") return lang === "es" ? "GÉNESIS" : "GENESIS";
  const cycle = phase.cycleKey;
  const kind =
    phase.kind === "up"
      ? lang === "es"
        ? "SUBE"
        : "UP"
      : lang === "es"
        ? "BAJA"
        : "DOWN";
  if (phase.cycleKey === "A" || phase.cycleKey === "B") {
    return `${cycle} · ${kind}`;
  }
  return lang === "es" ? `CICLO ${cycle} · ${kind}` : `CYCLE ${cycle} · ${kind}`;
}

export function phaseShort(phase: Phase, lang: Lang): string {
  if (phase.id === "genesis") return lang === "es" ? "Génesis" : "Genesis";
  const kind =
    phase.kind === "up"
      ? lang === "es"
        ? "SUBE"
        : "UP"
      : lang === "es"
        ? "BAJA"
        : "DOWN";
  if (phase.cycleKey === "A" || phase.cycleKey === "B") {
    return `${phase.cycleKey} ${kind}`;
  }
  return `C${phase.cycleKey} ${kind}`;
}

export const PRESETS = {
  my_base: {
    athLocal: "2025-10-06T00:00",
    athUsd: 126198,
    upDays: 1064,
    downDays: 364,
  },
  exact_364: { downDays: 364 },
  c2_plus12: { downDays: 376 },
  c3_real: { upDays: 1050 },
} as const;

export function lastFrozenDown(phases: Phase[]): Phase | undefined {
  return [...phases]
    .reverse()
    .find((p) => p.kind === "down" && p.frozen && p.priceEnd != null);
}
