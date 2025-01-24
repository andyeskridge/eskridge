import clsx from 'clsx';
import Link from 'next/link';
import type { ButtonHTMLAttributes } from 'react';

const variantStyles = {
  primary:
    'bg-zinc-800 font-semibold text-zinc-100 hover:bg-zinc-700 active:bg-zinc-800 active:text-zinc-100/70 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:active:bg-zinc-700 dark:active:text-zinc-100/70',
  secondary:
    'bg-zinc-50 font-medium text-zinc-900 hover:bg-zinc-100 active:bg-zinc-100 active:text-zinc-900/60 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:active:bg-zinc-800/50 dark:active:text-zinc-50/70',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  href?: string;
  target?: string;
};

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  href,
  target,
  ...props
}: ButtonProps) {
  className = clsx(
    'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm outline-offset-2 transition active:transition-none',
    variantStyles[variant],
    className
  );

  if (href) {
    return (
      <Link className={className} href={href}>
        {props.children}
      </Link>
    );
  }

  return <button className={className} type={type} {...props} />;
}
