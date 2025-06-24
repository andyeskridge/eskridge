import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';

const articles = defineCollection({
  name: 'articles',
  directory: 'content/articles',
  include: '**/*.md',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
  }),
});

export default defineConfig({
  collections: [articles],
});
