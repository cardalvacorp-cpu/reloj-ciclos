/**
 * Cross-checks a window of BTC daily closes across independent exchanges.
 * A row in the public log that only one exchange believes is a data bug, not history.
 *
 *   node scripts/cross-check-closes.mjs 2026-08-03 2026-09-02
 */
const from = process.argv[2] ?? "2026-08-03";
const to = process.argv[3] ?? "2026-09-02";
const startMs = Date.parse(`${from}T00:00:00Z`);
const endMs = Date.parse(`${to}T23:59:59Z`);

const UA = { accept: "application/json", "user-agent": "Mozilla/5.0 (WatchCycles/1.0)" };
const day = (ms) => new Date(ms).toISOString().slice(0, 10);

async function j(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function kraken() {
  const d = await j(
    `https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=1440&since=${Math.floor(startMs / 1000)}`,
  );
  const key = Object.keys(d.result).find((k) => k !== "last");
  return new Map(
    d.result[key]
      .map((c) => [day(c[0] * 1000), Number(c[4])])
      .filter(([dd]) => dd >= from && dd <= to),
  );
}

async function binanceUs() {
  const d = await j(
    `https://api.binance.us/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startMs}&endTime=${endMs}&limit=1000`,
  );
  return new Map(d.map((c) => [day(c[0]), Number(c[4])]));
}

async function coinbase() {
  const d = await j(
    `https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=86400&start=${new Date(startMs).toISOString()}&end=${new Date(endMs).toISOString()}`,
  );
  return new Map(d.map((c) => [day(c[0] * 1000), Number(c[4])]));
}

const sources = { KRAKEN: kraken, "BINANCE.US": binanceUs, COINBASE: coinbase };
const got = {};
for (const [name, fn] of Object.entries(sources)) {
  try {
    got[name] = await fn();
    console.log(`${name}: ${got[name].size} velas`);
  } catch (e) {
    console.log(`${name}: ERROR ${e.message}`);
  }
}

const names = Object.keys(got);
const days = [...new Set(names.flatMap((n) => [...got[n].keys()]))].sort();
console.log(`\n${"fecha".padEnd(12)}${names.map((n) => n.padStart(13)).join("")}   spread`);
for (const d of days) {
  const vals = names.map((n) => got[n].get(d));
  const nums = vals.filter((v) => Number.isFinite(v));
  if (nums.length < 2) continue;
  const spread = ((Math.max(...nums) - Math.min(...nums)) / Math.min(...nums)) * 100;
  const flag = spread > 2 ? "  <-- DISCREPANCIA" : "";
  console.log(
    d.padEnd(12) +
      vals.map((v) => (Number.isFinite(v) ? v.toFixed(0) : "—").padStart(13)).join("") +
      `   ${spread.toFixed(1)}%${flag}`,
  );
}
