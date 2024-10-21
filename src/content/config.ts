import { z, defineCollection } from "astro:content";

const blog_collection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    draft: z.boolean(),
    link: z.string().optional()
  })
});

const about_collection = defineCollection({
  schema: z.object({
    updated_at: z.string(),
    draft: z.boolean()
  })
});

export const collections = {
  blog: blog_collection,
  about: about_collection
}
