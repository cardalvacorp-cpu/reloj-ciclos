import type { Copy } from "@/lib/i18n";
import type { Lang } from "@/lib/cycle/time";
import { BRAND, SITE_URL } from "@/lib/site/brand";

const NAVY = "#0B1F3A";
const NAVY_CARD = "#12294A";
const GOLD = "#C9A227";
const CREAM = "#F7F4EA";
const CREAM_MUTED = "#C9C3B0";
const CREAM_FAINT = "#8A8578";
const GREEN = "#1B7A4E";
const RED = "#B03A2E";

export type CardSize = "portrait" | "landscape";

/** 1080x1350 for X / Stories, 1600x900 for in-feed and OG. */
export const CARD_DIMS: Record<CardSize, { w: number; h: number }> = {
  portrait: { w: 1080, h: 1350 },
  landscape: { w: 1600, h: 900 },
};

/**
 * Everything on the card is live: phase, day count, spot, drawdown, days left.
 * The dollar analog is deliberately absent — it belongs on /method and /oct-5,
 * not on something built to be screenshotted out of context.
 */
export type ShareCardOpts = {
  lang: Lang;
  copy: Copy;
  size: CardSize;
  bullish: boolean;
  phaseTitle: string;
  day: number;
  total: number;
  pct: number;
  spot: string;
  dd: string;
  testDate: string;
  daysToTest: number;
  subtitle: string;
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function statCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  value: string,
  color: string,
  scale: number,
) {
  ctx.textAlign = "left";
  ctx.fillStyle = CREAM_FAINT;
  ctx.font = `500 ${Math.round(24 * scale)}px IBM Plex Sans, sans-serif`;
  ctx.fillText(label.toUpperCase(), x, y);
  ctx.fillStyle = color;
  ctx.font = `600 ${Math.round(40 * scale)}px IBM Plex Mono, monospace`;
  ctx.fillText(value, x, y + Math.round(50 * scale));
}

export async function drawShareCard(opts: ShareCardOpts): Promise<Blob> {
  const { w, h } = CARD_DIMS[opts.size];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  try {
    await document.fonts.ready;
  } catch {
    /* fall back to whatever is resolved */
  }

  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, w, h);

  const tension = opts.copy.cardTension(`${opts.pct}%`, opts.dd);
  const phaseColor = opts.bullish ? GREEN : RED;
  const dayLine = `${opts.day} / ${opts.total}`;
  const toTest = `${opts.daysToTest}${opts.copy.daysShort} · ${opts.testDate}`;

  if (opts.size === "portrait") {
    // Wordmark
    ctx.textAlign = "center";
    ctx.fillStyle = GOLD;
    ctx.font = "700 44px Fraunces, serif";
    ctx.fillText(BRAND.toUpperCase(), w / 2, 96);
    ctx.fillStyle = CREAM_MUTED;
    ctx.font = "500 26px IBM Plex Sans, sans-serif";
    ctx.fillText(opts.subtitle, w / 2, 138);

    // Phase badge
    ctx.font = "700 46px IBM Plex Sans, sans-serif";
    const bw = ctx.measureText(opts.phaseTitle).width + 80;
    ctx.fillStyle = phaseColor;
    roundRect(ctx, (w - bw) / 2, 206, bw, 92, 46);
    ctx.fill();
    ctx.fillStyle = CREAM;
    ctx.fillText(opts.phaseTitle, w / 2, 268);

    // Day count — the loudest thing on the card
    ctx.fillStyle = CREAM;
    ctx.font = "700 168px IBM Plex Mono, monospace";
    ctx.fillText(dayLine, w / 2, 448);

    // Progress
    const barX = 120;
    const barW = w - barX * 2;
    ctx.fillStyle = "#1E3355";
    roundRect(ctx, barX, 490, barW, 22, 11);
    ctx.fill();
    ctx.fillStyle = phaseColor;
    roundRect(ctx, barX, 490, Math.max(22, (barW * Math.min(100, opts.pct)) / 100), 22, 11);
    ctx.fill();

    // Stat row
    ctx.fillStyle = NAVY_CARD;
    roundRect(ctx, 80, 566, w - 160, 150, 24);
    ctx.fill();
    statCell(ctx, 120, 620, opts.copy.spot, opts.spot, CREAM, 1);
    statCell(ctx, 430, 620, opts.copy.nowVsHigh, opts.dd, RED, 1);
    statCell(ctx, 700, 620, opts.copy.nowToTest, toTest, GOLD, 0.82);

    // Tension line — this is the tweet
    ctx.textAlign = "center";
    ctx.fillStyle = GOLD;
    ctx.font = "700 64px Fraunces, serif";
    ctx.fillText(tension[0], w / 2, 880);
    ctx.fillText(tension[1], w / 2, 962);
    ctx.fillStyle = CREAM;
    ctx.font = "600 56px Fraunces, serif";
    ctx.fillText(tension[2], w / 2, 1056);

    // Footer
    ctx.fillStyle = GOLD;
    ctx.fillRect(w / 2 - 90, 1140, 180, 3);
    ctx.fillStyle = CREAM;
    ctx.font = "600 40px IBM Plex Sans, sans-serif";
    ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), w / 2, 1224);
    ctx.fillStyle = CREAM_FAINT;
    ctx.font = "400 26px IBM Plex Sans, sans-serif";
    ctx.fillText(opts.copy.headerStrip, w / 2, 1282);
  } else {
    // Left column: phase + day count
    ctx.textAlign = "left";
    ctx.fillStyle = GOLD;
    ctx.font = "700 42px Fraunces, serif";
    ctx.fillText(BRAND.toUpperCase(), 90, 110);
    ctx.fillStyle = CREAM_MUTED;
    ctx.font = "500 26px IBM Plex Sans, sans-serif";
    ctx.fillText(opts.subtitle, 90, 152);

    ctx.font = "700 44px IBM Plex Sans, sans-serif";
    const bw = ctx.measureText(opts.phaseTitle).width + 72;
    ctx.fillStyle = phaseColor;
    roundRect(ctx, 90, 226, bw, 86, 43);
    ctx.fill();
    ctx.fillStyle = CREAM;
    ctx.fillText(opts.phaseTitle, 126, 284);

    ctx.fillStyle = CREAM;
    ctx.font = "700 172px IBM Plex Mono, monospace";
    ctx.fillText(dayLine, 90, 470);

    const barW = 620;
    ctx.fillStyle = "#1E3355";
    roundRect(ctx, 90, 512, barW, 22, 11);
    ctx.fill();
    ctx.fillStyle = phaseColor;
    roundRect(ctx, 90, 512, Math.max(22, (barW * Math.min(100, opts.pct)) / 100), 22, 11);
    ctx.fill();

    // Right column: the three numbers
    ctx.fillStyle = NAVY_CARD;
    roundRect(ctx, 800, 210, 710, 330, 28);
    ctx.fill();
    statCell(ctx, 850, 280, opts.copy.spot, opts.spot, CREAM, 1.05);
    statCell(ctx, 850, 400, opts.copy.nowVsHigh, opts.dd, RED, 1.05);
    statCell(ctx, 1180, 280, opts.copy.nowToTest, `${opts.daysToTest}${opts.copy.daysShort}`, GOLD, 1.05);
    statCell(ctx, 1180, 400, opts.copy.testTitle, opts.testDate, GOLD, 0.82);

    // Bottom bar
    ctx.fillStyle = NAVY_CARD;
    ctx.fillRect(0, 660, w, 240);
    ctx.textAlign = "left";
    ctx.fillStyle = GOLD;
    ctx.font = "700 52px Fraunces, serif";
    ctx.fillText(`${tension[0]} ${tension[1]}`, 90, 752);
    ctx.fillStyle = CREAM;
    ctx.font = "600 44px Fraunces, serif";
    ctx.fillText(tension[2], 90, 816);
    ctx.textAlign = "right";
    ctx.fillStyle = CREAM;
    ctx.font = "600 38px IBM Plex Sans, sans-serif";
    ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), w - 90, 760);
    ctx.fillStyle = CREAM_FAINT;
    ctx.font = "400 24px IBM Plex Sans, sans-serif";
    ctx.fillText(opts.copy.headerStrip, w - 90, 806);
  }

  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("blob"))),
      "image/jpeg",
      0.92,
    );
  });
}

/** Puts the PNG on the clipboard. Falls back to a download where unsupported. */
export async function copyImageToClipboard(blob: Blob): Promise<"copied" | "downloaded"> {
  try {
    const png = await toPng(blob);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
    return "copied";
  } catch {
    downloadBlob(blob, "watch-cycles.jpg");
    return "downloaded";
  }
}

function toPng(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      c.getContext("2d")!.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("png"))), "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("img"));
    };
    img.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function shareOrDownload(blob: Blob, filename: string, text?: string) {
  const type = blob.type || "image/jpeg";
  const file = new File([blob], filename, { type });
  const nav = navigator as Navigator & {
    share?: (d: ShareData) => Promise<void>;
    canShare?: (d: ShareData) => boolean;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], title: BRAND, text: text ?? SITE_URL });
    return "shared";
  }
  downloadBlob(blob, filename);
  return "downloaded";
}
