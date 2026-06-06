import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 5173  // dev server port (npm run dev)
	},
	preview: {
		port: 10000  // preview server port (npm run preview) — change this to whatever you want
	}
});
