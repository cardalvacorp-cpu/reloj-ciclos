# Watch Cycles — copia para publicar como website público

App de Watch Cycles. Reloj de ciclos crypto (BTC, ETH, SOL, JUP, XRP, BNB, DOGE, ADA, LINK, AVAX, SUI) + propinas PayPal / BTC / ETH / PYUSD.

## Lo que el dueño quiere

- Website **público**. Cualquiera abre el link y entra. En el teléfono también.
- **CERO login.** No Grok, no Google, no Sign up, no cuentas.
- El link `*.grok.me` NO sirve: Grok pone un muro “Continue with Grok”.
- **Mismo producto y misma pinta.** No rediseñar. Lee `FEATURES.md` y `LOOK-LIKE-THIS/`.

## Cómo publicarlo

1. `npm install`
2. Auth APAGADO: `.grok/app-env.json` → `"VITE_AUTH_ENABLED": "false"`. No agregues `/login`.
3. Publica en **Vercel** (gratis).
4. El URL público es el que se comparte.

Esta app **no usa base de datos**. Si PGLite/Nitro falla, ignóralo y deja el cliente.

## No toques

- No pidas cuenta para ver el reloj.
- Direcciones de propina en `src/lib/tips.ts` (BTC, ETH, PYUSD). No las borres.
- QR PayPal: `public/tips/paypal-tipjar.png` y `paypal-personal.png`.
- i18n ES/EN en `src/lib/i18n.ts`.
- No quites JUP, mapa, chart, alertas, ni el café.

## Stack

React 19, TanStack Start/Router, Tailwind v4, Zustand, lightweight-charts.
