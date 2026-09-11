import { createServerFn } from "@tanstack/react-start";
import { isCoinId, type CoinId } from "@/lib/coins/catalog";
import type { LogRow, LogSnap } from "./types";

export type { LogRow, LogSnap };

export const getCycleLog = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = (data ?? {}) as Record<string, unknown>;
    return { coinId: (isCoinId(d.coinId) ? d.coinId : "BTC") as CoinId };
  })
  .handler(async ({ data }): Promise<LogSnap> => {
    const { buildLog } = await import("./impl.server");
    return buildLog(data.coinId);
  });
