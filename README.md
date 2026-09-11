# Watch Cycles — Bitcoin 1,064 / 364

Live Bitcoin cycle clock. 1,064 days up, 364 days down. Countdown to the Oct 5, 2026 cycle
test. Not financial advice.

**Live:** https://watchcycles.com

## Start here

- `CLAUDE.md` — the contract: brand lock, language rules, thesis numbers, hard rules.
- `FEATURES.md` — the feature + look checklist.
- `CONTINUAR.md` — where the last session stopped and what to do next.

## Commands

```bash
npm install
npm run dev                                        # http://localhost:8080
npx tsc --noEmit                                   # must be 0 errors
npm run build                                      # writes .vercel/output
npx vite preview                                   # http://127.0.0.1:8081

node scripts/verify-public.mjs                     # acceptance checks vs local preview
node scripts/verify-public.mjs https://watchcycles.com
node scripts/make-brand-assets.mjs                 # regenerate icons + og.jpg

npx vercel deploy --prebuilt --prod
```

## Stack

React 19 · TanStack Start/Router (file routes in `src/routes/`) · Tailwind v4 · Zustand ·
lightweight-charts · Nitro on the Vercel preset. No database.
