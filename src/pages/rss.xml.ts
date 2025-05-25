import rss from "@astrojs/rss";
import { getCollection, type CollectionEntry } from "astro:content";
import MarkdownIt from "markdown-it";
const parser = new MarkdownIt();

export async function GET({ site }: { site: string }) {
  const blog = await getCollection("blog", (blog: CollectionEntry<"blog">) => {
    return blog.data.draft === false;
  });

  return rss({
    title: "zeu.dev",
    description: "",
    site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      content: parser.render(post.body),
    })),
  });
}
