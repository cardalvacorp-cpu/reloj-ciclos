/**
 * Regenerates the brand assets that used to be a personal photo.
 *
 *   node scripts/make-brand-assets.mjs
 *
 * Writes public/icon-180.png, icon-192.png, icon-512.png (the gold clock mark
 * from favicon.svg) and public/og.jpg (the 1200x630 share preview). Rerun it
 * whenever the wordmark or the two cycle numbers change.
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const NAVY = "#0B1F3A";
const GOLD = "#C9A227";
const CREAM = "#F7F4EA";
const MUTED = "#C9C3B0";

const MARK = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%">
  <rect width="32" height="32" rx="8" fill="${NAVY}"/>
  <circle cx="16" cy="16" r="11" fill="${GOLD}"/>
  <circle cx="16" cy="16" r="8.35" fill="${NAVY}"/>
  <circle cx="16" cy="7.35" r="2.55" fill="#B03A2E"/>
  <line x1="16" y1="16" x2="16" y2="8.6" stroke="${CREAM}" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="16" y1="16" x2="22.2" y2="20.8" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="16" cy="16" r="1.7" fill="${GOLD}"/>
</svg>`;

const FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500&display=swap">`;

function iconHtml(size) {
  return `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:${NAVY}}#m{width:${size}px;height:${size}px}</style>
<div id="m">${MARK}</div>`;
}

const OG_HTML = `<!doctype html><meta charset="utf-8">${FONTS}
<style>
  html,body{margin:0;width:1200px;height:630px;background:${NAVY};
    font-family:'IBM Plex Sans',system-ui,sans-serif;color:${CREAM}}
  .wrap{display:flex;flex-direction:column;justify-content:center;height:100%;padding:0 80px;box-sizing:border-box}
  .row{display:flex;align-items:center;gap:28px}
  .mark{width:96px;height:96px;flex:0 0 96px}
  h1{font-family:'Fraunces',serif;font-weight:700;font-size:78px;line-height:1;margin:0;color:${GOLD};letter-spacing:.01em}
  .sub{font-size:30px;color:${MUTED};margin-top:14px}
  .nums{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:64px;margin-top:44px;color:${CREAM}}
  .nums span{color:${MUTED};font-size:34px;font-family:'IBM Plex Sans',sans-serif;font-weight:400}
  .rule{height:4px;width:180px;background:${GOLD};margin-top:40px}
  .foot{margin-top:34px;font-size:26px;color:${MUTED}}
</style>
<div class="wrap">
  <div class="row"><div class="mark">${MARK}</div><h1>WATCH CYCLES</h1></div>
  <div class="sub">Bitcoin cycle clock</div>
  <div class="nums">1,064 <span>days up</span> &nbsp; / &nbsp; 364 <span>days down</span></div>
  <div class="rule"></div>
  <div class="foot">Time = 1,064 / 364. Price = scenario. Not financial advice.</div>
</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

for (const size of [180, 192, 512]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(iconHtml(size));
  const buf = await page.locator("#m").screenshot({ omitBackground: false });
  writeFileSync(`public/icon-${size}.png`, buf);
  console.log(`wrote public/icon-${size}.png`);
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(OG_HTML, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const og = await page.screenshot({ type: "jpeg", quality: 92 });
writeFileSync("public/og.jpg", og);
console.log("wrote public/og.jpg");

await browser.close();
