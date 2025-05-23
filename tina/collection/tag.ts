import type { Collection } from 'tinacms';

const Tag: Collection = {
  name: 'tag',
  label: 'Tags',
  path: 'content/tags',
  fields: [
    {
      type: 'string',
      name: 'name',
      label: 'Name',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      name: 'slug',
      label: 'Slug',
      required: true,
      description: 'URL-friendly version of the name',
    },
    {
      type: 'string',
      name: 'description',
      label: 'Description',
      description: 'Brief description of the tag',
    },
    {
      type: 'string',
      name: 'color',
      label: 'Color',
      description: 'Hex color code for the tag badge',
      ui: {
        component: 'color',
      },
    },
  ],
  ui: {
    router: ({ document }) => `/tags/${document._sys.breadcrumbs.join('/')}`,
    filename: {
      readonly: false,
      slugify: (values) => {
        return values?.slug || values?.name?.toLowerCase().replace(/\s+/g, '-');
      },
    },
  },
};

export default Tag;
