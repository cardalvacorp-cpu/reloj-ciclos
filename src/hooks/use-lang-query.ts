import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

/**
 * `?lang=es` / `?lang=en` force the UI language on any route. The hreflang
 * alternates in `__root.tsx` point at these, so they have to work everywhere,
 * not just on the home page.
 */
export function useLangQuery() {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "es" || q === "en") useAppStore.getState().setLang(q);
    const html = document.documentElement;
    const unsub = useAppStore.subscribe((s) => {
      html.lang = s.lang === "es" ? "es" : "en";
    });
    html.lang = useAppStore.getState().lang === "es" ? "es" : "en";
    return unsub;
  }, []);
}
