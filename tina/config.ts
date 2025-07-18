import { defineConfig } from 'tinacms';

import Category from './collection/category';
import Post from './collection/post';
import Tag from './collection/tag';

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.GITHUB_BRANCH || process.env.HEAD || 'main';

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID, // Get this from tina.io
  token: process.env.TINA_TOKEN, // Get this from tina.io
  admin: {
    authHooks: {
      // biome-ignore lint/suspicious/useAwait: async function doesn't need await for this use case
      onLogin: async ({ token }: { token: { id_token: string } }) => {
        location.href = `/api/preview/enter?token=${token.id_token}&slug=${location?.pathname}`;
      },
      // biome-ignore lint/suspicious/useAwait: async function doesn't need await for this use case
      onLogout: async () => {
        location.href = `/api/preview/exit?slug=${location?.pathname}`;
      },
    },
  },
  ...(process.env.NODE_ENV === 'production'
    ? {
        search: {
          tina: {
            indexerToken: process.env.TINA_INDEXER_TOKEN,
          },
        },
      }
    : {}),
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: '',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [Category, Tag, Post],
  },
});
