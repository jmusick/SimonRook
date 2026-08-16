import pkg from "../../package.json";
import { FEATURED_BOOK, primaryRetailer } from "../data/books";

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

/**
 * Google Analytics 4 measurement ID.
 *
 * Set to null to remove analytics from the site entirely — Layout.astro emits
 * nothing when it's unset. The tag is also skipped in `astro dev` so local
 * page views don't land in the property; see Layout.astro.
 *
 * This is third-party tracking, so src/pages/privacy-policy.astro describes it.
 * Changing or removing it means updating that page in the same commit.
 */
export const GA_MEASUREMENT_ID: string | null = "G-44NBWJRNW2";

/**
 * The ID actually handed to the loader. Null in `astro dev` so local page views
 * never reach the property — the consent banner still renders there so it can be
 * worked on, it just has nothing to load when accepted.
 */
export const ANALYTICS_ID: string | null = import.meta.env.PROD ? GA_MEASUREMENT_ID : null;

/**
 * Cloudflare Turnstile site key for the contact form.
 *
 * Committed rather than build-variable-only, deliberately. It is public by
 * definition — it ships in the page HTML — so there is nothing to protect, and
 * relying on a build-time environment variable proved fragile: the first
 * production deploy silently rendered no form because the Pages build container
 * didn't see it. A committed default cannot fail that way.
 *
 * PUBLIC_TURNSTILE_SITE_KEY still overrides it, so another deployment can point
 * at a different widget without a code change. The matching *secret* is a Pages
 * secret and must never appear here.
 */
export const TURNSTILE_SITE_KEY: string =
	import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAAER2-SZgdP9MmAij";

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
 * Order is deliberate and shared by every surface that renders these: the links
 * that lead to a book come first, then social by where posting actually happens,
 * then the rest. The row is icon-only, so attention falls off fast after the
 * first few — put a dead account last rather than in an early slot.
 *
 * PLACEHOLDER: the Goodreads and BookBub slots are listed so they're ready, not
 * because those profiles have been claimed. Claim the handles before filling
 * these in. There is no Amazon *author* page link yet either — the Amazon entry
 * below points at the featured book instead (see its comment).
 */
export interface SocialLink {
	label: string;
	href: string | null;
	icon: string;
	/**
	 * Whether this URL is a page *about the author*, and so belongs in the
	 * homepage Person JSON-LD's `sameAs`. Defaults to true; set false for links
	 * that are about a book instead. Doesn't affect rendering — the icon shows
	 * either way.
	 */
	isProfile?: boolean;
}

export const SOCIALS: SocialLink[] = [
	/**
	 * Derived from the featured book's primary retailer rather than hardcoded, so
	 * this can't drift from src/data/books.ts. Note this is a book product page,
	 * not an Amazon author page — swap in the author page once one exists, which
	 * is also when this should stop reading from the book data.
	 */
	{
		label: `${FEATURED_BOOK.title} on Amazon`,
		href: primaryRetailer(FEATURED_BOOK)?.href ?? null,
		icon: "simple-icons:amazon",
		isProfile: false,
	},
	{ label: "Goodreads", href: null, icon: "simple-icons:goodreads" },
	{
		label: "Instagram",
		href: "https://www.instagram.com/simonrookauthor/",
		icon: "simple-icons:instagram",
	},
	{
		label: "TikTok",
		href: "https://www.tiktok.com/@simon.rook3",
		icon: "simple-icons:tiktok",
	},
	{
		label: "Facebook",
		href: "https://www.facebook.com/people/Simon-Rook/61593557754535/",
		icon: "simple-icons:facebook",
	},
	{ label: "X", href: "https://x.com/SimonRookAuthor", icon: "simple-icons:x" },
	{ label: "BookBub", href: null, icon: "simple-icons:bookbub" },
];

export const ACTIVE_SOCIALS = SOCIALS.filter(
	(s): s is SocialLink & { href: string } => s.href !== null,
);

/** The subset of ACTIVE_SOCIALS valid as schema.org `Person.sameAs`. */
export const PROFILE_URLS = ACTIVE_SOCIALS.filter((s) => s.isProfile !== false).map(
	(s) => s.href,
);

/**
 * The inbox contact-form mail is delivered to.
 *
 * No longer published on the site: the Contact page routes everything through
 * the form, and shows this address only as a fallback when the form can't be
 * rendered (no Turnstile key configured). Keep it in step with CONTACT_TO_EMAIL
 * in the Function's environment — that's what actually addresses the mail.
 *
 * PLACEHOLDER: set up this mailbox (or an alias/forwarder) on the simonrook.com
 * domain before launch. It must be an address on this domain — don't substitute
 * one from elsewhere. See the vault notes referenced in AGENTS.md.
 */
export const CONTACT_EMAIL = "hello@simonrook.com";
