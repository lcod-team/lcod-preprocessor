import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'import.meta.vitest': 'undefined'
	},
	test: {
		include: ['src/lib/lcod-preprocessor.mjs']
	}
});
