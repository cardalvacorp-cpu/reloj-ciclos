/**
 * Public-site acceptance check — FEATURES.md "Done" contract.
 *
 * Loads the site in a fresh, cookie-less iPhone-width context (the "ventana
 * privada" test) and asserts the Reloj is on screen with no Grok wall and no
 * login, all four tabs, all eleven coins, and the café sheet with PayPal + the
 * BTC/ETH/PYUSD addresses.
 *
 *   node scripts/verify-public.mjs [url]
 *   node scripts/verify-public.mjs https://watchcycles.com/
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.argv[2] ?? "http://127.0.0.1:8081/";
const SHOTS = "verify-shots";

const COINS = ["BTC", "ETH", "SOL", "JUP", "XRP", "BNB", "DOGE", "ADA", "LINK", "AVAX", "SUI"];
const ADDRESSES = {
  BTC: "bc1qcgsuxczyc3k69q4qp8sn9r3tf2dtxtfxv8ll4l",
  ETH: "0x6eec7a70B1782D17cdd0dbAccAF084F5af5f91C3",
  PYUSD: "4M8whmNo6bfLx4Uxs9wV925Uix8R1wLubHs29pymhRhF",
};
const FORBIDDEN = [
  "Continue with Grok",
  "Sign up",
  "Sign in",
  "Iniciar sesión",
  "grok.me",
  // Brand lock: one name only.
  "Guillermo",
  "Cardenas",
  "Cárdenas",
  "Reloj Ciclos",
];
/**
 * The owner is named on /contact on purpose — an identified owner is what makes
 * a prediction site accountable. Everywhere else the brand lock still applies.
 */
const PAGES = [
  { path: "/method", en: "Method", es: "Método", must: ["1,064", "364", "2025-10-06"] },
  {
    path: "/oct-5",
    en: "The test",
    es: "La prueba",
    must: ["no longer the map", "major low", "Historical analog zone"],
  },
  { path: "/faq", en: "FAQ", es: "Preguntas", must: ["Is this financial advice?"] },
  { path: "/embed", en: "Watch Cycles", es: "Watch Cycles", must: ["watchcycles.com"] },
  {
    path: "/contact",
    en: "Contact",
    es: "Contacto",
    must: ["cardalvacorp@gmail.com", "Guillermo Cardenas", "Advertising and sponsorship"],
    allowOwner: true,
  },
];

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "es-ES" });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

mkdirSync(SHOTS, { recursive: true });

const resp = await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });
check("HTTP 200", resp?.status() === 200, `status ${resp?.status()}`);

// The clock must be painted, not a login page.
await page.waitForSelector(".app-shell", { timeout: 30_000 });
await page.waitForTimeout(3500);

const body = await page.evaluate(() => document.body.innerText);
await page.screenshot({ path: `${SHOTS}/01-clock.png`, fullPage: true });

check("App montada (no shell vacío)", body.trim().length > 200, `${body.trim().length} chars`);

// Brand + English-first. The context locale is es-ES on purpose: the site must
// still boot in English and carry a real H1.
const h1 = (await page.locator("h1").first().innerText().catch(() => "")).trim();
check("H1 real = Watch Cycles", h1 === "Watch Cycles", h1 || "sin h1");
const title = await page.title();
check("Title en inglés", title === "Watch Cycles — Bitcoin 1,064 / 364 clock", title);
const head = await page.content();
check(
  "Meta description en inglés",
  head.includes('content="Live Bitcoin cycle clock.'),
);
check("Open Graph", head.includes('property="og:title"') && head.includes("og:image"));
check("Twitter card", head.includes('name="twitter:card"'));
check("Canonical", head.includes('rel="canonical"'));
check("hreflang en + es", head.includes('hreflang="en"') && head.includes('hreflang="es"'));
// The card headings are uppercased by CSS, so match case-insensitively.
check("Arranca en inglés (locale es-ES)", /where we are/i.test(body), h1);
check("Disclaimer fijo visible", body.includes("Price = scenario. Not financial advice."));
check("Hook en portada", /of the time\s*·\s*only/.test(body));
check("Bloque de predicción", /the call/i.test(body));
check("Regla de invalidación en portada", /no longer the map/i.test(body));
check("Análogo etiquetado, no un objetivo", /historical analog zone/i.test(body));
check("Sin dólares en el titular", !/the call[\s\S]{0,120}\$\d/i.test(body));
check("Contador de presencia oculto", !/using now/i.test(body));
check("CTAs", /Method/.test(body) && /The test/.test(body) && /FAQ/.test(body));

for (const f of FORBIDDEN) {
  check(`Sin "${f}"`, !body.includes(f));
}
check("Sin /login en el DOM", !(await page.content()).includes('href="/login"'));

// Bottom tabs. The shell boots in EN, so match either language.
const TABS = [
  { en: "Clock", es: "Reloj" },
  { en: "Map", es: "Mapa" },
  { en: "Chart", es: "Chart" },
  { en: "Alerts", es: "Alertas" },
];
for (const t of TABS) {
  check(`Tab ${t.en}/${t.es}`, body.includes(t.en) || body.includes(t.es));
}

// BTC leads; the alts live behind "Also watch" but must all still be reachable.
check("BTC al frente", body.includes("BTC"));
check("Alts ocultas al entrar", !body.includes("DOGE"));
try {
  await page.getByRole("button", { name: /also watch|ver también/i }).first().click({ timeout: 8000 });
  await page.waitForTimeout(800);
} catch {
  /* the drawer may already be open */
}
const afterOpen = await page.evaluate(() => document.body.innerText);
const missing = COINS.filter((c) => !afterOpen.includes(c));
check("11 coins (incl. JUP)", missing.length === 0, missing.length ? `faltan: ${missing}` : "todas");

// Language toggle
check("Toggle ES | EN", /\bES\b/.test(body) && /\bEN\b/.test(body));

// Walk the tabs
for (const t of ["Map", "Chart", "Alerts", "Clock"]) {
  try {
    await page
      .getByRole("button", { name: new RegExp(`^\\s*${t}\\s*$`, "i") })
      .first()
      .click({ timeout: 10_000 });
    await page.waitForTimeout(2500);
    const txt = await page.evaluate(() => document.body.innerText);
    check(`Tab ${t} renderiza`, txt.trim().length > 400, `${txt.trim().length} chars`);
    await page.screenshot({ path: `${SHOTS}/tab-${t}.png`, fullPage: true });
  } catch (e) {
    check(`Tab ${t} renderiza`, false, String(e).slice(0, 120));
  }
}

// ES | EN toggle actually switches copy.
try {
  await page.getByRole("button", { name: /^\s*ES\s*$/ }).first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  const es = await page.evaluate(() => document.body.innerText);
  check("Toggle ES cambia el idioma", /Reloj|Mapa|Alertas|Ajustes/.test(es));
  await page.screenshot({ path: `${SHOTS}/06-espanol.png`, fullPage: true });
} catch (e) {
  check("Toggle ES cambia el idioma", false, String(e).slice(0, 120));
}

// Café sheet
try {
  await page.getByRole("button", { name: /donate|donar|café|coffee/i }).first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  const sheet = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: `${SHOTS}/05-cafe.png`, fullPage: true });
  check("Sheet de donación abre", /paypal/i.test(sheet), "");
  check(
    "Copy de donación en inglés",
    /Donations to keep the website alive/i.test(sheet) ||
      /Donaciones para mantener el sitio vivo/i.test(sheet),
  );
  check("Montos $10 / $50 / $100", /10/.test(sheet) && /50/.test(sheet) && /100/.test(sheet));

  // Each published address only paints once its coin chip is selected.
  for (const [coin, addr] of Object.entries(ADDRESSES)) {
    try {
      await page
        .getByRole("button", { name: new RegExp(`^\\s*${coin}\\s*$`, "i") })
        .last()
        .click({ timeout: 8000 });
      await page.waitForTimeout(1200);
      const html = await page.content();
      check(`Dirección ${coin} intacta`, html.includes(addr));
      await page.screenshot({ path: `${SHOTS}/cafe-${coin}.png`, fullPage: true });
    } catch (e) {
      check(`Dirección ${coin} intacta`, false, String(e).slice(0, 120));
    }
  }
} catch (e) {
  check("Sheet del café abre", false, String(e).slice(0, 160));
}

// Thesis pages: clean routes, indexable, English by default, no personal name.
for (const p of PAGES) {
  try {
    const target = `${URL.replace(/\/+$/, "")}${p.path}?lang=en`;
    const r = await page.goto(target, { waitUntil: "networkidle", timeout: 45_000 });
    check(`${p.path} responde 200`, r?.status() === 200, `status ${r?.status()}`);
    await page.waitForSelector("h1", { timeout: 20_000 });
    await page.waitForTimeout(1200);
    const txt = await page.evaluate(() => document.body.innerText);
    check(`${p.path} titula "${p.en}"`, txt.includes(p.en) || txt.includes(p.es));
    // Headings are uppercased by CSS, so compare case-insensitively.
    const low = txt.toLowerCase();
    for (const m of p.must) {
      check(`${p.path} contiene "${m}"`, low.includes(m.toLowerCase()));
    }
    const banned = p.allowOwner
      ? FORBIDDEN.filter((f) => !["Guillermo", "Cardenas", "Cárdenas"].includes(f))
      : FORBIDDEN;
    const dirty = banned.filter((f) => txt.includes(f));
    check(`${p.path} sin nombre personal`, dirty.length === 0, dirty.join(", "));
    await page.screenshot({ path: `${SHOTS}/page${p.path.replace("/", "-")}.png`, fullPage: true });
  } catch (e) {
    check(`${p.path} renderiza`, false, String(e).slice(0, 140));
  }
}

// SEO plumbing and the old path.
// Fetched, not navigated: an XML document has no document.body to read.
for (const [name, path, must] of [
  ["sitemap.xml", "/sitemap.xml", "<loc>https://watchcycles.com/oct-5</loc>"],
  ["robots.txt", "/robots.txt", "Sitemap: https://watchcycles.com/sitemap.xml"],
]) {
  try {
    const r = await page.request.get(`${URL.replace(/\/+$/, "")}${path}`, { timeout: 30_000 });
    const txt = await r.text();
    check(name, r.status() === 200 && txt.includes(must), `status ${r.status()}`);
  } catch (e) {
    check(name, false, String(e).slice(0, 120));
  }
}
try {
  await page.goto(`${URL.replace(/\/+$/, "")}/test`, { waitUntil: "networkidle", timeout: 45_000 });
  await page.waitForTimeout(1500);
  check("/test redirige a /oct-5", page.url().includes("/oct-5"), page.url());
} catch (e) {
  check("/test redirige a /oct-5", false, String(e).slice(0, 120));
}

check("Sin errores de JS", errors.length === 0, errors.slice(0, 2).join(" | ").slice(0, 200));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} OK`);
if (failed.length) {
  console.log("FALLOS:\n" + failed.map((f) => `  - ${f.name} ${f.detail}`).join("\n"));
  process.exit(1);
}
