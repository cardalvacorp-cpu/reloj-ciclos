# Prompt to paste into Claude Code

Use this in the Watch Cycles repo. Do not ask Claude Code to run marketing.

---

You are working in the Watch Cycles codebase (watchcycles.com).

Implement product changes only. Do not add affiliate banners. Do not add new coins.

1. Default the app to BTC. Move ETH/SOL/other tickers behind an "Also watch" control.
2. Remove or hide the live "using now / visits / avg time" counter until the numbers are real and not embarrassing.
3. Soften homepage dollar language:
   - Do not lead with "the call is $29k–$37.9k"
   - Label any dollar range "historical analog zone"
   - Keep the line: "The clock does not produce price."
4. Build a Share Card:
   - Portrait 1080x1350 and landscape 1600x900
   - Fields: CYCLE 3 · DOWN, day/364, spot, vs high, days to Oct 5 2026, tension line, watchcycles.com, not financial advice
   - Buttons: Copy image, Copy post (prefilled text)
5. Add routes:
   - /method
   - /oct-5
   - /embed (minimal iframe: phase, day count, spot, vs high, date, link back)
6. SEO
   - Title on home: Watch Cycles — Bitcoin 1,064 / 364 clock
   - Unique titles on /method and /oct-5
   - Meta descriptions
   - sitemap.xml including the new routes
   - Dynamic OG image that renders the current reading so X/Slack unfurls a card, not a generic title
7. Keep ES/EN.
8. Do not change the Oct 5, 2026 test date.

Copy for /method and /oct-5 is in the sibling markdown files. Use that copy. Do not invent a new theory.

---

After Claude Code ships, you still have to post on X yourself.
