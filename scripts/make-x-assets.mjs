/**
 * Profile picture and header for the X account.
 *
 *   node scripts/make-x-assets.mjs
 *
 * Writes to x-assets/ (not public/ — these are uploaded to X by hand, they are
 * not served by the site). The header carries the live reading, so rerun it
 * whenever you want to refresh the banner.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const NAVY = "#0B1F3A";
const GOLD = "#C9A227";
const CREAM = "#F7F4EA";
const MUTED = "#C9C3B0";
const RED = "#B03A2E";

const ATH_MS = Date.parse("2025-10-06T00:00:00Z");
const ATH_USD = 126198;
const DOWN_DAYS = 364;
const MS_DAY = 86400000;

const now = Date.now();
const day = Math.floor((now - ATH_MS) / MS_DAY);
const left = Math.max(0, DOWN_DAYS - day);
const pct = Math.round((day / DOWN_DAYS) * 100);

let spot = null;
try {
  const r = await fetch("https://api.kraken.com/0/public/Ticker?pair=XBTUSD");
  const j = await r.json();
  spot = Number(Object.values(j.result)[0].c[0]);
} catch {
  /* header still works without a price */
}
const dd = spot ? Math.round(((spot - ATH_USD) / ATH_USD) * 100) : null;
const spotTxt = spot ? `$${Math.round(spot).toLocaleString("en-US")}` : "—";
const ddTxt = dd == null ? "—" : `${dd}%`;

const MARK = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%">
  <rect width="32" height="32" rx="8" fill="${NAVY}"/>
  <circle cx="16" cy="16" r="11" fill="${GOLD}"/>
  <circle cx="16" cy="16" r="8.35" fill="${NAVY}"/>
  <circle cx="16" cy="7.35" r="2.55" fill="${RED}"/>
  <line x1="16" y1="16" x2="16" y2="8.6" stroke="${CREAM}" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="16" y1="16" x2="22.2" y2="20.8" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="16" cy="16" r="1.7" fill="${GOLD}"/>
</svg>`;

const FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Mono:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500&display=swap">`;

/** X crops the avatar to a circle, so keep the mark well inside the square. */
const AVATAR = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;width:400px;height:400px;background:${NAVY}}
 .m{width:340px;height:340px;margin:30px}</style>
<div class="m">${MARK}</div>`;

/**
 * 1500x500. X overlaps the avatar bottom-left and hides the lower strip on
 * mobile, so everything that matters sits right of center and above y=380.
 */
const HEADER = `<!doctype html><meta charset="utf-8">${FONTS}
<style>
  html,body{margin:0;width:1500px;height:500px;background:${NAVY};
    font-family:'IBM Plex Sans',system-ui,sans-serif;color:${CREAM}}
  .wrap{display:flex;height:100%;align-items:center;justify-content:flex-end;padding:0 90px 60px 0;box-sizing:border-box}
  .col{display:flex;flex-direction:column;align-items:flex-end;text-align:right}
  .brand{font-family:'Fraunces',serif;font-weight:700;font-size:40px;color:${GOLD};letter-spacing:.04em}
  .phase{display:inline-block;background:${RED};color:${CREAM};font-size:22px;padding:6px 18px;border-radius:20px;margin-top:10px}
  .day{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:104px;line-height:1;margin-top:14px}
  .row{display:flex;gap:44px;margin-top:18px}
  .k{font-size:17px;color:${MUTED};letter-spacing:.1em}
  .v{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:34px;margin-top:2px}
  .tension{font-family:'Fraunces',serif;font-weight:600;font-size:28px;color:${GOLD};margin-top:20px}
  .foot{font-size:19px;color:${MUTED};margin-top:10px}
</style>
<div class="wrap"><div class="col">
  <div class="brand">WATCH CYCLES</div>
  <div><span class="phase">CYCLE 3 · DOWN</span></div>
  <div class="day">${day} / ${DOWN_DAYS}</div>
  <div class="row">
    <div><div class="k">SPOT</div><div class="v">${spotTxt}</div></div>
    <div><div class="k">VS HIGH</div><div class="v" style="color:${RED}">${ddTxt}</div></div>
    <div><div class="k">TO THE TEST</div><div class="v" style="color:${GOLD}">${left}d</div></div>
  </div>
  <div class="tension">${pct}% of the time. Only ${ddTxt} in price.</div>
  <div class="foot">watchcycles.com · Not financial advice.</div>
</div></div>`;

mkdirSync("x-assets", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

await page.setViewportSize({ width: 400, height: 400 });
await page.setContent(AVATAR, { waitUntil: "networkidle" });
writeFileSync("x-assets/avatar-400.png", await page.screenshot());
console.log("wrote x-assets/avatar-400.png");

await page.setViewportSize({ width: 1500, height: 500 });
await page.setContent(HEADER, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
writeFileSync("x-assets/header-1500x500.png", await page.screenshot());
console.log("wrote x-assets/header-1500x500.png");

await browser.close();
console.log(`\nLectura usada: dia ${day}/${DOWN_DAYS} (${pct}%) · ${spotTxt} · ${ddTxt} · faltan ${left}d`);
