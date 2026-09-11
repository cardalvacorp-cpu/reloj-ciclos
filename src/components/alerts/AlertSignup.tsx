import { useEffect, useState } from "react";
import type { Copy } from "@/lib/i18n";

const KEY = "watch-cycles-alert-email";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

/**
 * Three triggers, one field. There is no email backend yet, so the address is
 * kept on the device and the UI says so instead of implying a subscription.
 *
 * TODO(backend): POST the address to a list provider (or a Vercel function
 * writing to a store) and send on: T−7 days to the cycle-low test, price
 * entering the base zone, and an aggressive move. Until then the browser
 * Notification API above covers the aggressive-move trigger on this device.
 */
export function AlertSignup({ copy }: { copy: Copy }) {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v) {
        setEmail(v);
        setSaved(true);
      }
    } catch {
      /* private mode */
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return;
    try {
      localStorage.setItem(KEY, email.trim());
    } catch {
      /* private mode */
    }
    setSaved(true);
  };

  return (
    <section className="rounded-xl border border-line bg-navy-card px-4 py-3">
      <h2 className="text-[11px] uppercase tracking-[0.16em] text-gold">
        {copy.alertsEmailTitle}
      </h2>
      <p className="mt-2 text-sm text-cream-muted">{copy.alertsEmailBody}</p>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-cream">
        {copy.alertsTriggers.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
        <label className="sr-only" htmlFor="alert-email">
          {copy.alertsEmailTitle}
        </label>
        <input
          id="alert-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSaved(false);
          }}
          placeholder={copy.alertsEmailPlaceholder}
          className="min-h-11 flex-1 rounded-md border border-line bg-navy px-3 text-sm text-cream placeholder:text-cream-faint"
        />
        <button
          type="submit"
          disabled={!isEmail(email)}
          className="min-h-11 rounded-md bg-gold px-4 text-sm font-medium text-navy disabled:opacity-40"
        >
          {copy.alertsEmailCta}
        </button>
      </form>
      {saved && <p className="mt-2 text-xs text-cream-faint">{copy.alertsEmailSaved}</p>}
    </section>
  );
}
