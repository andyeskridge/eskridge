import clsx from "clsx";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: "category" | "tag";
  color?: string;
  href?: string;
}

export function Badge({
  children,
  variant = "tag",
  color,
  href,
  className,
  ...props
}: BadgeProps) {
  const baseClasses = clsx(
    "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs",
    variant === "category"
      ? "border border-current"
      : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    className,
  );

  const style = color
    ? {
        color: variant === "category" ? color : undefined,
        backgroundColor: variant === "tag" ? `${color}20` : undefined,
        borderColor: variant === "category" ? color : undefined,
      }
    : undefined;

  if (href) {
    return (
      <Link
        className={clsx(
          baseClasses,
          "transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700",
        )}
        href={href}
        style={style}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <span className={baseClasses} style={style} {...props}>
      {children}
    </span>
  );
}
