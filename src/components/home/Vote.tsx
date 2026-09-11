import { useEffect, useState } from "react";
import type { Copy } from "@/lib/i18n";
import { getVotes, castVote } from "@/lib/vote/server";
import type { VoteChoice, VoteSnap } from "@/lib/vote/types";
import { cn } from "@/lib/utils";

const MY_VOTE = "watch-cycles-vote";
const VOTER_ID = "watch-cycles-voter";

function voterId(): string {
  try {
    let id = localStorage.getItem(VOTER_ID);
    if (!id) {
      id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VOTER_ID, id);
    }
    return id;
  } catch {
    return `${Date.now().toString(36)}anon`;
  }
}

function readMyVote(): VoteChoice | null {
  try {
    const v = localStorage.getItem(MY_VOTE);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

/**
 * localStorage remembers this device's answer; the shared tally is an
 * in-memory count on the server instance, so the note says it resets.
 */
export function Vote({ copy, lang }: { copy: Copy; lang: string }) {
  const [mine, setMine] = useState<VoteChoice | null>(null);
  const [snap, setSnap] = useState<VoteSnap | null>(null);

  useEffect(() => {
    setMine(readMyVote());
    let cancelled = false;
    void (async () => {
      try {
        const s = await getVotes();
        if (!cancelled) setSnap(s);
      } catch {
        /* offline — the local answer still shows */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const vote = async (choice: VoteChoice) => {
    setMine(choice);
    try {
      localStorage.setItem(MY_VOTE, choice);
    } catch {
      /* private mode */
    }
    try {
      setSnap(await castVote({ data: { id: voterId(), choice } }));
    } catch {
      /* offline */
    }
  };

  const total = snap?.total ?? 0;
  const pct = snap?.pct ?? 0;

  return (
    <section className="rounded-xl border border-line bg-navy-card px-4 py-3">
      <h2 className="text-[11px] uppercase tracking-[0.16em] text-gold">{copy.voteTitle}</h2>
      <p className="mt-2 text-sm text-cream">{copy.voteQuestion}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {(["yes", "no"] as const).map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => void vote(choice)}
            aria-pressed={mine === choice}
            className={cn(
              "min-h-11 rounded-md border border-line text-sm text-cream",
              mine === choice && "border-gold bg-gold text-navy",
            )}
          >
            {choice === "yes" ? copy.voteYes : copy.voteNo}
          </button>
        ))}
      </div>

      {total > 0 && (
        <div className="mt-3">
          <div className="progress-track">
            <div className="progress-fill bg-gold" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-cream-muted">{copy.voteTally(pct, total)}</p>
        </div>
      )}

      {mine && <p className="mt-2 text-xs text-cream-muted">{copy.voteThanks}</p>}
      <p className="mt-1 text-xs text-cream-faint">
        {copy.voteLocal}{" "}
        {lang === "es"
          ? "El total público es un contador en vivo del servidor y se reinicia en cada despliegue."
          : "The public total is a live server counter and resets on every deploy."}
      </p>
    </section>
  );
}
