import { Providers } from '@/app/providers';
import { Layout } from '@/components/layout';
import '@/styles/tailwind.css';
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },

      {
        title: 'Andy Eskridge - Senior Engineering Manager',
      },
      {
        description:
          "I'm Andy, a senior engineering manager based in Dallas, TX.",
      },
      {
        alternates: {
          types: {
            'application/rss+xml': `${process.env.CF_PAGES_BRANCH === 'main' ? 'https://eskridge.dev' : process.env.CF_PAGES_URL}/feed.xml`,
          },
        },
      },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex h-full bg-zinc-50 dark:bg-black">
        <Providers>
          <div className="flex w-full">
            <Layout>
              <Outlet />
            </Layout>
          </div>
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
