import { defineConfig } from 'astro/config';

import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@astrojs/netlify";
import og from "astro-og";
import authproto from "@fujocoded/authproto";

// https://astro.build/config
export default defineConfig({
  integrations: [
    svelte(),
    mdx(),
    icon(), 
    og(),
    authproto({
      "applicationName": "Zeu's Personal Site",
      "applicationDomain": "https://zeu.dev",
      scopes: [
        "repo:place.stream.chat.message?action=create"
      ]
    })
  ],
  server: { host: true },
  output: "server",
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()], 
  },
  site: "https://zeu.dev"
});
