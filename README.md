# Simon Rook — author site

Static marketing site for the author **Simon Rook**, built with Astro and
deployed to Cloudflare Pages. Live domain: `simonrook.com`.

Companion to the book workspace at `C:\Users\JD\Projects\Simon Rook`, which
holds the manuscripts, covers, and publishing files. This repo holds only the
website.

## Quick start

```bash
npm install
npm run dev       # http://localhost:4321 — pages only, no Functions
npm run build     # -> dist/
npm run preview   # serve the built output

npm run build && npx wrangler pages dev dist   # includes /api/contact
```

Use the last one to exercise the contact form; `astro dev` doesn't serve Pages
Functions, so submissions 404 there.

## Deploy

The Cloudflare Pages project `simonrook` is connected to this repository with
automatic deployments from `main`, so **pushing to `main` deploys**. There is no
manual step, and `npx wrangler pages deploy dist` is only a fallback for
publishing a local build.

Production configuration lives in the Pages dashboard under Settings →
Variables, not in this repo:

| Type | Name |
| --- | --- |
| Text | `PUBLIC_TURNSTILE_SITE_KEY` — read at build time; changing it needs a redeploy |
| Text | `CLOUDFLARE_ACCOUNT_ID` |
| Secret | `CLOUDFLARE_API_TOKEN` — Email Sending: Edit scope |
| Secret | `TURNSTILE_SECRET_KEY` |

`EMAIL_FROM_CONTACT` and `CONTACT_TO_EMAIL` are optional; the defaults compiled
into the Function already match the live addresses. Preview deployments keep a
separate set of variables — they need their own copies to run the form.

## Debugging in VS Code

Run & Debug → **Launch Astro dev in Firefox**. The `dev server` task in
[.vscode/tasks.json](.vscode/tasks.json) starts `npm run dev` first and waits
for Astro's "watching for file changes" line, then
[.vscode/launch.json](.vscode/launch.json) opens Firefox at
`http://localhost:4321` with the debugger attached — breakpoints in client
`<script>` blocks and source-mapped CSS both work.

Requires the `firefox-devtools.vscode-firefox-debug` extension (recommended in
[.vscode/extensions.json](.vscode/extensions.json)).

The launch URL is hardcoded to port 4321, so `astro.config.mjs` sets
`vite.server.strictPort` — a busy port fails loudly rather than silently
starting on 4322, where the debugger would attach to nothing. If you'd rather
have the fallback, drop the `vite` block and stop the stale process instead.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Author positioning, featured book, reader promises |
| `/books/` | Catalogue — one card per title |
| `/books/<slug>/` | Book detail: description, promises, contents, reader note, buy link |
| `/about/` | Who Simon Rook is, how the books are written, what they won't do |
| `/contact/` | Contact form for reader mail, press, and rights |
| `/privacy-policy/` | Accurate description of what the site does and doesn't collect |
| `/404` | Not found |

Sitemap and `robots.txt` are generated/served automatically.

One server-side route, `POST /api/contact`
([functions/api/contact.ts](functions/api/contact.ts)), backs the contact form —
it verifies Turnstile and sends mail through the Cloudflare Email Sending REST
API. Everything else is static. See [AGENTS.md](AGENTS.md) for the integration
details worth knowing before touching it.

## Design

The palette and typography are taken from the cover of *The Stoic Mind for
Overthinkers* so the site and the book read as one object:

| Token | Value | Role |
| --- | --- | --- |
| `--night` | `#0a1120` | Page field |
| `--surface` | `#131d30` | Panels, cards |
| `--bronze` | `#c08b4f` | Accent, rules, primary button |
| `--bone-1` | `#f2ece1` | Primary text |
| `--marble` | `#d8d2c6` | Statue-tone neutral |

Type: **Oswald** (condensed sans) for display, echoing the cover title;
**Source Serif 4** for reading copy, echoing the cover subtitle; **Inter** for
UI chrome (nav, buttons, labels). All three load from Google Fonts.

All tokens and component rules are in
[public/universal.css](public/universal.css). There is no CSS framework and no
build step for styles.

## Content status

Everything below is a real, verified value except where marked.

Verified against the book project on disk:

- Title, subtitle, publication date (August 14, 2026), ASIN `B0HF5K9Q2L`,
  format, and Amazon URL — from the vault note and KDP listing.
- Chapter titles and part structure — from `Manuscript/MANUSCRIPT.md`.
- Word count "about 33,000" — measured from the manuscript (33,217).
- The Part V description (three weeks, ~15 minutes a day) — from the
  manuscript's Part V introduction.
- The reader note — quoted verbatim from the manuscript.
- Reader promises on the home and book pages — from
  `Planning/BOOK_OUTLINE.md`'s reader promise section.

Live and verified:

- `hello@simonrook.com` receives mail, and `contact@simonrook.com` is a verified
  Email Sending sender. Neither address is published on the site — the contact
  form is the only route, and the address surfaces only as a fallback when no
  Turnstile key is configured.
- Turnstile widget `simonrook-contact-form`, and all four production variables,
  are set in the Pages dashboard.
- Google Analytics 4 (`GA_MEASUREMENT_ID` in
  [src/config/site.ts](src/config/site.ts)) is live in production builds only,
  and behind an opt-in consent banner — the tag isn't fetched until a visitor
  accepts.

**PLACEHOLDER — needs a real value before launch:**

- `SOCIALS` in [src/config/site.ts](src/config/site.ts): X, Facebook, Instagram,
  and TikTok are live. The Amazon entry points at the featured book, not an
  author page. Goodreads and BookBub are still `href: null` and render nothing
  until a URL is filled in — the entries are slots, not claims that the profiles
  exist.
- `public/favicon.png` is a generated bronze-on-navy `SR` monogram — a
  legible stand-in, not a designed mark. `public/og.png` is composited from the
  book cover. Both were generated with Pillow and can be replaced with real
  brand assets at any time.

## Project context

This repository is public and contains only the website. Author, editorial, and
publishing context lives in a private Obsidian vault at
`C:\Users\JD\Vault\Projects\Simon Rook\` — see
[AGENTS.md](AGENTS.md) for what's there and when to consult it.

## Possible next steps

Not built, deliberately — the current scope is a lean author landing site.

- **Email list.** No signup exists and the privacy policy says so. Adding one
  (Kit/ConvertKit embed, or a Cloudflare D1 handler like HiddenLodgeWebsite
  uses) means updating the privacy policy in the same change.
- **Rate limiting.** `/api/contact` has Turnstile and a honeypot but no request
  cap. A Cloudflare WAF rate-limiting rule would close that if abuse appears.
- **Geo-gating the consent banner.** Everyone sees it today, which costs some
  analytics coverage outside the EU/UK where it isn't required. A small Pages
  Function reporting `request.cf.country` could show it only where it's needed.
- **Self-hosted fonts.** Google Fonts discloses visitor IPs to Google, which
  the privacy policy currently has to disclose. Downloading the three families
  into `public/fonts/` would remove that dependency and the disclosure.
- **A second title.** Append a `Book` to [src/data/books.ts](src/data/books.ts)
  and drop its cover in `src/assets/`. The routes, cards, and sitemap follow
  automatically.
