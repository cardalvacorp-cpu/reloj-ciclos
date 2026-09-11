import { createServerFn } from "@tanstack/react-start";
import type { VoteChoice, VoteSnap } from "./types";

export type { VoteChoice, VoteSnap };

export const castVote = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { id?: unknown; choice?: unknown };
    const id = String(d?.id ?? "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 32);
    if (id.length < 8) throw new Error("bad id");
    const choice = d?.choice === "no" ? "no" : "yes";
    return { id, choice: choice as VoteChoice };
  })
  .handler(async ({ data }): Promise<VoteSnap> => {
    const { cast } = await import("./impl.server");
    return cast(data.id, data.choice);
  });

export const getVotes = createServerFn({ method: "GET" }).handler(
  async (): Promise<VoteSnap> => {
    const { tally } = await import("./impl.server");
    return tally();
  },
);
