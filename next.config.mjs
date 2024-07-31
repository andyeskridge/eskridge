import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

// note: the if statement is present because you
//       only need to use the function during development
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx'],
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.tina.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
