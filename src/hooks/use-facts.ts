import { useMemo } from "react";
import { thesisFacts, type ThesisFacts } from "@/components/home/ThesisBlocks";
import { useNow } from "@/hooks/use-now";
import { usePrice } from "@/hooks/use-price";
import { getCoin } from "@/lib/coins/catalog";
import { buildSnapshot, type Snapshot } from "@/lib/cycle/model";
import { copy as getCopy, type Copy } from "@/lib/i18n";
import { modelFromStore, useAppStore } from "@/lib/store";
import type { Lang } from "@/lib/cycle/time";

/**
 * The same derived facts the home page shows, for the thesis pages. Returns
 * null facts until the clock has mounted so SSR and hydration agree.
 */
export function useFacts(): {
  lang: Lang;
  copy: Copy;
  tz: string;
  coinName: string;
  symbol: string;
  snap: Snapshot | null;
  facts: ThesisFacts | null;
} {
  const store = useAppStore();
  const now = useNow(1000);
  const coin = getCoin(store.coinId);
  const { ticker } = usePrice(store.coinId);
  const model = modelFromStore(store);
  const nowMs = now ?? 0;

  const snap = useMemo(
    () =>
      now == null
        ? null
        : buildSnapshot(nowMs, model, ticker?.spot ?? null, {
            frozen: coin.frozen,
            halvings: coin.halvings,
            scoreDowns: coin.scoreDowns,
          }),
    [now, nowMs, model, ticker?.spot, coin],
  );

  return {
    lang: store.lang,
    copy: getCopy(store.lang),
    tz: store.tz,
    coinName: coin.name,
    symbol: coin.symbol,
    snap,
    facts: snap ? thesisFacts(snap, ticker, store.lang, store.tz, coin, nowMs) : null,
  };
}
