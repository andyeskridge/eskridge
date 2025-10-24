import { Feed } from "feed";
import { createElement, type ReactNode } from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

import { getAllArticles } from "@/lib/get-all-articles";
import type { Post } from "@/tina/__generated__/types";

async function renderArticleContent(
  article: Post,
): Promise<string | undefined> {
  const children: ReactNode[] = [];

  if (article.description) {
    children.push(
      createElement("p", { key: "description" }, article.description),
    );
  }

  if (article.body) {
    children.push(
      createElement(
        "div",
        { key: "body", "data-mdx-content": true },
        createElement(TinaMarkdown, { content: article.body }),
      ),
    );
  }

  if (children.length === 0) {
    return;
  }

  const { renderToStaticMarkup } = await import("react-dom/server");
  return renderToStaticMarkup(createElement("article", null, ...children));
}

export async function GET(_req: Request) {
  const siteUrl =
    process.env.CF_PAGES_BRANCH === "main"
      ? "https://eskridge.dev"
      : (process.env.CF_PAGES_URL ?? "https://localhost:3000");
  const author = {
    name: "Andy Eskridge",
    email: "andy@eskridge.dev",
  };

  const feed = new Feed({
    title: author.name,
    description:
      "eskridge.dev is a small portfolio site written by Andy Eskridge",
    author,
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
    },
  });

  const articles = await getAllArticles();

  for (const article of articles) {
    try {
      const publicUrl = `${siteUrl}/articles/${article._sys.filename}`;
      const content =
        (await renderArticleContent(article)) ?? article.description ?? "";

      feed.addItem({
        title: article.title,
        id: publicUrl,
        link: publicUrl,
        content,
        description: article.description,
        author: [author],
        contributor: [author],
        date: new Date(article.date),
      });
    } catch (_error) {
      // Continue processing other articles even if one fails
    }
  }

  return new Response(feed.rss2(), {
    status: 200,
    headers: {
      "content-type": "application/xml",
      "cache-control": "s-maxage=31556952",
    },
  });
}
