/** Quick probe: does the derived cycle log render, and where did it come from? */
import { chromium, devices } from "playwright";

const url = process.argv[2] ?? "https://watchcycles.com/test?lang=en";
const browser = await chromium.launch();
const page = await browser.newPage({ ...devices["iPhone 13"] });
await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(9000);

const rows = await page.$$eval("table tbody tr", (rs) =>
  rs.map((r) => [...r.querySelectorAll("td")].map((t) => t.innerText.trim()).join("  |  ")),
);
const text = await page.evaluate(() => document.body.innerText);

console.log(`FILAS: ${rows.length}`);
console.log("MAS RECIENTES:");
rows.slice(0, 4).forEach((r) => console.log("  " + r));
console.log("MAS ANTIGUAS:");
rows.slice(-3).forEach((r) => console.log("  " + r));
console.log((text.match(/Source:.*/i) ?? ["(sin línea de fuente)"])[0]);
if (/Could not reach the exchanges/i.test(text)) console.log("AVISO: log marcado como stale");

await browser.close();
