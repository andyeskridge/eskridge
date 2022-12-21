import { withAxiom } from 'next-axiom'
import { withContentlayer } from 'next-contentlayer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['jsx', 'mdx', 'tsx', 'ts'],
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
    allowMiddlewareResponseBody: true,
  },
  swcMinify: true,
}

export default withAxiom(withContentlayer(nextConfig))
