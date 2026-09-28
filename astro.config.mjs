// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import { execFileSync } from 'node:child_process';

/**
 * Sitemap `lastmod` from git: the newest commit touching a page's source files.
 *
 * That needs full history. Cloudflare Pages builds from a shallow clone, so
 * when the checkout is shallow the build fetches the rest first (the repo is
 * small; this takes seconds). If that fails too, lastmod is left out entirely —
 * a shallow history would stamp every page with the same latest commit, which
 * is worse than no date. No git at all also means no lastmod.
 */
function git(args, timeout = 10_000) {
	try {
		return execFileSync('git', args, {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
			timeout,
		}).trim();
	} catch {
		return '';
	}
}
// 'true' | 'false' | '' (not a git checkout, or git missing)
const shallowState = () => git(['rev-parse', '--is-shallow-repository']);
if (shallowState() === 'true') git(['fetch', '--unshallow', '--quiet'], 60_000);
const canDateFromGit = shallowState() === 'false';
function lastCommitDate(...files) {
	const iso = git(['log', '-1', '--format=%cI', '--', ...files]);
	return iso ? new Date(iso).toISOString() : undefined;
}

// Pathname → the source files its content comes from. Unlisted pages get no lastmod.
const BOOK_DATA = 'src/data/books.ts';
const PAGE_SOURCES = {
	'/': ['src/pages/index.astro', BOOK_DATA],
	'/about/': ['src/pages/about.astro'],
	'/books/': ['src/pages/books/index.astro', BOOK_DATA],
	'/contact/': ['src/pages/contact.astro'],
	'/privacy-policy/': ['src/pages/privacy-policy.astro'],
};
function sourcesFor(pathname) {
	if (PAGE_SOURCES[pathname]) return PAGE_SOURCES[pathname];
	if (pathname.startsWith('/books/')) return ['src/pages/books/[slug].astro', BOOK_DATA];
	return undefined;
}

// https://astro.build/config
export default defineConfig({
	site: 'https://simonrook.com',
	server: {
		host: true,
		port: 4321,
	},
	vite: {
		// The VS Code launch config (.vscode/launch.json) attaches Firefox to a
		// hardcoded http://localhost:4321. Without strictPort, Astro quietly falls
		// back to 4322+ when 4321 is busy and the debugger attaches to nothing —
		// fail loudly instead so the real problem is visible. `strictPort` is a
		// Vite option; it has no effect under Astro's own `server` block.
		server: { strictPort: true },
	},
	integrations: [
		icon(),
		sitemap({
			serialize(item) {
				const files = canDateFromGit ? sourcesFor(new URL(item.url).pathname) : undefined;
				const lastmod = files && lastCommitDate(...files);
				return lastmod ? { ...item, lastmod } : item;
			},
		}),
	],
});
