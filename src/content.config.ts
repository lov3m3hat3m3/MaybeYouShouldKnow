import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const items = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/items' }),
  schema: z.object({
    slug: z.string(),
    prompt: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    forBeginners: z.boolean().default(false),
    related: z.array(z.string()).default([]),
    created: z.date(),
    updated: z.date(),
  }),
});

const literatures = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/literatures' }), // Scans subfolders like /vi/ and /en/ automatically
  schema: z.object({
    slug: z.string(),
    dirname: z.string(),
    title: z.string(),
    author: z.array(z.string()),
    authorOther: z.string().optional(),
    publishedYear: z.number(),
    translator: z.string().optional(),
    tags: z.array(z.string()).optional(),
    created: z.coerce.date(),
    updated: z.coerce.date(),
    // Read the type block directly from Sveltia frontmatter
    structure: z.discriminatedUnion('type', [
      z.object({ type: z.literal('single_chapter') }),
      z.object({
        type: z.literal('multi_chapter'),
        bookId: z.string(),
        chapterNumber: z.number(),
        chapterTitle: z.string().optional(),
      })
    ]).optional() // Optional so old files don't crash the build phase
  }).transform((data) => {
    // If there is no structure property (old files), assume it's a single chapter book
    const isMulti = data.structure?.type === 'multi_chapter';
    const multiData = isMulti ? (data.structure as any) : null;

    return {
      ...data,
      // Create uniform root properties for your Astro pages to consume
      hasChapters: isMulti,
      bookId: isMulti ? multiData.bookId : data.slug,
      chapterNumber: isMulti ? multiData.chapterNumber : 1,
      chapterTitle: isMulti ? multiData.chapterTitle : undefined,
    };
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    year: z.number(),
    displayDate: z.string(),
    country: z.string(),
    location: z.string(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    created: z.coerce.date(),
    updated: z.coerce.date(),
  }),
});

export const collections = { items, literatures, events };
