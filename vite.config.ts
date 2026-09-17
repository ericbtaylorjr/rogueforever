import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Served from the wowrogue.gg custom domain root, so base stays '/'.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
});
