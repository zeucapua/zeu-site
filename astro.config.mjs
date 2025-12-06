import { defineConfig } from 'astro/config';

import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

import netlify from "@astrojs/netlify";

import og from "astro-og";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), mdx(), icon(), og()],
  output: "static",
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()], 
  },
  site: "https://zeu.dev"
});
