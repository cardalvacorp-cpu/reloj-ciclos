# Feature + look lock — Watch Cycles

**Improve what works. Do not redesign from scratch. Do not drop screens.**
If a screen, coin, button, color, or copy exists here, it must exist on the public site.

Visual ground truth (open these first): `LOOK-LIKE-THIS/`.

## Brand lock

- One name everywhere: **Watch Cycles**. No personal name in any file that ships.
- Title: `Watch Cycles — Bitcoin 1,064 / 364`
- Description: `Live Bitcoin cycle clock. 1,064 days up, 364 days down. Countdown to the Oct 5, 2026 cycle test. Not financial advice.`
- Allowed subtitle: “Bitcoin cycle clock”. Never “Reloj BTC” as the main title.
- Fixed disclaimer, always visible: `Time = 1,064 / 364. Price = scenario. Not financial advice.`
- Source of truth: `src/lib/site/brand.ts`. Change it there, nowhere else.

## Look (must match)

- Dark navy `#0B1F3A` / `#071525` / cards `#122844`
- Gold `#C9A227`, cream `#F7F4EA`, green `#1B7A4E`, red `#B03A2E`
- Coffee yellow `#FFDD00` on donation / PayPal buttons
- Fonts: **Fraunces** (titles) + **IBM Plex Sans** + **IBM Plex Mono** (already in `__root.tsx`)
- Rounded cards, gold uppercase labels, tabular clocks
- Brand mark: the gold clock in `public/favicon.svg`. Regenerate the PNG icons and
  the OG image with `node scripts/make-brand-assets.mjs`. No personal photo.
- Mobile-first (iPhone 390×844). Bottom tab bar: Clock / Map / Chart / Alerts

`src/styles.css` is the palette. Do not swap Tailwind defaults for this.

## Every feature (checklist)

### Shell
- [ ] ES | EN language toggle in the header
- [ ] Coffee button in the header (opens tip sheet)
- [ ] Settings (Ajustes) gear
- [ ] Live strip: measured cycle / price is a scenario / not advice
- [ ] Horizontal coin tabs, all 11, each with **its own** UP/DOWN days from `src/lib/coins/catalog.ts`:
  BTC, ETH, SOL, JUP, XRP, BNB, DOGE, ADA, LINK, AVAX, SUI
- [ ] Live spot from the existing price client (Kraken / Coinbase / Binance / KuCoin fallbacks)
- [ ] Four tabs: Clock, Map, Chart, Alerts
- [ ] Room mode (huge clock)
- [ ] Share card (download / share image)
- [ ] Onboarding 4 slides + Skip — **no account**
- [ ] Public: zero login, zero Grok wall

### Home thesis blocks (ClockView top)
- [ ] Hook: `<pct>% of the time · only <dd> in price` — live, never hardcoded
- [ ] Now card: phase, day n/total, spot, vs high, days to the cycle-low test
- [ ] Call card: base zone into the test date + the invalidation sentence
- [ ] CTA row: Method / The test / Share / Alerts
- [ ] Footer nav: Method / The test / FAQ

### Thesis pages (clean routes, indexable, ES + EN)
- [ ] `/method` — the exact C1/C2/C3 dates, what counts as a high and a low
- [ ] `/test` — the dated call, tolerance window, invalidation rule, log, post copy, vote
- [ ] `/faq` — advice? day counts? what if it fails? alts? (+ FAQPage JSON-LD)

### Reloj (ClockView)
- [ ] Bullish / bearish semaphore
- [ ] Cycle title (current phase)
- [ ] Day `n / total` + % bar
- [ ] Elapsed clock + remaining clock (Y M D H M S)
- [ ] Presence strip (who is looking)
- [ ] Phase end / next low / next high dates
- [ ] Spot, 24h, ATH, drawdown
- [ ] Range / base zone when enabled
- [ ] Analog radar (“a cuál se parece”) with C1/C2 ghosts
- [ ] “Qué hace el mercado” + voice
- [ ] Donation card + coin chips

### Mapa
- [ ] Frozen historical phases + projected
- [ ] Halvings where the coin has them
- [ ] Analog overlays / dates
- [ ] Per-coin study copy from the catalog

### Chart
- [ ] Daily (and available) klines
- [ ] Analog ghost lines (C1/C2)
- [ ] Fibs / cycle bands / targets / legend
- [ ] Works after switching coins

### Alertas
- [ ] Seeded clock alerts + volume/flow + aggressive moves
- [ ] Analog / pre-turn
- [ ] Mute red box option
- [ ] Phone notification toggle (existing `notify.ts`)

### Donation / PayPal / crypto (do not invent new UI)
- [ ] Header donate button (coffee icon kept), ClockView card, RelojApp sheet, Settings editor
- [ ] Copy: “Donations to keep the website alive.” signed “— Watch Cycles”. No dollar goal.
- [ ] Amounts: $10 / $50 / $100 + custom USD
- [ ] Yellow **Pay with PayPal** → Tip Jar URL
- [ ] Default PayPal QR: `public/tips/paypal-tipjar.png`
- [ ] Coins: BTC ETH PYUSD LTC BCH SOL LINK
- [ ] Published addresses in `src/lib/tips.ts` (do not blank them):
  - BTC `bc1qcgsuxczyc3k69q4qp8sn9r3tf2dtxtfxv8ll4l`
  - ETH `0x6eec7a70B1782D17cdd0dbAccAF084F5af5f91C3`
  - PYUSD `4M8whmNo6bfLx4Uxs9wV925Uix8R1wLubHs29pymhRhF`
- [ ] QR + Copiar for each published address

### Settings
- [ ] Timezone list
- [ ] ATH date/price, UP days, DOWN days (per coin model)
- [ ] Low zones (mild / base / severe)
- [ ] Mark real low / high, no-analog
- [ ] Volume thresholds, notifications, whale prints
- [ ] Tip PayPal.me + address paste (localStorage)
- [ ] Export / import JSON, export CSV
- [ ] Reset

### Return visits + sharing
- [ ] Share card: brand, phase, day n/total, %, spot, vs high, test date, base zone, URL, not-advice
- [ ] Ready-to-post X text (Share sheet + copy button on `/test`)
- [ ] Sunday update text, copy button on `/test`
- [ ] Yes/No vote “Does the cycle hold this time?” with live % (`/test`)
- [ ] Alert signup: Notification API toggle + email field with the three triggers

### i18n
- [ ] Full ES + EN from `src/lib/i18n.ts`. Default language is **English**.
- [ ] `?lang=es` / `?lang=en` switch the UI (this is what the hreflang alternates point at).
- [ ] Do not leave Spanish-only or English-only screens.

## Allowed changes (only these)

1. Remove Grok gate / `*.grok.me` login wall / `public/__grok` chrome if it blocks a public host.
2. Skip PGLite / database — this product does not need one.
3. Deploy to Vercel (or Netlify / Cloudflare) as a **public** URL.
4. Brand, thesis pages, trust surfaces and share/return-visit features per the sections above.

**Forbidden:** new visual language, dropping coins, dropping Map/Chart/Alerts, dropping the
donation jar, adding login, changing the crypto addresses in `src/lib/tips.ts`, saying buy or
sell, dollar fundraising goals, AdSense, popups, shipping Spanish as the default UI, putting a
personal name back in any file, changing the thesis numbers.

## Done

A stranger on a phone opens the public URL → sees the hook, where the cycle is, and the dated
call → can read the method, the test and the FAQ → shares it or signs up for the three alerts.
English by default, Spanish one tap away, no login, no personal name.
