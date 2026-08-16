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
- Deploy target: Cloudflare Pages via `wrangler.toml`
  (`npx wrangler pages deploy dist`).

## Structure

- `src/pages/` — routes. `index.astro`, `books/index.astro`,
  `books/[slug].astro` (one page per book via `getStaticPaths`), `about.astro`,
  `contact.astro`, `privacy-policy.astro`, `404.astro`.
- `src/components/` — `SiteHeader.astro`, `SiteFooter.astro`, `BookCard.astro`.
- `src/layouts/Layout.astro` — shared page shell (meta, OG, JSON-LD slot).
- `src/config/site.ts` — single source of truth for site URL, name, tagline,
  contact address, and `SOCIALS`. Entries with `href: null` are auto-hidden by
  the header/footer/Contact page — don't special-case missing links elsewhere,
  just fill in the `href`.
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

## Conventions

- Keep the site static — no server runtime, no API routes, no client-side data
  fetching. Content changes go through `src/config/site.ts` / `src/data/books.ts`,
  not component-level hardcoding.
- Placeholder values are flagged inline with a `PLACEHOLDER:` comment (contact
  address, social profiles). Don't quietly invent real-looking replacements —
  either leave the placeholder or ask.
- `astro.config.mjs` `site`, `src/config/site.ts` `SITE_URL`, and
  `public/robots.txt`'s `Sitemap:` line must all point at the same domain
  (`simonrook.com`) — nothing else in the codebase hardcodes it.
- Retailer links are plain links. If affiliate tagging is ever added, the
  privacy policy and any applicable disclosure requirements must be updated in
  the same change — it currently states outright that no affiliate tracking is
  used.
- The privacy policy describes actual behavior. Adding analytics, a newsletter,
  embeds, or third-party scripts means updating
  `src/pages/privacy-policy.astro` and its `lastUpdated` date in the same
  change.
