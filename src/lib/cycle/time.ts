export type Lang = "es" | "en";

export const MS_SECOND = 1000;
export const MS_MINUTE = 60_000;
export const MS_HOUR = 3_600_000;
export const MS_DAY = 86_400_000;
export const MS_YEAR = 365.25 * MS_DAY;
export const MS_MONTH = 30.436875 * MS_DAY;

export type ClockParts = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

export const ES_MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
export const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type YmdHms = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function pad2(n: number): string {
  return pad(Math.trunc(n));
}

export function getTimeZoneOffsetMs(utcMs: number, timeZone: string): number {
  const d = new Date(utcMs);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return asUtc - utcMs;
}

export function getZonedParts(utcMs: number, timeZone: string): YmdHms {
  const d = new Date(utcMs);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

export function parseLocalToUtcMs(local: string, timeZone: string): number {
  const [date, time] = local.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const hm = (time ?? "00:00").split(":");
  const hh = Number(hm[0] || 0);
  const mm = Number(hm[1] || 0);
  const guess = Date.UTC(y, m - 1, d, hh, mm, 0);
  const offset = getTimeZoneOffsetMs(guess, timeZone);
  return guess - offset;
}

export function calendarDays(startYmd: string, endYmd: string): number {
  const a = startYmd.slice(0, 10);
  const b = endYmd.slice(0, 10);
  const [ys, ms, ds] = a.split("-").map(Number);
  const [ye, me, de] = b.split("-").map(Number);
  const s = Date.UTC(ys, ms - 1, ds);
  const e = Date.UTC(ye, me - 1, de);
  return Math.round((e - s) / MS_DAY);
}

export function addDaysUtc(utcMs: number, days: number): number {
  return utcMs + days * MS_DAY;
}

export function breakdownMs(ms: number): ClockParts {
  let rem = Math.max(0, ms);
  const years = Math.floor(rem / MS_YEAR);
  rem -= years * MS_YEAR;
  const months = Math.floor(rem / MS_MONTH);
  rem -= months * MS_MONTH;
  const days = Math.floor(rem / MS_DAY);
  rem -= days * MS_DAY;
  const hours = Math.floor(rem / MS_HOUR);
  rem -= hours * MS_HOUR;
  const minutes = Math.floor(rem / MS_MINUTE);
  rem -= minutes * MS_MINUTE;
  const seconds = Math.floor(rem / MS_SECOND);
  return { years, months, days, hours, minutes, seconds, totalMs: ms };
}

export function formatDate(utcMs: number, lang: Lang, timeZone: string): string {
  const p = getZonedParts(utcMs, timeZone);
  if (lang === "es") return `${p.day} ${ES_MONTHS[p.month - 1]} ${p.year}`;
  return `${EN_MONTHS[p.month - 1]} ${p.day}, ${p.year}`;
}

export function formatDateTime(
  utcMs: number,
  lang: Lang,
  timeZone: string,
): string {
  const p = getZonedParts(utcMs, timeZone);
  const date =
    lang === "es"
      ? `${p.day} ${ES_MONTHS[p.month - 1]} ${p.year}`
      : `${EN_MONTHS[p.month - 1]} ${p.day}, ${p.year}`;
  return `${date} ${pad(p.hour)}:${pad(p.minute)}`;
}

export function formatUsd(n: number, lang: Lang, digits = 0): string {
  return new Intl.NumberFormat(lang === "es" ? "es-MX" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);
}

export function formatUsdCompact(n: number, lang: Lang): string {
  const abs = Math.abs(n);
  const locale = lang === "es" ? "es-MX" : "en-US";
  if (abs >= 1000) {
    const k = n / 1000;
    const body = new Intl.NumberFormat(locale, {
      maximumFractionDigits: k >= 100 ? 0 : 1,
      minimumFractionDigits: 0,
    }).format(k);
    return `$${body}k`;
  }
  return formatUsd(n, lang, abs >= 100 ? 0 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : 5);
}

export function formatInt(n: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === "es" ? "es-MX" : "en-US").format(
    Math.round(n),
  );
}

export function formatPct(n: number, digits = 0): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function fmtCycle(n: number, lang: Lang): string {
  const s = String(Math.round(n));
  if (s.length <= 3) return s;
  const head = s.slice(0, -3);
  const tail = s.slice(-3);
  return lang === "es" ? `${head}.${tail}` : `${head},${tail}`;
}

export function priceDigits(n: number): number {
  const abs = Math.abs(n);
  if (abs >= 1000) return 0;
  if (abs >= 100) return 1;
  if (abs >= 1) return 2;
  if (abs >= 0.1) return 3;
  if (abs >= 0.01) return 4;
  return 5;
}
