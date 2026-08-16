# AGENTS.md

Guidance for AI coding agents working in this repo.

## What this is

Author site for **Simon Rook**, who writes self-help / practical philosophy
books. Astro static site, deployed to Cloudflare Pages. See
[README.md](README.md) for design background and the list of placeholder values
that still need real ones — read it before touching copy or visual styling.

## Private project context — read this first

**This is a public repository. Author, editorial, and publishing context is
deliberately kept out of it** and lives in a private Obsidian vault on the
author's machine:

```
C:\Users\JD\Vault\Projects\Simon Rook\
  Simon Rook.md                 project hub — start here
  Website.md                    conventions and constraints for this site
  <Title>\<Title>.md            per-book status and publishing details
```

Read those notes before writing or editing any author-facing copy — the About
page, bios, author metadata, or anything describing who Simon Rook is. They
carry constraints that this repo intentionally does not state. If the vault
isn't available to you, ask rather than guessing, and don't infer the missing
context from what is or isn't in this repo.

Nothing from those notes should be copied back into this repo, into commit
messages, or into published page copy.

The bio on the About page is deliberately about the *work* — method, audience,
and boundaries — rather than biography. Don't invent life details, credentials,
academic history, or personal anecdotes to fill it out. If the page feels thin,
say so rather than fabricating.

## Stack

- **Astro** (static output), TypeScript, no UI framework — components are
  `.astro` files with inline `<style>`/`<script>`.
- Styling is hand-written CSS. Design tokens live in
  [public/universal.css](public/universal.css); the palette and type pairing
  are derived from the cover art of *The Stoic Mind for Overthinkers* (deep
  navy, bronze accent, bone text; Oswald display over a Source Serif 4 reading
  face).
- Icons via `astro-icon` + `@iconify-json/simple-icons` / `lucide`.
- Deploy target: the Cloudflare Pages project **`simonrook`**, connected to
  `jmusick/SimonRook` with automatic deployments from `main`. **Pushing to
  `main` publishes** — there is no separate deploy step. `name` in
  `wrangler.toml` must match the project name exactly or Git builds break.

## Structure

- `src/pages/` — routes. `index.astro`, `books/index.astro`,
  `books/[slug].astro` (one page per book via `getStaticPaths`), `about.astro`,
  `contact.astro`, `privacy-policy.astro`, `404.astro`.
- `src/components/` — `SiteHeader.astro`, `SiteFooter.astro`, `BookCard.astro`.
- `src/layouts/Layout.astro` — shared page shell (meta, OG, JSON-LD slot, the
  Google tag).
- `src/config/site.ts` — single source of truth for site URL, name, tagline,
  `GA_MEASUREMENT_ID`, the delivery inbox, and `SOCIALS`. Entries with
  `href: null` are auto-hidden by the header/footer/Contact page — don't
  special-case missing links elsewhere, just fill in the `href`. `PROFILE_URLS`
  is the subset valid as schema.org `sameAs`; the Amazon entry sets
  `isProfile: false` because it points at a book, not the author.
- `functions/api/contact.ts` — the only server-side code. See below.
- `src/env.d.ts` — ambient types for `PUBLIC_*` env vars and `window.turnstile`.
- `src/data/books.ts` — the book catalogue. Title, subtitle, blurb,
  description, reader promises, cover, publication date, format, ASIN, part and
  chapter structure, retailer links, and the reader note all live here. Adding a
  title is a matter of appending a `Book` and dropping its cover in
  `src/assets/` — no new page files needed.

## Source of truth for book facts

Book content facts come from the book project on disk, not from invention:

```
C:\Users\JD\Projects\Simon Rook\<Title>\
  Planning\AUTHOR_BRIEF.md     audience, voice, boundaries
  Planning\BOOK_OUTLINE.md     premise, reader promise, structure
  Manuscript\MANUSCRIPT.md     canonical text, chapter titles, reader note
  Assets\Cover\                source artwork
```

Verify against those files before changing chapter titles, word counts, dates,
or the reader note. The `readerNote` field is quoted verbatim from the
manuscript — this is a health-adjacent topic, so keep the disclaimer on any
page that describes book content, and don't soften it.

## Commands

```bash
npm run dev       # astro dev, http://localhost:4321
npm run build     # astro build -> dist/
npm run preview   # serve the built output
```

No test suite or linter is configured. Verify changes with `npm run build`
and, for anything visual, `npm run dev` + a browser check.

In VS Code, Run & Debug → "Launch Astro dev in Firefox" starts the dev server
task and attaches the Firefox debugger. The launch URL is hardcoded to port
4321, which is why `astro.config.mjs` sets `vite.server.strictPort` — don't
remove it without also making the launch URL flexible, or a busy port will
silently start the server on 4322 and the debugger will attach to nothing.

## Contact form and email

The one exception to the static-only rule below. `functions/api/contact.ts` is a
Cloudflare Pages Function backing the Contact page's form; it exists because
sending mail needs an API token and a token can't ship to a browser. Mail goes
out through the **Cloudflare Email Sending REST API** (plain `fetch`, no SDK) —
the same approach as the Tagstash project, whose `AGENTS.md` documents the same
gotchas.

- `POST https://api.cloudflare.com/client/v4/accounts/{account_id}/email/sending/send`,
  `Authorization: Bearer <token>`, token scoped to `Email Sending: Edit`.
- Reply-to is the snake_case top-level field **`reply_to`**. `replyTo` 400s with
  `invalid_request_schema` and a `headers: { 'Reply-To': … }` object 400s with
  `email.invalid` — don't "correct" the casing. The form's reply-reaches-sender
  behavior depends on it.
- Check `data.success`, not just a 2xx status.
- The `from` domain must be connected and verified in the dashboard first.
- `from` stays on the verified domain; the submitter's address goes in
  `reply_to`. Putting it in `from` gets the domain flagged for spoofing.

Configuration is split across two mechanisms that are easy to confuse:

| Where | Read at | Holds | Example file |
| --- | --- | --- | --- |
| `.env` | build time, by Astro | `PUBLIC_TURNSTILE_SITE_KEY` — optional override only | `.env.example` |
| `.dev.vars` | run time, by the Function | token, account ID, addresses, Turnstile secret | `.dev.vars.example` |

Both are gitignored; the `.example` files are not. The runtime values are Pages
secrets. Missing Email Sending secrets mean the endpoint answers `503` rather
than failing silently.

The Turnstile **site key is committed** in `src/config/site.ts` as
`TURNSTILE_SITE_KEY`, not supplied by the environment. It's public — it ships in
the HTML — and depending on a build variable proved fragile: the first
production deploy rendered no form at all because the Pages build container
never saw `PUBLIC_TURNSTILE_SITE_KEY`. The env var still overrides the committed
default, but nothing breaks when it's absent. Don't revert this to
environment-only; the failure is silent and looks like a code bug.

`astro dev` always uses Cloudflare's always-passes Turnstile **test** key, even
if a real one is in `.env` — the real widget is registered to the production
hostnames and errors on `localhost`. So the form is always visible in dev, and a
production key can't be exercised locally by accident. `astro dev` doesn't serve
Functions either, so submissions 404 there; test the real endpoint with
`npm run build && npx wrangler pages dev dist`.

Other defenses on the endpoint, in case they look redundant: a honeypot field
(bots fill it; the handler returns 200 and discards, so they learn nothing),
length/format validation, CRLF stripping on anything reaching a header, and no
CORS headers at all — one form, one origin. There is deliberately no rate
limiting; add a WAF rule on `/api/contact` if abuse shows up.

## Conventions

- Keep the site static apart from `functions/` — no other server runtime, no
  further API routes, no client-side data fetching. Content changes go through
  `src/config/site.ts` / `src/data/books.ts`, not component-level hardcoding.
- Analytics is Google Analytics 4, configured by `GA_MEASUREMENT_ID` in
  `src/config/site.ts`. Setting that to `null` removes the tag and the consent
  banner site-wide. `ANALYTICS_ID` in the same file is null outside production,
  so `astro dev` traffic never reaches the property.
- Consent is **opt-in and strict**: `src/components/CookieConsent.astro` owns
  the banner and is the only thing that loads `gtag.js`, by creating the script
  element in the accept path. Nothing is requested from Google before a visitor
  agrees — don't "simplify" this by putting the tag back in `Layout.astro`'s
  head, which would disclose visitor IPs to Google before consent and defeat the
  whole mechanism. The choice is stored in `localStorage` (not a cookie);
  withdrawing it clears `_ga*` cookies and reloads. Any element with
  `data-cookie-preferences` reopens the banner — the footer uses this, and the
  privacy policy links it inline.
- Placeholder values are flagged inline with a `PLACEHOLDER:` comment (the
  Goodreads and BookBub slots). Don't quietly invent real-looking replacements —
  either leave the placeholder or ask.
- The Contact page publishes no email address: everything routes through the
  form. The address appears only as a fallback when no Turnstile key is
  configured, so the page is never a dead end. Don't reintroduce it elsewhere.
- `astro.config.mjs` `site`, `src/config/site.ts` `SITE_URL`, and
  `public/robots.txt`'s `Sitemap:` line must all point at the same domain
  (`simonrook.com`) — nothing else in the codebase hardcodes it.
- Retailer links are plain links. If affiliate tagging is ever added, the
  privacy policy and any applicable disclosure requirements must be updated in
  the same change — it currently states outright that no affiliate tracking is
  used.
- The privacy policy describes actual behavior. Adding a newsletter, embeds, or
  further third-party scripts means updating `src/pages/privacy-policy.astro`
  and its `lastUpdated` date in the same change. It currently documents Google
  Analytics, the contact form, Turnstile, Cloudflare hosting, and Google Fonts
  — keep that list true.
