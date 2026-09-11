import { Check, Copy, Download, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ThesisFacts } from "@/components/home/ThesisBlocks";
import type { Copy as I18nCopy } from "@/lib/i18n";
import { sharePostText } from "@/lib/i18n";
import type { Lang } from "@/lib/cycle/time";
import { SITE_URL } from "@/lib/site/brand";
import {
  CARD_DIMS,
  copyImageToClipboard,
  downloadBlob,
  drawShareCard,
  type CardSize,
} from "@/lib/share-card";
import { cn } from "@/lib/utils";

const BTN =
  "flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md border border-line px-3 text-sm text-cream";

export function ShareSheet({
  open,
  onClose,
  lang,
  copy,
  facts,
  bullish,
  subtitle,
  symbol,
  highDate,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  copy: I18nCopy;
  facts: ThesisFacts | null;
  bullish: boolean;
  subtitle: string;
  symbol: string;
  highDate: string;
}) {
  const [size, setSize] = useState<CardSize>("portrait");
  const [preview, setPreview] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState<"image" | "post" | null>(null);

  const render = useCallback(async () => {
    if (!facts) return;
    const b = await drawShareCard({
      lang,
      copy,
      size,
      bullish,
      phaseTitle: facts.phase,
      day: facts.dayNumber,
      total: facts.dayTotal,
      pct: facts.pct,
      spot: facts.spot,
      dd: facts.dd,
      testDate: facts.testDate,
      daysToTest: facts.daysToTest,
      subtitle,
    });
    setBlob(b);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(b);
    });
  }, [facts, lang, copy, size, bullish, subtitle]);

  useEffect(() => {
    if (!open) return;
    void render();
  }, [open, render]);

  useEffect(() => {
    return () => {
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return null;
      });
    };
  }, []);

  if (!open || !facts) return null;

  const post = sharePostText(lang, {
    symbol,
    phase: facts.phase,
    day: facts.dayNumber,
    total: facts.dayTotal,
    pct: facts.pct,
    spot: facts.spot,
    dd: facts.dd,
    highDate,
    testDate: facts.testDate,
    daysToTest: facts.daysToTest,
    base: facts.base,
    url: SITE_URL,
  });

  const flash = (what: "image" | "post") => {
    setCopied(what);
    window.setTimeout(() => setCopied(null), 2000);
  };

  const dims = CARD_DIMS[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-deep/80 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={copy.btnShare}
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-navy px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-lg text-cream">{copy.btnShare}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.tipClose}
            className="flex size-11 items-center justify-center rounded-md text-cream"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-3 flex gap-1.5">
          {(["portrait", "landscape"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-pressed={size === s}
              className={cn(
                "min-h-11 flex-1 rounded-md text-sm",
                size === s ? "bg-cream text-navy" : "bg-navy-card text-cream-muted",
              )}
            >
              {s === "portrait" ? copy.cardPortrait : copy.cardLandscape}
            </button>
          ))}
        </div>

        {preview && (
          <img
            src={preview}
            alt=""
            width={dims.w}
            height={dims.h}
            className="mb-3 w-full rounded-lg border border-line"
          />
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className={cn(BTN, copied === "image" && "border-gold text-gold")}
            onClick={async () => {
              if (!blob) return;
              await copyImageToClipboard(blob);
              flash("image");
            }}
          >
            {copied === "image" ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copy.copyImage}
          </button>
          <button
            type="button"
            className={cn(BTN, copied === "post" && "border-gold text-gold")}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(post);
              } catch {
                /* clipboard blocked */
              }
              flash("post");
            }}
          >
            {copied === "post" ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copy.copyPost}
          </button>
          <button
            type="button"
            className="flex size-12 shrink-0 items-center justify-center rounded-md border border-line text-cream"
            aria-label="Download"
            onClick={() => blob && downloadBlob(blob, `watch-cycles-${size}.jpg`)}
          >
            <Download className="size-4" />
          </button>
        </div>

        <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-navy-card px-3 py-2 text-xs leading-relaxed text-cream-muted">
          {post}
        </pre>
      </div>
    </div>
  );
}
