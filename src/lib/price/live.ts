import { getCoin, type CoinId } from "@/lib/coins/catalog";
import { loadTicker, type Ticker } from "./fetchers";

type TickFn = (t: Ticker) => void;

function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

type Sock = { close: () => void };

function openCoinbase(
  product: string,
  onTick: TickFn,
  onDead: () => void,
): Sock {
  const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");
  let dead = false;
  const die = () => {
    if (dead) return;
    dead = true;
    onDead();
  };
  ws.onopen = () => {
    if (dead) return;
    ws.send(
      JSON.stringify({
        type: "subscribe",
        product_ids: [product],
        channels: ["ticker"],
      }),
    );
  };
  ws.onmessage = (ev) => {
    if (dead || document.visibilityState === "hidden") return;
    try {
      const m = JSON.parse(String(ev.data)) as Record<string, unknown>;
      if (m.type !== "ticker") return;
      const spot = num(m.price);
      if (!spot) return;
      const open = num(m.open_24h);
      onTick({
        spot,
        change24h: open ? ((spot - open) / open) * 100 : 0,
        high24h: num(m.high_24h),
        low24h: num(m.low_24h),
        source: `COINBASE:${product}`,
        ts: Date.now(),
      });
    } catch {
      /* ignore */
    }
  };
  ws.onerror = () => {
    try {
      ws.close();
    } catch {
      /* ignore */
    }
  };
  ws.onclose = () => die();
  return {
    close: () => {
      dead = true;
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    },
  };
}

function openKraken(symbol: string, onTick: TickFn, onDead: () => void): Sock {
  const ws = new WebSocket("wss://ws.kraken.com/v2");
  let dead = false;
  const die = () => {
    if (dead) return;
    dead = true;
    onDead();
  };
  ws.onopen = () => {
    if (dead) return;
    ws.send(
      JSON.stringify({
        method: "subscribe",
        params: { channel: "ticker", symbol: [symbol], snapshot: true },
      }),
    );
  };
  ws.onmessage = (ev) => {
    if (dead || document.visibilityState === "hidden") return;
    try {
      const m = JSON.parse(String(ev.data)) as {
        channel?: string;
        type?: string;
        data?: Array<Record<string, unknown>>;
      };
      if (m.channel !== "ticker" || !m.data?.[0]) return;
      const d = m.data[0];
      const spot = num(d.last);
      if (!spot) return;
      onTick({
        spot,
        change24h: Number(d.change_pct) || 0,
        high24h: num(d.high),
        low24h: num(d.low),
        source: `KRAKEN:${symbol}`,
        ts: Date.now(),
      });
    } catch {
      /* ignore */
    }
  };
  ws.onerror = () => {
    try {
      ws.close();
    } catch {
      /* ignore */
    }
  };
  ws.onclose = () => die();
  return {
    close: () => {
      dead = true;
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    },
  };
}

export function startLiveBtc(onTick: TickFn, coinId: CoinId = "BTC"): () => void {
  const coin = getCoin(coinId);
  const hasCb = Boolean(coin.pairs.coinbase);
  const hasKr = Boolean(coin.pairs.krakenWs);
  let stopped = false;
  let sock: Sock | null = null;
  let retry = 0;
  let restId = 0;
  let reconnectId = 0;
  let source: "coinbase" | "kraken" = hasCb ? "coinbase" : "kraken";
  let lastWs = 0;
  let lastEmit = 0;
  let lastSpot = 0;

  const gatedTick = (t: Ticker) => {
    if (stopped) return;
    const now = Date.now();
    if (t.source.startsWith("COINBASE") || t.source.startsWith("KRAKEN")) {
      lastWs = now;
      retry = 0;
    }
    const rel = lastSpot > 0 ? Math.abs(t.spot - lastSpot) / lastSpot : 1;
    const moved = rel >= 0.00005;
    if (!moved && now - lastEmit < 1000) return;
    lastEmit = now;
    lastSpot = t.spot;
    onTick(t);
  };

  const rest = async () => {
    if (stopped) return;
    if (Date.now() - lastWs < 12_000) return;
    try {
      const t = await loadTicker(coinId);
      gatedTick({ ...t, ts: Date.now() });
    } catch {
      /* keep last */
    }
  };

  const connect = () => {
    if (stopped) return;
    window.clearTimeout(reconnectId);
    sock?.close();
    sock = null;
    const onDead = () => {
      sock = null;
      if (stopped) return;
      const delay = Math.min(15_000, 1000 * 2 ** Math.min(retry, 4));
      retry += 1;
      if (retry >= 2 && hasCb && hasKr) {
        source = source === "coinbase" ? "kraken" : "coinbase";
      }
      reconnectId = window.setTimeout(connect, delay);
    };
    if (source === "coinbase" && coin.pairs.coinbase) {
      sock = openCoinbase(coin.pairs.coinbase, gatedTick, onDead);
    } else if (coin.pairs.krakenWs) {
      sock = openKraken(coin.pairs.krakenWs, gatedTick, onDead);
    } else {
      onDead();
    }
  };

  if (hasCb || hasKr) connect();
  void rest();
  restId = window.setInterval(() => void rest(), 15_000);

  const vis = () => {
    if (stopped) return;
    if (document.visibilityState === "visible") {
      if (!sock && (hasCb || hasKr)) connect();
      void rest();
    }
  };
  document.addEventListener("visibilitychange", vis);

  return () => {
    stopped = true;
    document.removeEventListener("visibilitychange", vis);
    window.clearInterval(restId);
    window.clearTimeout(reconnectId);
    sock?.close();
    sock = null;
  };
}

export function tfStepSec(tf: string): number {
  switch (tf) {
    case "1m":
      return 60;
    case "5m":
      return 300;
    case "15m":
      return 900;
    case "30m":
      return 1800;
    case "1h":
      return 3600;
    case "4h":
      return 14_400;
    case "1D":
      return 86_400;
    case "1W":
      return 604_800;
    default:
      return 86_400;
  }
}

export function barOpenTime(tf: string, nowMs: number, lastTime?: number): number {
  const step = tfStepSec(tf);
  if (tf === "1W" && lastTime) {
    if (nowMs / 1000 < lastTime + step) return lastTime;
    return lastTime + Math.floor((nowMs / 1000 - lastTime) / step) * step;
  }
  return Math.floor(nowMs / 1000 / step) * step;
}
