// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

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
	integrations: [icon(), sitemap()],
});
