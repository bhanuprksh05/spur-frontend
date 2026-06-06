import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: '0.0.0.0',  // bind to all interfaces (accessible on LAN)
		port: 5173        // dev server port (npm run dev)
	},
	preview: {
		host: '0.0.0.0',  // bind to all interfaces (accessible on LAN)
		port: 10000       // preview server port (npm run preview)
	}
});
