import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

/**
 * Public build — Watch Cycles.
 *
 * Removed vs. the Grok workspace config (allowed by CLAUDE.md § "Allowed changes"):
 * - grokPwaPlugin()      → Grok PWA chrome + /__grok/*. Replaced by public/manifest.webmanifest.
 * - authPopupPlugin()    → /auth/popup OAuth broker. Auth is off; there is no login.
 * - pgliteBootstrapPlugin() → no database (`.grok/app-env.json` → deploy.database=false).
 * - appEnvPlugin()       → dev-only /__app-env probe. VITE_AUTH_ENABLED now comes from .env.
 * - nitro serverDir      → only registered server/middleware/grok-pwa.ts.
 *
 * Kept: TanStack Start + Nitro (vercel preset) so the existing server functions
 * (price/server.ts tickers + klines, presence/server.ts) keep working unchanged.
 */
export default defineConfig(({ command, isPreview }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 8081,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    ...(command === "build" || isPreview ? [nitro({ preset: "vercel" })] : []),
    viteReact(),
  ],
}));
