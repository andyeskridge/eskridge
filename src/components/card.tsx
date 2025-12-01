import clsx from "clsx";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { Post } from "@/tina/__generated__/types";
import { Badge } from "./badge";
import { ChevronRightIcon } from "./icons";

export function Card<T extends ElementType = "div">({
  as,
  className,
  children,
}: Omit<ComponentPropsWithoutRef<T>, "as" | "className"> & {
  as?: T;
  className?: string;
}) {
  const Component = as ?? "div";

  return (
    <Component
      className={clsx(className, "group relative flex flex-col items-start")}
    >
      {children}
    </Component>
  );
}

Card.Link = function CardLink({
  children,
  ...props
}: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <>
      <div className="-inset-x-4 -inset-y-6 sm:-inset-x-6 absolute z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:rounded-2xl dark:bg-zinc-800/50" />
      <Link {...props}>
        <span className="-inset-x-4 -inset-y-6 sm:-inset-x-6 absolute z-20 sm:rounded-2xl" />
        <span className="relative z-10">{children}</span>
      </Link>
    </>
  );
};

Card.Title = function CardTitle<T extends ElementType = "h2">({
  as,
  href,
  children,
}: Omit<ComponentPropsWithoutRef<T>, "as" | "href"> & {
  as?: T;
  href?: string;
}) {
  const Component = as ?? "h2";

  return (
    <Component className="font-semibold text-base text-zinc-800 tracking-tight dark:text-zinc-100">
      {href ? (
        <Card.Link href={href}>{children}</Card.Link>
      ) : (
        <span>{children}</span>
      )}
    </Component>
  );
};

Card.Description = function CardDescription({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
      {children}
    </p>
  );
};

Card.Cta = function CardCta({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 mt-4 flex items-center font-medium text-sm text-teal-500"
    >
      {children}
      <ChevronRightIcon className="ml-1 h-4 w-4 stroke-current" />
    </div>
  );
};

Card.Eyebrow = function CardEyebrow<T extends ElementType = "p">({
  as,
  decorate = false,
  className,
  children,
  ...props
}: Omit<ComponentPropsWithoutRef<T>, "as" | "decorate"> & {
  as?: T;
  decorate?: boolean;
}) {
  const Component = as ?? "p";

  return (
    <Component
      className={clsx(
        className,
        "relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500",
        decorate ? "pl-3.5" : null
      )}
      {...props}
    >
      {decorate ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 flex items-center"
        >
          <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
        </span>
      ) : null}
      {children}
    </Component>
  );
};

Card.Meta = function CardMeta({
  category,
  tags,
}: {
  category?: Post["category"] | null;
  tags?: Post["tags"];
}) {
  const hasCategory = Boolean(category?.name) && Boolean(category?.slug);
  const safeCategory = category && hasCategory ? category : null;
  const showCategory = Boolean(safeCategory);

  if (!safeCategory && (!tags || tags.length === 0)) {
    return null;
  }

  const categoryBadge = safeCategory ? (
    <Badge
      color={safeCategory.color ?? undefined}
      href={`/categories/${safeCategory.slug}`}
      variant="category"
    >
      {safeCategory.name}
    </Badge>
  ) : null;

  return (
    <div className="relative z-10 mt-2 flex flex-wrap items-center gap-2">
      {showCategory ? categoryBadge : null}
      {tags
        ?.filter(
          (tagObj) => Boolean(tagObj?.tag?.name) && Boolean(tagObj?.tag?.slug)
        )
        .map((tagObj) => {
          // Safely access tag properties with optional chaining
          const name = tagObj?.tag?.name;
          const slug = tagObj?.tag?.slug;
          const color = tagObj?.tag?.color;
          const hasTag = Boolean(name) && Boolean(slug);

          if (!hasTag) {
            return null;
          }

          return (
            <Badge
              color={color || undefined}
              href={`/tags/${slug}`}
              key={slug}
              variant="tag"
            >
              {name}
            </Badge>
          );
        })}
    </div>
  );
};
