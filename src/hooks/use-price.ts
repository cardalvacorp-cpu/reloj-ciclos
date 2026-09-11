import { useEffect, useState } from "react";
import type { CoinId } from "@/lib/coins/catalog";
import type { Ticker } from "@/lib/price/fetchers";
import {
  isTickerStale,
  readCachedTicker,
  writeCachedTicker,
} from "@/lib/price/client";
import { startLiveBtc } from "@/lib/price/live";

export function usePrice(coinId: CoinId = "BTC") {
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    setTicker(null);
    setFrozen(false);
    setLive(false);
    const cached = readCachedTicker(coinId);
    if (cached) {
      setTicker(cached);
      setFrozen(isTickerStale(cached));
    }

    let lastWrite = 0;
    let cancelled = false;

    const stop = startLiveBtc((t) => {
      if (cancelled) return;
      setTicker(t);
      setFrozen(false);
      setLive(true);
      const now = Date.now();
      if (now - lastWrite > 15_000) {
        writeCachedTicker(t, coinId);
        lastWrite = now;
      }
    }, coinId);

    const staleId = window.setInterval(() => {
      setTicker((cur) => {
        const stale = !cur || Date.now() - cur.ts > 12_000;
        setFrozen((f) => (f === stale ? f : stale));
        setLive((l) => {
          const next = !stale;
          return l === next ? l : next;
        });
        return cur;
      });
    }, 4000);

    return () => {
      cancelled = true;
      stop();
      window.clearInterval(staleId);
    };
  }, [coinId]);

  return { ticker, frozen, live };
}
