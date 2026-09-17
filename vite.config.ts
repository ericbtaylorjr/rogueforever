import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves project sites from /<repo>/ — set VITE_BASE in the
// deploy workflow (or here) to the repo name once it's known.
// e.g. base: '/rogue-compendium/'
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
});
