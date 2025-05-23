import clsx from 'clsx';
import Link from 'next/link';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { Badge } from './badge';
import { ChevronRightIcon } from './icons';
import type { Post } from '@/tina/__generated__/types';

export function Card<T extends ElementType = 'div'>({
  as,
  className,
  children,
}: Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'> & {
  as?: T;
  className?: string;
}) {
  const Component = as ?? 'div';

  return (
    <Component
      className={clsx(className, 'group relative flex flex-col items-start')}
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

Card.Title = function CardTitle<T extends ElementType = 'h2'>({
  as,
  href,
  children,
}: Omit<ComponentPropsWithoutRef<T>, 'as' | 'href'> & {
  as?: T;
  href?: string;
}) {
  const Component = as ?? 'h2';

  return (
    <Component className="font-semibold text-base text-zinc-800 tracking-tight dark:text-zinc-100">
      {href ? <Card.Link href={href}>{children}</Card.Link> : children}
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

Card.Eyebrow = function CardEyebrow<T extends ElementType = 'p'>({
  as,
  decorate = false,
  className,
  children,
  ...props
}: Omit<ComponentPropsWithoutRef<T>, 'as' | 'decorate'> & {
  as?: T;
  decorate?: boolean;
}) {
  const Component = as ?? 'p';

  return (
    <Component
      className={clsx(
        className,
        'relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500',
        decorate && 'pl-3.5'
      )}
      {...props}
    >
      {decorate && (
        <span
          className="absolute inset-y-0 left-0 flex items-center"
          aria-hidden="true"
        >
          <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
        </span>
      )}
      {children}
    </Component>
  );
};

Card.Meta = function CardMeta({
  category,
  tags,
}: {
  category?: Post['category'] | null;
  tags?: Post['tags'];
}) {
  if (!category && (!tags || tags.length === 0)) {
    return null;
  }

  return (
    <div className="relative z-10 mt-2 flex flex-wrap items-center gap-2">
      {category?.name && category?.slug && (
        <Badge
          variant="category"
          color={category.color ?? undefined}
          href={`/categories/${category.slug}`}
        >
          {category.name}
        </Badge>
      )}
      {tags
        ?.filter((tagObj) => tagObj?.tag?.name && tagObj?.tag?.slug)
        .map((tagObj, index) => {
          // Safely access tag properties with optional chaining
          const name = tagObj?.tag?.name;
          const slug = tagObj?.tag?.slug;
          const color = tagObj?.tag?.color;
          
          if (!name || !slug) {
            return null;
          }
          
          return (
            <Badge
              key={index}
              variant="tag"
              color={color || undefined}
              href={`/tags/${slug}`}
            >
              {name}
            </Badge>
          );
        })}
    </div>
  );
};
