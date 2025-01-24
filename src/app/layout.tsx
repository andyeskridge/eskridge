import { Providers } from '@/app/providers';
import { Layout } from '@/components/layout';
import '@/styles/tailwind.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    template: '%s - Andy Eskridge',
    default: 'Andy Eskridge - Senior Engineering Manager',
  },
  description: 'I’m Andy, a senior engineering manager based in Dallas, TX.',
  alternates: {
    types: {
      'application/rss+xml': `${process.env.CF_PAGES_BRANCH === 'main' ? 'https://eskridge.dev' : process.env.CF_PAGES_URL}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex h-full bg-zinc-50 dark:bg-black">
        <Providers>
          <div className="flex w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  );
}
