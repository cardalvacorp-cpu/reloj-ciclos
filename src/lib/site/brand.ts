/**
 * Single source of truth for the public brand.
 *
 * One name everywhere: Watch Cycles. No personal name ships in the product,
 * the meta tags, the share card or the donation line.
 */
export const BRAND = "Watch Cycles";

export const SITE_URL = "https://watchcycles.com";

export const SITE_TITLE = "Watch Cycles — Bitcoin 1,064 / 364 clock";

export const SITE_DESCRIPTION =
  "Live Bitcoin cycle clock. 1,064 days up, 364 days down. Countdown to the Oct 5, 2026 cycle test. Not financial advice.";

/** Allowed subtitle. Never the main title. */
export const BRAND_SUBTITLE = { es: "Reloj del ciclo de Bitcoin", en: "Bitcoin cycle clock" };

export const OG_IMAGE = "/og.jpg";

/** Thesis pages, linked from the home CTAs. */
export const ROUTES = {
  home: "/",
  method: "/method",
  /** The dated test. `/test` still resolves and redirects here. */
  test: "/oct-5",
  faq: "/faq",
  contact: "/contact",
  embed: "/embed",
} as const;

/**
 * Owner + contact details. These live on /contact only — never in the header,
 * title, meta, Open Graph, share card or donation line, which stay brand-only.
 */
export const CONTACT = {
  email: "cardalvacorp@gmail.com",
  owner: "Guillermo Cardenas",
} as const;

/**
 * The brand's X handle, without the @. Empty hides the link and the
 * twitter:site tag rather than pointing people at a placeholder.
 */
export const X_HANDLE = "WatchCycles";

export const X_URL = X_HANDLE ? `https://x.com/${X_HANDLE}` : "";
