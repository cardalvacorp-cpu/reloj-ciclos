import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { COIN_LIST, getCoin, type CoinId } from "@/lib/coins/catalog";
import { fmtCycle, type Lang } from "@/lib/cycle/time";
import { cn } from "@/lib/utils";

const PRIMARY: CoinId = "BTC";

/**
 * Bitcoin is the clock. The alts each have their own measured cycle and stay
 * available, but they sit behind "Also watch" so a first-time visitor is not
 * handed eleven tickers before they know what the site claims.
 */
export function CoinPicker({
  lang,
  active,
  onPick,
}: {
  lang: Lang;
  active: CoinId;
  onPick: (id: CoinId) => void;
}) {
  const coin = getCoin(active);
  const [open, setOpen] = useState(false);

  // Land on an alt (saved from a previous visit) and the drawer starts open.
  useEffect(() => {
    if (active !== PRIMARY) setOpen(true);
  }, [active]);

  const alts = COIN_LIST.filter((id) => id !== PRIMARY);
  const label = lang === "es" ? "Ver también" : "Also watch";

  return (
    <div className="border-b border-line">
      <div className="flex items-center gap-2 px-2 py-2">
        <button
          type="button"
          role="tab"
          aria-selected={active === PRIMARY}
          onClick={() => onPick(PRIMARY)}
          className={cn(
            "min-h-11 shrink-0 rounded-md px-3 text-sm font-medium tracking-wide",
            active === PRIMARY ? "bg-gold text-navy" : "text-cream-muted",
          )}
        >
          {PRIMARY}
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-11 items-center gap-1 rounded-md px-2 text-sm text-cream-muted"
        >
          {label}
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div
          className="flex gap-1 overflow-x-auto px-2 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={label}
        >
          {alts.map((id) => {
            const on = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onPick(id)}
                className={cn(
                  "min-h-11 shrink-0 rounded-md px-3 text-sm font-medium tracking-wide",
                  on ? "bg-gold text-navy" : "text-cream-muted",
                )}
              >
                {id}
              </button>
            );
          })}
        </div>
      )}

      <p className="px-3 pb-2 text-[11px] leading-snug text-cream-faint">
        {coin.symbol} · {fmtCycle(coin.defaultModel.upDays, lang)} /{" "}
        {fmtCycle(coin.defaultModel.downDays, lang)} · {coin.peakedVsBtc[lang]}
      </p>
    </div>
  );
}
