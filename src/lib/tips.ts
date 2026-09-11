export type TipId = "BTC" | "ETH" | "PYUSD" | "LTC" | "BCH" | "SOL" | "LINK";

export type TipRail = "paypal" | "onchain";

export type TipCoin = {
  id: TipId;
  symbol: string;
  name: string;
  mark: string;
  rail: TipRail;
  network: { es: string; en: string };
  uriPrefix: "bitcoin:" | "ethereum:" | "solana:" | "litecoin:" | "bitcoincash:";
  splMint?: string;
  /** If empty, reuse this coin’s address (same chain). */
  fallback?: TipId;
};

export const TIP_AMOUNTS = [
  { id: "coffee", usd: 10 },
  { id: "dinner", usd: 50 },
  { id: "clock", usd: 100 },
] as const;

export type TipAmountId = (typeof TIP_AMOUNTS)[number]["id"];

/** Public tip jar. Empty address = hidden QR until published in this file. */
export const TIP_COINS: TipCoin[] = [
  {
    id: "BTC",
    symbol: "BTC",
    name: "Bitcoin",
    mark: "₿",
    rail: "paypal",
    network: { es: "Bitcoin · PayPal", en: "Bitcoin · PayPal" },
    uriPrefix: "bitcoin:",
  },
  {
    id: "ETH",
    symbol: "ETH",
    name: "Ethereum",
    mark: "Ξ",
    rail: "paypal",
    network: { es: "Ethereum · PayPal", en: "Ethereum · PayPal" },
    uriPrefix: "ethereum:",
  },
  {
    id: "PYUSD",
    symbol: "PYUSD",
    name: "PayPal USD",
    mark: "P",
    rail: "paypal",
    network: { es: "PYUSD · Solana · PayPal", en: "PYUSD · Solana · PayPal" },
    uriPrefix: "solana:",
    splMint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
  },
  {
    id: "LTC",
    symbol: "LTC",
    name: "Litecoin",
    mark: "Ł",
    rail: "onchain",
    network: { es: "Litecoin on-chain", en: "Litecoin on-chain" },
    uriPrefix: "litecoin:",
  },
  {
    id: "BCH",
    symbol: "BCH",
    name: "Bitcoin Cash",
    mark: "₡",
    rail: "onchain",
    network: { es: "Bitcoin Cash on-chain", en: "Bitcoin Cash on-chain" },
    uriPrefix: "bitcoincash:",
  },
  {
    id: "SOL",
    symbol: "SOL",
    name: "Solana",
    mark: "◎",
    rail: "onchain",
    network: { es: "Solana on-chain", en: "Solana on-chain" },
    uriPrefix: "solana:",
  },
  {
    id: "LINK",
    symbol: "LINK",
    name: "Chainlink",
    mark: "⬡",
    rail: "onchain",
    network: { es: "LINK · Ethereum (ERC-20)", en: "LINK · Ethereum (ERC-20)" },
    uriPrefix: "ethereum:",
  },
];

/** Public tip jar — the site owner's PayPal receive addresses. Do not replace. */
export const DEFAULT_TIP_ADDRESSES: Record<TipId, string> = {
  BTC: "bc1qcgsuxczyc3k69q4qp8sn9r3tf2dtxtfxv8ll4l",
  ETH: "0x6eec7a70B1782D17cdd0dbAccAF084F5af5f91C3",
  PYUSD: "4M8whmNo6bfLx4Uxs9wV925Uix8R1wLubHs29pymhRhF",
  LTC: "",
  BCH: "",
  SOL: "",
  LINK: "",
};

export const DEFAULT_PAYPAL_ME = "";

/** Personal PayPal receive QR. */
export const PAYPAL_QR_URL =
  "https://www.paypal.com/qrcodes/p2pqrc/UF5F9SFGYSZ2G";

/** PayPal seller QR named Tip Jar. */
export const PAYPAL_TIPJAR_URL =
  "https://www.paypal.com/qrcodes/managed/273bdb0c-2161-4902-a4bb-e46410147e91";

export const PAYPAL_QR_IMG = "/tips/paypal-personal.png";
export const PAYPAL_TIPJAR_IMG = "/tips/paypal-tipjar.png";

export function parsePaypalMe(raw: string): string {
  return raw
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?paypal\.me\//i, "")
    .replace(/^https?:\/\/(www\.)?paypal\.com\/paypalme\//i, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

export function paypalMeUrl(slug: string, amountUsd: number): string | null {
  const s = parsePaypalMe(slug);
  if (!s) return null;
  const n = Math.max(1, Math.min(10_000, Math.round(Number(amountUsd) || 0)));
  return `https://www.paypal.com/paypalme/${encodeURIComponent(s)}/${n}USD`;
}

export function resolveAddress(
  coin: TipCoin,
  addresses: Record<string, string>,
): string {
  const own = (addresses[coin.id] ?? "").trim();
  if (own) return own;
  if (coin.fallback) return (addresses[coin.fallback] ?? "").trim();
  return "";
}

export function paymentUri(coin: TipCoin, address: string): string {
  const a = address.trim();
  if (!a) return "";
  if (coin.uriPrefix === "bitcoin:") return `bitcoin:${a}`;
  if (coin.uriPrefix === "ethereum:") return `ethereum:${a}`;
  if (coin.uriPrefix === "litecoin:") return `litecoin:${a}`;
  if (coin.uriPrefix === "bitcoincash:") {
    return a.toLowerCase().startsWith("bitcoincash:") ? a : `bitcoincash:${a}`;
  }
  if (coin.uriPrefix === "solana:") {
    if (coin.splMint) return `solana:${a}?spl-token=${coin.splMint}`;
    return `solana:${a}`;
  }
  return a;
}

export function qrSrc(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&bgcolor=0B1F3A&color=F7F4EA&data=${encodeURIComponent(data)}`;
}

export function shortenAddr(addr: string): string {
  const a = addr.trim();
  if (a.length <= 16) return a;
  return `${a.slice(0, 8)}…${a.slice(-6)}`;
}

export function tipMarkClass(id: TipId): string {
  switch (id) {
    case "BTC":
      return "bg-tip-btc text-navy";
    case "ETH":
      return "bg-tip-eth text-cream";
    case "PYUSD":
      return "bg-tip-pyusd text-cream";
    case "LTC":
      return "bg-tip-ltc text-navy";
    case "BCH":
      return "bg-tip-bch text-cream";
    case "SOL":
      return "bg-tip-sol text-navy";
    case "LINK":
      return "bg-tip-link text-cream";
  }
}

export function mergeTipAddresses(
  overlay?: Partial<Record<string, unknown>> | null,
): Record<TipId, string> {
  const out: Record<TipId, string> = { ...DEFAULT_TIP_ADDRESSES };
  if (!overlay) return out;
  for (const c of TIP_COINS) {
    const v = overlay[c.id];
    if (typeof v === "string" && v.trim()) out[c.id] = v.trim();
  }
  return out;
}

export function clampTipAmount(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(10_000, Math.round(n));
}
