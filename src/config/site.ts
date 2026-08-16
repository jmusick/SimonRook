import pkg from "../../package.json";

/** Sourced from package.json — bump the version there (and tag the release to match) to update this everywhere. */
export const SITE_VERSION: string = pkg.version;

/**
 * Single source of truth for the public origin. `site` in astro.config.mjs and
 * the `Sitemap:` line in public/robots.txt must match this — nothing else in
 * the codebase hardcodes a URL.
 */
export const SITE_URL = "https://simonrook.com";
export const SITE_NAME = "Simon Rook";
export const SITE_ROLE = "Author";
export const SITE_TAGLINE = "Practical philosophy for people who think too much.";

export const SITE_DESCRIPTION =
	"Simon Rook writes practical philosophy for thoughtful people who overthink. " +
	"Author of The Stoic Mind for Overthinkers.";

/**
 * Social, retailer, and reader-platform profiles.
 *
 * Entries with `href: null` are skipped everywhere (header, footer, About), so
 * the site renders clean today and lights up the moment a URL is pasted in.
 * Don't special-case a missing link elsewhere — just fill in the `href`.
 *
 * PLACEHOLDER: only the Amazon author page is likely to exist today. Goodreads,
 * BookBub, and Instagram are listed so the slots are ready, not because
 * profiles have been claimed. Claim the handles before filling these in.
 */
export interface SocialLink {
	label: string;
	href: string | null;
	icon: string;
}

export const SOCIALS: SocialLink[] = [
	{ label: "Amazon author page", href: null, icon: "simple-icons:amazon" },
	{ label: "Goodreads", href: null, icon: "simple-icons:goodreads" },
	{ label: "BookBub", href: null, icon: "simple-icons:bookbub" },
	{ label: "Instagram", href: null, icon: "simple-icons:instagram" },
];

export const ACTIVE_SOCIALS = SOCIALS.filter(
	(s): s is SocialLink & { href: string } => s.href !== null,
);

/**
 * Contact address shown on the Contact page.
 *
 * PLACEHOLDER: set up this mailbox (or an alias/forwarder) on the simonrook.com
 * domain before launch. It must be an address on this domain — don't substitute
 * one from elsewhere. See the vault notes referenced in AGENTS.md.
 */
export const CONTACT_EMAIL = "hello@simonrook.com";
