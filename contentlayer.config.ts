import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const Article = defineDocumentType(() => ({
  name: 'Article',
  filePathPattern: `**/*.md`,
  fields: {
    title: {
      type: 'string',
      description: 'The title of the article',
      required: true,
    },
    date: {
      type: 'date',
      description: 'The date of the article',
      required: true,
    },
    author: {
      type: 'string',
      description: 'The author of the article',
      required: true,
    },
    description: {
      type: 'string',
      description: 'The description of the article',
      required: true,
    },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (article) => `/articles/${article._raw.flattenedPath}`,
    },
  },
}))

export default makeSource({
  contentDirPath: 'articles',
  documentTypes: [Article],
})
