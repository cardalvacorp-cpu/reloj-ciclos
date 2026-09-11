import { useState } from "react";
import { copy as getCopy } from "@/lib/i18n";
import type { Lang } from "@/lib/cycle/time";
import { cn } from "@/lib/utils";

function writeDone(lang: Lang) {
  try {
    const key = "reloj-btc-base";
    const raw = localStorage.getItem(key);
    const data = raw ? (JSON.parse(raw) as { state?: Record<string, unknown>; version?: number }) : { state: {}, version: 0 };
    data.state = { ...(data.state ?? {}), onboardingDone: true, lang };
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function Onboarding({
  initialLang,
  onDone,
}: {
  initialLang: Lang;
  onDone: (lang: Lang) => void;
}) {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Lang>(initialLang);
  const c = getCopy(lang);
  const slides = [c.onb1, c.onb2, c.onb3, c.onb4];

  const finish = () => {
    writeDone(lang);
    onDone(lang);
  };

  return (
    <div className="app-shell onboard-bg relative flex min-h-dvh flex-col px-5 pb-[max(48px,env(safe-area-inset-bottom))] pt-[max(24px,env(safe-area-inset-top))]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-navy/80" />

      <div className="relative z-20 flex items-center justify-between gap-2">
        <button
          type="button"
          className="min-h-12 rounded-md bg-gold px-4 text-sm font-medium text-navy"
          onClick={finish}
        >
          {c.skip}
        </button>
        <div className="flex gap-1">
          <button
            type="button"
            className={cn(
              "min-h-12 min-w-12 rounded-md text-sm",
              lang === "es" ? "bg-cream text-navy" : "text-cream-muted",
            )}
            onClick={() => setLang("es")}
          >
            ES
          </button>
          <span className="self-center text-cream-faint">|</span>
          <button
            type="button"
            className={cn(
              "min-h-12 min-w-12 rounded-md text-sm",
              lang === "en" ? "bg-cream text-navy" : "text-cream-muted",
            )}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>
      </div>

      <div className="relative z-20 flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Watch Cycles</p>
        <h1 className="mt-3 max-w-sm font-display text-3xl font-medium leading-tight text-cream">
          {slides[step]}
        </h1>
        {step === 3 && (
          <p className="mt-4 max-w-sm text-sm text-cream-muted">{c.notAdvice}</p>
        )}
      </div>

      <div className="relative z-20 mb-8 flex flex-col gap-3">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-6 rounded-full",
                i === step ? "bg-gold" : "bg-navy-elevated",
              )}
            />
          ))}
        </div>
        {step < 3 ? (
          <button
            type="button"
            className="min-h-14 w-full rounded-md bg-cream text-base font-medium text-navy"
            onClick={() => setStep((s) => s + 1)}
          >
            {lang === "es" ? "Siguiente" : "Next"}
          </button>
        ) : (
          <button
            type="button"
            className="min-h-14 w-full rounded-md bg-gold text-base font-medium text-navy"
            onClick={finish}
          >
            {c.start}
          </button>
        )}
        <button
          type="button"
          className="min-h-12 w-full rounded-md text-sm text-cream"
          onClick={finish}
        >
          {c.skip}
        </button>
      </div>
    </div>
  );
}
