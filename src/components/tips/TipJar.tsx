import { Check, Coffee, Copy, ExternalLink, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Copy as I18nCopy } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import {
  PAYPAL_TIPJAR_IMG,
  PAYPAL_TIPJAR_URL,
  TIP_AMOUNTS,
  TIP_COINS,
  clampTipAmount,
  parsePaypalMe,
  paypalMeUrl,
  paymentUri,
  qrSrc,
  resolveAddress,
  shortenAddr,
  tipMarkClass,
  type TipCoin,
  type TipId,
} from "@/lib/tips";
import type { Lang } from "@/lib/cycle/time";
import { cn } from "@/lib/utils";

function useTipState() {
  const paypalMe = useAppStore((s) => s.paypalMe);
  const tipAddresses = useAppStore((s) => s.tipAddresses);
  const setPaypalMe = useAppStore((s) => s.setPaypalMe);
  const setTipAddress = useAppStore((s) => s.setTipAddress);
  return { paypalMe, tipAddresses, setPaypalMe, setTipAddress };
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

function CoinMark({ coin, size = "md" }: { coin: TipCoin; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-medium leading-none",
        size === "md" ? "size-8 text-sm" : "size-6 text-[11px]",
        tipMarkClass(coin.id),
      )}
      aria-hidden
    >
      {coin.mark}
    </span>
  );
}

function amountLabel(copy: I18nCopy, id: (typeof TIP_AMOUNTS)[number]["id"]) {
  if (id === "coffee") return copy.tipCoffee;
  if (id === "dinner") return copy.tipDinner;
  return copy.tipTheClock;
}

export function TipCard({
  copy,
  onOpen,
}: {
  lang: Lang;
  copy: I18nCopy;
  onOpen: (id?: TipId) => void;
}) {
  return (
    <section className="rounded-xl border border-gold/35 bg-navy-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-bmc text-bmc-ink">
          <Coffee className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight text-cream">{copy.tipTitle}</p>
          <p className="mt-1 text-sm leading-snug text-cream-muted">{copy.donateLine}</p>
          <p className="mt-1 text-xs text-cream-faint">{copy.donateSigned}</p>
        </div>
      </div>
      <Button variant="bmc" className="mt-3 min-h-12 w-full" onClick={() => onOpen()}>
        <Coffee className="size-4" />
        {copy.tipTitle}
      </Button>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {TIP_COINS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onOpen(c.id)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-navy-elevated px-3"
            aria-label={c.symbol}
          >
            <span className="font-mono text-xs text-cream">{c.symbol}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function TipSheet({
  lang,
  copy,
  open,
  onClose,
  initial,
}: {
  lang: Lang;
  copy: I18nCopy;
  open: boolean;
  onClose: () => void;
  initial?: TipId;
}) {
  const { paypalMe, tipAddresses } = useTipState();
  const [amount, setAmount] = useState(10);
  const [custom, setCustom] = useState("10");
  const [picked, setPicked] = useState<TipId | null>(initial ?? null);
  const [flash, setFlash] = useState<TipId | "paypal" | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setPicked(initial ?? null);
      setAmount(10);
      setCustom("10");
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    detailRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open, picked]);

  const payUrl = paypalMeUrl(paypalMe, amount) ?? PAYPAL_TIPJAR_URL;
  const coin = useMemo(
    () => (picked ? (TIP_COINS.find((c) => c.id === picked) ?? null) : null),
    [picked],
  );
  const address = coin ? resolveAddress(coin, tipAddresses) : "";
  const pay = coin && address ? paymentUri(coin, address) : "";

  if (!open) return null;

  const applyAmount = (n: number) => {
    const v = clampTipAmount(n);
    setAmount(v);
    setCustom(String(v));
  };

  const onCopy = async (id: TipId | "paypal", text: string) => {
    if (!text) return;
    const ok = await copyText(text);
    if (ok) {
      setFlash(id);
      window.setTimeout(() => setFlash((cur) => (cur === id ? null : cur)), 1600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="tip-sheet-back absolute inset-0 bg-navy-deep/80"
        aria-label={copy.tipClose}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.tipTitle}
        className="tip-sheet relative z-10 flex max-h-[min(88dvh,720px)] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl border border-line bg-navy px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 sm:rounded-2xl"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-cream/25" aria-hidden />

        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-bmc text-bmc-ink">
              <Coffee className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg leading-tight text-cream">{copy.tipTitle}</p>
              <p className="mt-0.5 text-sm leading-snug text-cream-muted">{copy.tipBody}</p>
            </div>
          </div>
          <button
            type="button"
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-cream"
            onClick={onClose}
            aria-label={copy.tipClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {TIP_AMOUNTS.map((p) => {
            const on = amount === p.usd;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyAmount(p.usd)}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center rounded-2xl px-2",
                  on ? "bg-bmc text-bmc-ink" : "bg-navy-card text-cream",
                )}
              >
                <span className="text-sm font-semibold">{amountLabel(copy, p.id)}</span>
                <span className={cn("text-sm font-medium", on ? "text-bmc-ink" : "text-gold")}>
                  ${p.usd}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 rounded-2xl bg-navy-card px-3 py-2.5">
          <p className="text-sm text-cream-muted">{copy.tipOther}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm font-medium text-cream">USD</span>
            <input
              type="number"
              min={1}
              max={10000}
              inputMode="numeric"
              value={custom}
              onChange={(e) => {
                const raw = e.target.value;
                setCustom(raw);
                const n = Number(raw);
                if (Number.isFinite(n) && n >= 1) setAmount(clampTipAmount(n));
              }}
              onBlur={() => applyAmount(Number(custom))}
              className="min-h-10 min-w-0 flex-1 rounded-lg bg-navy-elevated px-3 text-base text-cream outline-none"
              aria-label={copy.tipOther}
            />
          </div>
        </div>

        <a
          href={payUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-bmc px-4 text-sm font-semibold text-bmc-ink"
        >
          {copy.tipPayPal} · ${amount}
          <ExternalLink className="size-4" />
        </a>

        <p className="mt-2 text-center text-xs text-cream-faint">{copy.tipNotFee}</p>

        <div className="mt-3 border-t border-line pt-3">
          <p className="font-display text-lg leading-tight text-cream">{copy.tipOrCrypto}</p>
          <p className="mt-1 text-sm leading-snug text-cream-muted">{copy.tipPaypalCoins}</p>

          <div className="mt-2.5 grid grid-cols-4 gap-2">
            {TIP_COINS.map((c) => {
              const on = c.id === picked;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPicked(c.id)}
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center rounded-2xl px-2 font-mono text-sm",
                    on ? "bg-gold text-navy" : "bg-navy-card text-cream",
                  )}
                >
                  {c.symbol}
                </button>
              );
            })}
          </div>
        </div>

        {coin ? (
          <div ref={detailRef}>
            <TipDetail
              lang={lang}
              copy={copy}
              coin={coin}
              address={address}
              pay={pay}
              paypalMe={paypalMe}
              flash={flash === coin.id}
              onCopy={() => void onCopy(coin.id, address || parsePaypalMe(paypalMe))}
            />
          </div>
        ) : (
          <div ref={detailRef} className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-navy-card px-4 py-5 text-center">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gold">PayPal</p>
            <img
              src={PAYPAL_TIPJAR_IMG}
              alt={copy.tipScanPaypal}
              width={180}
              height={180}
              className="size-[180px] rounded-lg bg-white p-2"
            />
            <p className="text-sm leading-snug text-cream-muted">{copy.tipScanPaypal}</p>
            <Button
              variant="gold"
              onClick={() => void onCopy("paypal", PAYPAL_TIPJAR_URL)}
            >
              {flash === "paypal" ? <Check /> : <Copy />}
              {flash === "paypal" ? copy.tipCopied : copy.tipCopy}
            </Button>
          </div>
        )}

        <p className="mt-3 pb-1 text-center text-xs text-cream-faint">{copy.tipThanks}</p>
      </div>
    </div>
  );
}

export function TipSettings({ lang, copy }: { lang: Lang; copy: I18nCopy }) {
  const { paypalMe, tipAddresses, setPaypalMe, setTipAddress } = useTipState();
  const [picked, setPicked] = useState<TipId>("BTC");
  const [flash, setFlash] = useState<TipId | null>(null);
  const coin = TIP_COINS.find((c) => c.id === picked) ?? TIP_COINS[0];
  const address = resolveAddress(coin, tipAddresses);
  const pay = address ? paymentUri(coin, address) : "";
  const preview = paypalMeUrl(paypalMe, 10) ?? PAYPAL_TIPJAR_URL;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl text-cream">{copy.tipTitle}</h2>
      <p className="text-sm leading-relaxed text-cream-muted">{copy.tipBody}</p>
      <p className="text-xs text-cream-faint">{copy.tipThanks}</p>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-cream-muted">{copy.tipPaypalMe}</span>
        <input
          value={paypalMe}
          onChange={(e) => setPaypalMe(e.target.value)}
          placeholder="tuusuario"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          className="min-h-11 w-full rounded-md border border-line bg-navy-elevated px-3 font-mono text-sm text-cream"
        />
      </label>
      {preview && (
        <a
          href={preview}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-bmc px-4 text-sm font-semibold text-bmc-ink"
        >
          {copy.tipPayPal} · $10
          <ExternalLink className="size-4" />
        </a>
      )}

      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-gold">
        {copy.tipOrCrypto}
      </p>
      <p className="text-xs leading-snug text-cream-faint">{copy.tipPaypalCoins}</p>
      <div className="flex flex-wrap gap-1.5">
        {TIP_COINS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setPicked(c.id)}
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 font-mono text-sm",
              c.id === picked ? "bg-gold text-navy" : "bg-navy-card text-cream-muted",
            )}
          >
            <CoinMark coin={c} size="sm" />
            {c.symbol}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-cream-muted">
          {copy.tipAddr} · {coin.network[lang]}
        </span>
        <input
          value={tipAddresses[picked] ?? ""}
          onChange={(e) => setTipAddress(picked, e.target.value)}
          placeholder={
            picked === "BTC"
              ? "bc1…"
              : picked === "SOL" || picked === "PYUSD"
                ? "So…"
                : picked === "LTC"
                  ? "ltc1…"
                  : picked === "BCH"
                    ? "q… or bitcoincash:"
                    : "0x…"
          }
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          className="min-h-11 w-full rounded-md border border-line bg-navy-elevated px-3 font-mono text-sm text-cream"
        />
      </label>
      <p className="text-xs text-cream-faint">{copy.tipPaste}</p>

      <TipDetail
        lang={lang}
        copy={copy}
        coin={coin}
        address={address}
        pay={pay}
        paypalMe={paypalMe}
        flash={flash === coin.id}
        onCopy={async () => {
          const text = address || parsePaypalMe(paypalMe);
          if (!text) return;
          const ok = await copyText(text);
          if (ok) {
            setFlash(coin.id);
            window.setTimeout(() => setFlash(null), 1600);
          }
        }}
      />
    </section>
  );
}

function TipDetail({
  lang,
  copy,
  coin,
  address,
  pay,
  paypalMe,
  flash,
  onCopy,
}: {
  lang: Lang;
  copy: I18nCopy;
  coin: TipCoin;
  address: string;
  pay: string;
  paypalMe: string;
  flash: boolean;
  onCopy: () => void;
}) {
  const handle = parsePaypalMe(paypalMe);

  if (!address && coin.rail === "paypal" && handle) {
    return (
      <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-navy-card px-4 py-5 text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold">
          {coin.symbol} · {coin.network[lang]}
        </p>
        <p className="text-sm leading-snug text-cream-muted">{copy.tipViaPaypal}</p>
        <p className="font-mono text-sm text-cream">@{handle}</p>
        <Button variant="gold" onClick={onCopy}>
          {flash ? <Check /> : <Copy />}
          {flash ? copy.tipCopied : copy.tipCopy}
        </Button>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-navy-card px-4 py-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-xl bg-bmc text-bmc-ink">
          <Coffee className="size-6" />
        </span>
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold">
          {coin.symbol} · {coin.network[lang]}
        </p>
        <p className="text-sm text-cream-muted">{copy.tipEmpty}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl bg-navy-card px-4 py-3">
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-gold">
        <CoinMark coin={coin} size="sm" />
        {coin.symbol} · {coin.network[lang]}
      </p>
      <p className="break-all font-mono text-sm text-cream">{address}</p>
      <p className="font-mono text-xs text-cream-faint">{shortenAddr(address)}</p>
      {pay && (
        <img
          src={qrSrc(pay)}
          alt={copy.tipQr}
          width={180}
          height={180}
          className="mx-auto size-[180px] rounded-lg bg-navy-deep p-2"
        />
      )}
      <Button variant="gold" onClick={onCopy}>
        {flash ? <Check /> : <Copy />}
        {flash ? copy.tipCopied : copy.tipCopy}
      </Button>
    </div>
  );
}
