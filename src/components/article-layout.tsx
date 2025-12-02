"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useContext } from "react";
import { AppContext } from "@/app/providers";
import { Container } from "@/components/container";
import { Prose } from "@/components/prose";
import { formatDate } from "@/lib/format-date";

import type { PostPartsFragment } from "@/tina/__generated__/types";

import { Badge } from "./badge";
import { ArrowLeftIcon } from "./icons";

export function ArticleLayout({
  article,
  children,
  isRssFeed = false,
}: {
  article: PostPartsFragment;
  children: ReactNode;
  isRssFeed: boolean;
}) {
  const router = useRouter();
  const { previousPathname } = useContext(AppContext);
  const shouldShowCategory = Boolean(
    article.category?.slug && article.category?.name
  );

  if (isRssFeed) {
    return children;
  }

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          {previousPathname ? (
            <button
              aria-label="Go back to articles"
              className="group lg:-left-5 lg:-mt-2 xl:-top-1.5 mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition lg:absolute lg:mb-0 xl:left-0 xl:mt-0 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
              onClick={() => router.back()}
              type="button"
            >
              <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
            </button>
          ) : null}
          <article>
            <header className="flex flex-col">
              <h1 className="mt-6 font-bold text-4xl text-zinc-800 tracking-tight sm:text-5xl dark:text-zinc-100">
                {article.title}
              </h1>
              <time
                className="order-first flex items-center text-base text-zinc-400 dark:text-zinc-500"
                dateTime={article.date}
              >
                <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                <span className="ml-3">{formatDate(article.date)}</span>
              </time>

              {/* Tags and Categories */}
              <div className="mt-4 flex flex-wrap gap-2">
                {shouldShowCategory ? (
                  <Badge
                    color={article.category?.color ?? undefined}
                    href={`/categories/${article.category?.slug}`}
                    variant="category"
                  >
                    {article.category?.name}
                  </Badge>
                ) : null}
                {article.tags?.map((tagItem) => (
                  <Badge
                    color={tagItem?.tag?.color ?? undefined}
                    href={`/tags/${tagItem?.tag?.slug}`}
                    key={tagItem?.tag?.slug}
                    variant="tag"
                  >
                    {tagItem?.tag?.name}
                  </Badge>
                ))}
              </div>
            </header>
            <Prose className="mt-8" data-mdx-content>
              {children}
            </Prose>
          </article>
        </div>
      </div>
    </Container>
  );
}
