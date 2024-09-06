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

export const collections = {
  blog: blog_collection
}
