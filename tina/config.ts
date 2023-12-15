import { defineConfig } from 'tinacms'
import { TokenObject } from 'tinacms/dist/auth/authenticate'

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.CF_PAGES_BRANCH ||
  process.env.HEAD ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  'main'

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID, // Get this from tina.io
  token: process.env.TINA_TOKEN, // Get this from tina.io
  admin: {
    authHooks: {
      onLogin: async ({ token }: { token: TokenObject }) => {
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
  search: {
    tina: {
      indexerToken: process.env.TINA_INDEXER_TOKEN,
    },
  },
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
    collections: [
      {
        name: 'post',
        label: 'Posts',
        path: 'content/posts',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Date',
            description: 'Date of publish',
            required: true,
          },
          {
            name: 'draft',
            label: 'Draft',
            type: 'boolean',
            required: true,
            description: 'If this is checked the post will not be published',
          },
          {
            name: 'description',
            label: 'Description',
            type: 'string',
            required: true,
            description: 'Description of the post',
          },
        ],
        ui: {
          // This is an DEMO router. You can remove this to fit your site
          router: ({ document }) => `/articles/${document._sys.filename}`,
        },
      },
    ],
  },
})
