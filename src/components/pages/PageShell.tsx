import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { clockStrip, copy as getCopy } from "@/lib/i18n";
import { ROUTES } from "@/lib/site/brand";
import { BRAND } from "@/lib/site/brand";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const LINK = "min-h-11 px-2 py-2 text-sm";

/**
 * Chrome for the thesis pages: same navy shell as the clock, a real H1, the
 * fixed disclaimer, and the language toggle so ES/EN works off the home too.
 */
export function PageShell({
  title,
  lead,
  children,
}: {
  title: { es: string; en: string };
  lead?: { es: string; en: string };
  children: ReactNode;
}) {
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const upDays = useAppStore((s) => s.upDays);
  const downDays = useAppStore((s) => s.downDays);
  const c = getCopy(lang);

  return (
    <div className="app-shell flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-navy/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <p className="px-3 py-1.5 text-center text-[11px] leading-snug text-cream-muted">
          {clockStrip(lang, upDays, downDays)}
        </p>
        <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-2 px-3 pb-2">
          <Link
            to={ROUTES.home}
            className="flex min-h-11 items-center gap-1.5 text-sm text-cream"
          >
            <ArrowLeft className="size-4" />
            {BRAND}
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLang("es")}
              className={cn(
                "min-h-10 min-w-10 rounded-md text-sm",
                lang === "es" ? "bg-cream text-navy" : "text-cream-muted",
              )}
              aria-pressed={lang === "es"}
            >
              ES
            </button>
            <span className="text-cream-faint">|</span>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={cn(
                "min-h-10 min-w-10 rounded-md text-sm",
                lang === "en" ? "bg-cream text-navy" : "text-cream-muted",
              )}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
        </div>
        <nav
          aria-label={BRAND}
          className="mx-auto flex w-full max-w-lg items-center gap-3 overflow-x-auto whitespace-nowrap border-t border-line px-3"
        >
          {(
            [
              [ROUTES.home, c.navHome],
              [ROUTES.method, c.navMethod],
              [ROUTES.test, c.navTest],
              [ROUTES.faq, c.navFaq],
              [ROUTES.contact, c.navContact],
            ] as const
          ).map(([to, label]) => (
            <Link key={to} to={to} className={cn(LINK, "text-cream-muted")}>
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-3 py-5">
        <h1 className="font-display text-2xl font-semibold leading-tight text-cream">
          {title[lang]}
        </h1>
        {lead && <p className="mt-2 text-sm leading-snug text-cream-muted">{lead[lang]}</p>}
        <div className="mt-5 flex flex-col gap-5">{children}</div>
        <p className="mt-8 text-center text-xs text-cream-faint">{c.footer}</p>
      </main>
    </div>
  );
}

export function Section({
  heading,
  children,
}: {
  heading: { es: string; en: string };
  children: ReactNode;
}) {
  const lang = useAppStore((s) => s.lang);
  return (
    <section className="rounded-xl border border-line bg-navy-card px-4 py-3">
      <h2 className="text-[11px] uppercase tracking-[0.16em] text-gold">{heading[lang]}</h2>
      <div className="mt-2 flex flex-col gap-2 text-sm leading-snug text-cream">{children}</div>
    </section>
  );
}
