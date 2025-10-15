import type { Collection } from "tinacms";

const Post: Collection = {
  name: "post",
  label: "Posts",
  path: "content/posts",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
    },
    {
      type: "datetime",
      name: "date",
      label: "Date",
      description: "Date of publish",
      required: true,
    },
    {
      name: "draft",
      label: "Draft",
      type: "boolean",
      required: true,
      description: "If this is checked the post will not be published",
    },
    {
      name: "description",
      label: "Description",
      type: "string",
      required: true,
      description: "Description of the post",
    },
    {
      name: "category",
      label: "Category",
      type: "reference",
      collections: ["category"],
      description: "Select a category for this post",
    },
    {
      name: "tags",
      label: "Tags",
      type: "object",
      list: true,
      fields: [
        {
          name: "tag",
          label: "Tag",
          type: "reference",
          collections: ["tag"],
        },
      ],
      description: "Select tags for this post",
    },
  ],
  ui: {
    router: ({ document }) =>
      `/articles/${document._sys.breadcrumbs.join("/")}`,
  },
};

export default Post;
