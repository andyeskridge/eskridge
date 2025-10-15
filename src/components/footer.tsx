import Link from "next/link";
import type { ReactNode } from "react";
import { ContainerInner, ContainerOuter } from "@/components/container";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      className="transition hover:text-teal-500 dark:hover:text-teal-400"
      href={href}
    >
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="mt-32 flex-none">
      <ContainerOuter>
        <div className="border-zinc-100 border-t pt-10 pb-16 dark:border-zinc-700/40">
          <ContainerInner>
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 font-medium text-sm text-zinc-800 dark:text-zinc-200">
                <NavLink href="/about">About</NavLink>
                <NavLink href="/articles">Articles</NavLink>
                <NavLink href="/admin/index.html">Admin</NavLink>
              </div>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                &copy; {new Date().getFullYear()} Andy Eskridge. All rights
                reserved.
              </p>
            </div>
          </ContainerInner>
        </div>
      </ContainerOuter>
    </footer>
  );
}
