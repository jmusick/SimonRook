# Simon Rook — author site

Static marketing site for the author **Simon Rook**, built with Astro and
deployed to Cloudflare Pages. Live domain: `simonrook.com`.

Companion to the book workspace at `C:\Users\JD\Projects\Simon Rook`, which
holds the manuscripts, covers, and publishing files. This repo holds only the
website.

## Quick start

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # -> dist/
npm run preview   # serve the built output
```

Deploy:

```bash
npm run build
npx wrangler pages deploy dist
```

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
| `/contact/` | Single contact address for reader mail, press, and rights |
| `/privacy-policy/` | Accurate description of what the site does and doesn't collect |
| `/404` | Not found |

Sitemap and `robots.txt` are generated/served automatically.

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

**PLACEHOLDER — needs a real value before launch:**

- `CONTACT_EMAIL` in [src/config/site.ts](src/config/site.ts) is
  `hello@simonrook.com`. The mailbox or forwarder does not exist yet. The
  Contact page is non-functional until it does. It must be an address on the
  site's own domain — see the vault notes before substituting anything else.
- `SOCIALS` in the same file are all `href: null` (Amazon author page,
  Goodreads, BookBub, Instagram). Nothing renders for them until a URL is
  filled in. Claim the handles first; the entries are slots, not claims that
  the profiles exist.
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
- **Self-hosted fonts.** Google Fonts discloses visitor IPs to Google, which
  the privacy policy currently has to disclose. Downloading the three families
  into `public/fonts/` would remove that dependency and the disclosure.
- **A second title.** Append a `Book` to [src/data/books.ts](src/data/books.ts)
  and drop its cover in `src/assets/`. The routes, cards, and sitemap follow
  automatically.
