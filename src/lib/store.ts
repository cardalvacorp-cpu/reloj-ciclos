import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  COINS,
  getCoin,
  isCoinId,
  type CoinId,
} from "@/lib/coins/catalog";
import {
  DEFAULT_MODEL,
  type ExtremeMark,
  type ModelSettings,
} from "@/lib/cycle/model";
import type { Lang } from "@/lib/cycle/time";
import type { AlertItem } from "@/lib/alerts/types";
import {
  DEFAULT_PAYPAL_ME,
  DEFAULT_TIP_ADDRESSES,
  mergeTipAddresses,
  parsePaypalMe,
  type TipId,
} from "@/lib/tips";

export type TabId = "clock" | "map" | "chart" | "alerts" | "settings";

type CoinPatch = Partial<
  Pick<
    ModelSettings,
    | "tz"
    | "athLocal"
    | "athUsd"
    | "upDays"
    | "downDays"
    | "lowMild"
    | "lowBaseLo"
    | "lowBaseHi"
    | "lowSevLo"
    | "lowSevHi"
    | "realLow"
    | "realHigh"
    | "noAnalog"
  >
>;

export type AppState = ModelSettings & {
  coinId: CoinId;
  coinModels: Partial<Record<CoinId, CoinPatch>>;
  lang: Lang;
  tab: TabId;
  roomMode: boolean;
  onboardingDone: boolean;
  showRanges: boolean;
  muteRedBox: boolean;
  notifications: boolean;
  whalePrint: number;
  whaleCluster: number;
  volAggressive: number;
  volExtreme: number;
  alertTFs: string[];
  alerts: AlertItem[];
  paypalMe: string;
  tipAddresses: Record<TipId, string>;
  hydrated: boolean;
  setLang: (lang: Lang) => void;
  setTab: (tab: TabId) => void;
  setRoom: (on: boolean) => void;
  setCoin: (id: CoinId) => void;
  finishOnboarding: (lang: Lang) => void;
  patch: (p: Partial<ModelSettings>) => void;
  setShowRanges: (v: boolean) => void;
  setMuteRedBox: (v: boolean) => void;
  setNotifications: (v: boolean) => void;
  setWhalePrint: (v: number) => void;
  setWhaleCluster: (v: number) => void;
  setVolAggressive: (v: number) => void;
  setVolExtreme: (v: number) => void;
  setPaypalMe: (v: string) => void;
  setTipAddress: (id: TipId, address: string) => void;
  applyPreset: (id: "my_base" | "exact_down" | "prior_down" | "c3_real") => void;
  resetBase: () => void;
  markLow: (mark: ExtremeMark) => void;
  markHigh: (mark: ExtremeMark) => void;
  setNoAnalog: (v: boolean) => void;
  pushAlert: (a: AlertItem) => boolean;
  flagAlert: (
    id: string,
    patch: Partial<Pick<AlertItem, "seen" | "matters" | "noise">>,
  ) => void;
  importBase: (data: Record<string, unknown>) => void;
};

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

function snapshotModel(s: ModelSettings): CoinPatch {
  return {
    tz: s.tz,
    athLocal: s.athLocal,
    athUsd: s.athUsd,
    upDays: s.upDays,
    downDays: s.downDays,
    lowMild: s.lowMild,
    lowBaseLo: s.lowBaseLo,
    lowBaseHi: s.lowBaseHi,
    lowSevLo: s.lowSevLo,
    lowSevHi: s.lowSevHi,
    realLow: s.realLow,
    realHigh: s.realHigh,
    noAnalog: s.noAnalog,
  };
}

function recoverPaypalMe(
  bag: Record<string, unknown> | null | undefined,
  fallback: string,
): string {
  if (!bag) return fallback;
  for (const k of ["paypalMe", "bmcSlug", "paypal", "paypalUser", "paypalSlug"]) {
    const v = bag[k];
    if (typeof v === "string") {
      const s = parsePaypalMe(v);
      if (s) return v.trim();
    }
  }
  return fallback;
}

const persistKeys = [
  "coinId",
  "coinModels",
  "lang",
  "tz",
  "athLocal",
  "athUsd",
  "upDays",
  "downDays",
  "lowMild",
  "lowBaseLo",
  "lowBaseHi",
  "lowSevLo",
  "lowSevHi",
  "realLow",
  "realHigh",
  "noAnalog",
  "onboardingDone",
  "showRanges",
  "muteRedBox",
  "notifications",
  "whalePrint",
  "whaleCluster",
  "volAggressive",
  "volExtreme",
  "alertTFs",
  "alerts",
  "paypalMe",
  "tipAddresses",
] as const;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_MODEL,
      coinId: "BTC",
      coinModels: {},
      lang: "en",
      tab: "clock",
      roomMode: false,
      onboardingDone: true,
      showRanges: true,
      muteRedBox: false,
      notifications: false,
      whalePrint: 15,
      whaleCluster: 75,
      volAggressive: 2,
      volExtreme: 3,
      alertTFs: ["1h", "4h", "1d"],
      alerts: [],
      paypalMe: DEFAULT_PAYPAL_ME,
      tipAddresses: { ...DEFAULT_TIP_ADDRESSES },
      hydrated: false,
      setLang: (lang) => set({ lang }),
      setTab: (tab) => set({ tab, roomMode: false }),
      setRoom: (roomMode) => set({ roomMode }),
      setCoin: (id) => {
        const cur = get();
        if (id === cur.coinId) return;
        const saved = {
          ...cur.coinModels,
          [cur.coinId]: snapshotModel(cur),
        };
        const spec = getCoin(id);
        const prev = saved[id] ?? {};
        set({
          coinId: id,
          coinModels: saved,
          ...spec.defaultModel,
          ...prev,
          tz: cur.tz,
          alerts: [],
        });
      },
      finishOnboarding: (lang) => set({ onboardingDone: true, lang, hydrated: true }),
      patch: (p) => set(p),
      setShowRanges: (showRanges) => set({ showRanges }),
      setMuteRedBox: (muteRedBox) => set({ muteRedBox }),
      setNotifications: (notifications) => set({ notifications }),
      setWhalePrint: (whalePrint) => set({ whalePrint }),
      setWhaleCluster: (whaleCluster) => set({ whaleCluster }),
      setVolAggressive: (volAggressive) => set({ volAggressive }),
      setVolExtreme: (volExtreme) => set({ volExtreme }),
      setPaypalMe: (paypalMe) => set({ paypalMe }),
      setTipAddress: (id, address) =>
        set({
          tipAddresses: { ...get().tipAddresses, [id]: address.trim() },
        }),
      applyPreset: (id) => {
        const spec = getCoin(get().coinId);
        if (id === "my_base") {
          set({ ...spec.defaultModel, tz: get().tz });
          return;
        }
        if (id === "exact_down") {
          set({ downDays: spec.defaultModel.downDays });
          return;
        }
        if (id === "prior_down") {
          const prior = spec.scoreDowns[spec.scoreDowns.length - 1];
          if (prior?.realDays) set({ downDays: prior.realDays });
          return;
        }
        const c3 = spec.frozen.find((f) => f.id === "c3_up");
        if (c3) set({ upDays: c3.listedDays });
      },
      resetBase: () => {
        set({
          ...getCoin(get().coinId).defaultModel,
          tz: get().tz,
          realLow: null,
          realHigh: null,
          noAnalog: false,
        });
      },
      markLow: (realLow) => set({ realLow }),
      markHigh: (realHigh) => {
        if (!realHigh) {
          set({ realHigh: null });
          return;
        }
        set({
          realHigh,
          athLocal: realHigh.local,
          athUsd: realHigh.price,
        });
      },
      setNoAnalog: (noAnalog) => set({ noAnalog }),
      pushAlert: (a) => {
        const existing = get().alerts;
        if (existing.find((x) => x.id === a.id)) return false;
        const lastType = existing.find((x) => x.type === a.type);
        const flow =
          a.type === "MOVE" ||
          a.type === "VOLUME" ||
          a.type === "BREAKOUT" ||
          a.type === "WHALE";
        const gapMs = flow
          ? (a.extreme ? 8 : 12) * 60_000
          : (a.extreme ? 3 : 6) * 3600_000;
        if (lastType && a.ts - lastType.ts < gapMs) return false;
        set({ alerts: [a, ...existing].slice(0, 200) });
        return true;
      },
      flagAlert: (id, patch) =>
        set({
          alerts: get().alerts.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        }),
      importBase: (data) => {
        const next: Partial<AppState> = {};
        const assign = <K extends keyof AppState>(k: K, v: AppState[K]) => {
          next[k] = v;
        };
        if (data.lang === "es" || data.lang === "en") assign("lang", data.lang);
        if (typeof data.tz === "string") assign("tz", data.tz);
        if (typeof data.athLocal === "string") assign("athLocal", data.athLocal);
        if (typeof data.athUsd === "number") assign("athUsd", data.athUsd);
        if (typeof data.upDays === "number") assign("upDays", data.upDays);
        if (typeof data.downDays === "number") assign("downDays", data.downDays);
        const recovered = recoverPaypalMe(data, "");
        if (recovered) assign("paypalMe", recovered);
        if (data.tipAddresses && typeof data.tipAddresses === "object") {
          assign(
            "tipAddresses",
            mergeTipAddresses(data.tipAddresses as Record<string, unknown>),
          );
        }
        if (isCoinId(data.coinId)) {
          get().setCoin(data.coinId);
        }
        set(next);
      },
    }),
    {
      name: "reloj-btc-base",
      partialize: (s) => {
        const out: Record<string, unknown> = {};
        for (const k of persistKeys) out[k] = s[k];
        return out;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState> & Record<string, unknown>;
        const coinId = isCoinId(p.coinId) ? p.coinId : "BTC";
        const tipAddresses = mergeTipAddresses(
          (p.tipAddresses ?? {}) as Record<string, unknown>,
        );
        return {
          ...current,
          ...p,
          coinId,
          tipAddresses,
          paypalMe: recoverPaypalMe(p, current.paypalMe),
          onboardingDone: true,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.onboardingDone) state.lang = detectLang();
        if (!isCoinId(state.coinId)) state.coinId = "BTC";
        if (!(state.coinId in COINS)) state.coinId = "BTC";
        state.tipAddresses = mergeTipAddresses(
          state.tipAddresses as unknown as Record<string, unknown>,
        );
        const recovered = recoverPaypalMe(
          state as unknown as Record<string, unknown>,
          DEFAULT_PAYPAL_ME,
        );
        if (!parsePaypalMe(state.paypalMe ?? "")) state.paypalMe = recovered;
        if (typeof state.paypalMe !== "string") state.paypalMe = DEFAULT_PAYPAL_ME;
        state.hydrated = true;
      },
    },
  ),
);

export function modelFromStore(s: AppState): ModelSettings {
  return {
    tz: s.tz,
    athLocal: s.athLocal,
    athUsd: s.athUsd,
    upDays: s.upDays,
    downDays: s.downDays,
    lowMild: s.lowMild,
    lowBaseLo: s.lowBaseLo,
    lowBaseHi: s.lowBaseHi,
    lowSevLo: s.lowSevLo,
    lowSevHi: s.lowSevHi,
    realLow: s.realLow,
    realHigh: s.realHigh,
    noAnalog: s.noAnalog,
  };
}
