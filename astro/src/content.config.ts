import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { listPosts } from "./lib/posts";

const blog = defineCollection({
  loader: async () =>
    listPosts().map((post) => ({
      id: post.slug,
      title: post.title,
      date: post.date,
      publishedAt: post.publishedAt,
      description: post.description,
      permalink: post.permalink,
      labels: post.labels,
      language: post.language,
      translationStatus: post.translationStatus,
      source: post.source,
      html: post.html,
      shareImage: post.shareImage,
    })),
  schema: z.object({
    title: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    publishedAt: z.date(),
    description: z.string().nullable(),
    permalink: z.string().regex(/^\/posts\/.+\/$/),
    labels: z.array(z.string()),
    language: z.literal("zh-CN"),
    translationStatus: z.enum(["original", "translated"]),
    source: z.string(),
    html: z.string(),
    shareImage: z.string().nullable(),
  }),
});

export const collections = { blog };
