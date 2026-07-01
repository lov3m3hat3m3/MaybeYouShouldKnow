// @ts-check
import pagefind from "astro-pagefind";
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://site.com',
  output: 'static',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js']
      }
    },
  },
  integrations: [pagefind()],
  markdown: {
    remarkRehype: {
      footnoteLabel: 'CHÚ THÍCH',
      footnoteLabelTagName: 'h1',
    }
  }
});
