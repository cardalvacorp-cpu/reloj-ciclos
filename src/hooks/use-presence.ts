import { useEffect, useState } from "react";
import { getPresence, pingPresence } from "@/lib/presence/server";
import type { PresenceSnap } from "@/lib/presence/types";

function sessionId() {
  try {
    const k = "reloj-seat";
    let id = sessionStorage.getItem(k);
    if (!id) {
      id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(k, id);
    }
    return id;
  } catch {
    return `${Date.now().toString(36)}anon`;
  }
}

export function usePresence() {
  const [snap, setSnap] = useState<PresenceSnap>({ live: 1, visits: 1, avgMin: 1 });

  useEffect(() => {
    const id = sessionId();
    let cancelled = false;
    const beat = async () => {
      try {
        const next = await pingPresence({ data: { id } });
        if (!cancelled) setSnap(next);
      } catch {
        try {
          const next = await getPresence();
          if (!cancelled) setSnap(next);
        } catch {
          /* offline */
        }
      }
    };
    void beat();
    const t = window.setInterval(() => void beat(), 20_000);
    const vis = () => {
      if (document.visibilityState === "visible") void beat();
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      cancelled = true;
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  return snap;
}
