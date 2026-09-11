# CLAUDE.md — Watch Cycles

Read **FEATURES.md** and look at **LOOK-LIKE-THIS/** before you touch anything.

The owner is not a developer and writes in Spanish. Give concrete steps, one command at a time.
The product is a **serious public cycle-prediction site**: same app, improved, published as a
normal website. Anyone opens the link on a phone. **Zero login.**

## Mission

1. Improve what already works. Do not redesign from scratch, do not clone someone else's site.
2. Publish on **Vercel** as a **public** site. Do not break the deploy.
3. One URL that can be sent on WhatsApp / X / Instagram.
4. **No Grok wall. No “Continue with Grok”. No Sign up. No accounts.**

The `*.grok.me` link is **forbidden** as the public URL.

## Brand lock

One name everywhere: **Watch Cycles**. Defined once in `src/lib/site/brand.ts`.

- Title: `Watch Cycles — Bitcoin 1,064 / 364`
- Allowed subtitle: “Bitcoin cycle clock”. Never “Reloj BTC” as the main title.
- Fixed disclaimer, always on screen: `Time = 1,064 / 364. Price = scenario. Not financial advice.`
- **No personal name in any file that ships** — header, title, meta, Open Graph, footer,
  share card, donation line, body copy, or image. `scripts/verify-public.mjs` fails the build
  contract if one comes back.

## Language

Native **English first**: UI, meta, share card, donation line, method, FAQ, alerts.
Spanish stays as a full second language behind the `ES | EN` toggle — every string in
`src/lib/i18n.ts` exists in both. `?lang=es` / `?lang=en` force one; the hreflang alternates
in `__root.tsx` point at those. Never ship Spanish as the default UI.

## Thesis (do not change these numbers unless asked)

- UP ≈ **1,064** days. DOWN ≈ **364** days.
- C1 ≈ 1,068 / 363 (−84%). C2 ≈ 1,061 / 376 (−77%).
- C3 high: **Oct 6, 2025 · $126,198**. C3 UP ≈ 1,050 days.
- Cycle-low test: **Oct 5, 2026** (high + 364). Tolerance window −1 / +12 days.
- Model next high: **Sep 3, 2029**.
- Scenario low range $18.9k–$63.1k, base zone $29k–$37.9k — derived in `computeRanges`,
  never hardcoded in a component.
- The clock measures time. Price is a scenario. The clock does not produce price.

All of it lives in `src/lib/coins/catalog.ts` + `src/lib/cycle/model.ts`. Read the numbers from
the model in components — do not retype them into JSX.

## Hard rules

- `VITE_AUTH_ENABLED` stays `"false"`. No `/login`. No `authMiddleware`.
- No database. Zustand + localStorage, plus the in-memory server counters for presence and votes.
- Do not replace the PayPal / BTC / ETH / PYUSD addresses (`src/lib/tips.ts`).
- Do not say buy or sell. No dollar fundraising goals. No AdSense. No popups.
- Do not drop Map, Chart, Alerts, any coin, or the donation sheet.
- Mobile-first iPhone. Donation sheet: $10 / $50 / $100 + PayPal + crypto chips.

## Stack

React 19, TanStack Start/Router, Tailwind v4, Zustand, lightweight-charts.
Routes are file-based in `src/routes/` — `routeTree.gen.ts` is generated, never edit it.

```bash
npm install
npx tsc --noEmit
npm run build
node scripts/make-brand-assets.mjs   # only when the wordmark or the two numbers change
```

If Nitro/PGLite crashes on preview/Vercel (`pglite.data` missing): **this app does not need a
database**. Strip PGLite. Client-rendered is fine.

## Deploy

```bash
npm run build
npx vercel deploy --prebuilt --prod
node scripts/verify-public.mjs https://watchcycles.com
```

The verify script is the acceptance contract. It must be green before you call it done.

- Incognito, iPhone width, `es-ES` locale: the clock appears immediately **in English**.
- Real `<h1>Watch Cycles</h1>`, canonical, hreflang, Open Graph, Twitter card.
- `/method`, `/test`, `/faq` all return 200 and carry no personal name.
- Flip BTC → ETH → JUP → SUI: clock days, map, chart, alerts all update.

Optional later: custom domain. Do not block on a domain.

## Done when

A stranger on a phone taps the link → reads the hook, where the cycle is, and the dated call →
can check the method, the test and the FAQ → shares it or signs up for alerts. No Grok, no
sign up, no personal name, English by default and Spanish one tap away.
