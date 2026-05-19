import { glob } from "astro/loaders";
import { z, defineCollection } from "astro:content";

const blog_collection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    draft: z.boolean(),
    link: z.string().optional()
  }),
  loader: glob({
    pattern: "*.md",
    base: "./src/content/blog"
  })
});

const about_collection = defineCollection({
  schema: z.object({
    updated_at: z.string(),
    draft: z.boolean()
  }),
  loader: glob({
    pattern: "*.mdx",
    base: "./src/content/about"
  })
});

export const collections = {
  blog: blog_collection,
  about: about_collection
}
