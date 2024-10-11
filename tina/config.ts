import { defineConfig } from 'tinacms'

import Post from './collection/post'

// Your hosting provider likely exposes this as an environment variable
const branch = 'main'

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID, // Get this from tina.io
  token: process.env.TINA_TOKEN, // Get this from tina.io
  admin: {
    authHooks: {
      onLogin: async ({ token }: { token: { id_token: string } }) => {
        console.log('Welcome back!')
        location.href =
          `/api/preview/enter?token=${token.id_token}&slug=` +
          location?.pathname
      },
      onLogout: async () => {
        console.log('onLogout')
        location.href = `/api/preview/exit?slug=` + location?.pathname
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
    collections: [Post],
  },
})
