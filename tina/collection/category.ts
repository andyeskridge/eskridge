import type { Collection } from "tinacms";

const Category: Collection = {
  name: "category",
  label: "Categories",
  path: "content/categories",
  fields: [
    {
      type: "string",
      name: "name",
      label: "Name",
      isTitle: true,
      required: true,
    },
    {
      type: "string",
      name: "slug",
      label: "Slug",
      required: true,
      description: "URL-friendly version of the name",
    },
    {
      type: "string",
      name: "description",
      label: "Description",
      description: "Brief description of the category",
    },
    {
      type: "string",
      name: "color",
      label: "Color",
      description: "Hex color code for the category badge",
      required: false,
      ui: {
        component: "color",
      },
    },
  ],
  ui: {
    router: ({ document }) =>
      `/categories/${document._sys.breadcrumbs.join("/")}`,
    filename: {
      readonly: false,
      slugify: (values) =>
        values?.slug || values?.name?.toLowerCase().replace(/\s+/g, "-"),
    },
  },
};

export default Category;
