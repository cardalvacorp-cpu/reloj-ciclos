import { createServerFn } from "@tanstack/react-start";
import type { PresenceSnap } from "./types";

export type { PresenceSnap };

export const pingPresence = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { id?: unknown };
    const id = String(d?.id ?? "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 32);
    if (id.length < 8) throw new Error("bad id");
    return { id };
  })
  .handler(async ({ data }): Promise<PresenceSnap> => {
    const { ping } = await import("./impl.server");
    return ping(data.id);
  });

export const getPresence = createServerFn({ method: "GET" }).handler(
  async (): Promise<PresenceSnap> => {
    const { snapshot } = await import("./impl.server");
    return snapshot();
  },
);
