import { createServerFn } from "@tanstack/react-start";
import { isCoinId, type CoinId } from "@/lib/coins/catalog";
import { loadKlines, loadTicker, type Candle, type Ticker } from "./fetchers";

export type { Candle, Ticker };

function parseCoin(data: unknown): CoinId {
  if (typeof data === "object" && data !== null) {
    const id = (data as Record<string, unknown>).coinId;
    if (isCoinId(id)) return id;
  }
  return "BTC";
}

export const fetchTicker = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({ coinId: parseCoin(data) }))
  .handler(async ({ data }): Promise<Ticker> => loadTicker(data.coinId));

export const fetchKlines = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("bad");
    const d = data as Record<string, unknown>;
    const interval = String(d.interval ?? "1D");
    const startMs = Number(d.startMs);
    const endMs = Number(d.endMs);
    const coinId = isCoinId(d.coinId) ? d.coinId : "BTC";
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      throw new Error("bad range");
    }
    return { interval, startMs, endMs, coinId };
  })
  .handler(async ({ data }): Promise<{ candles: Candle[]; source: string }> => {
    return loadKlines(data.interval, data.startMs, data.endMs, data.coinId);
  });
