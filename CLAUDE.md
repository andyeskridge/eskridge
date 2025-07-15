# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js blog/portfolio site for Andy Eskridge, deployed on Cloudflare Pages. The project uses:
- **Next.js 15.3.3** with App Router
- **TinaCMS** for content management
- **Tailwind CSS** for styling
- **Biome** for linting/formatting
- **TypeScript** for type safety
- **Cloudflare Pages** for deployment with KV storage and D1 database
- **OpenNext for Cloudflare** for serverless deployment

## Development Commands

### Core Development
- `npm run dev` - Start development server with TinaCMS
- `npm run build` - Build TinaCMS content and Next.js app
- `npm run start` - Start production server locally

### Cloudflare Worker Development
- `npm run dev:worker` - Preview worker locally on port 8771
- `npm run build:worker` - Build worker for Cloudflare
- `npm run deploy` - Build and deploy to Cloudflare Pages

### Linting and Type Checking
- `npm run lint` - Run Biome linter
- `npm run lint:ci` - Run Biome in CI mode
- Run TypeScript compiler with `npx tsc --noEmit` for type checking

### TinaCMS
- `npm run tina:build` - Build TinaCMS schema
- TinaCMS admin interface available at `/admin` when dev server is running

### Testing
- `npm run e2e` - Run Playwright end-to-end tests

### Cache Management
- `npm run populate:local` - Populate local cache
- `npm run populate:remote` - Populate remote cache

## Code Architecture

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and data fetching
- `src/images/` - Static images and logos
- `src/styles/` - Global styles and Tailwind configuration
- `tina/` - TinaCMS configuration and schema
- `content/` - Markdown content (posts, categories, tags)
- `public/` - Static assets and TinaCMS admin files

### Key Architecture Patterns

#### Content Management
- **TinaCMS** manages markdown content in `content/` directory
- Collections: Posts, Categories, Tags defined in `tina/collection/`
- Content queries use generated TinaCMS client from `tina/__generated__/`
- Draft posts are filtered out in production

#### Routing
- App Router with file-based routing in `src/app/`
- Dynamic routes: `/articles/[filename]`, `/categories/[slug]`, `/tags/[slug]`
- API routes for preview mode: `/api/preview/enter`, `/api/preview/exit`

#### Styling
- Tailwind CSS with custom configuration
- Dark mode support via `next-themes`
- Custom components in `src/components/`
- Typography styles in `typography.ts`

#### Deployment
- Cloudflare Pages with OpenNext adapter
- KV storage for incremental cache
- D1 database for tag caching
- Custom image loader for Cloudflare

### Environment Variables Required
- `NEXT_PUBLIC_TINA_CLIENT_ID` - TinaCMS client ID
- `TINA_TOKEN` - TinaCMS token
- `TINA_INDEXER_TOKEN` - TinaCMS indexer token (production)
- `GITHUB_BRANCH` - Git branch for TinaCMS

### Path Aliases
- `@/*` maps to `src/*`
- `@/tina/*` maps to `tina/*`

## Important Notes

### Biome Configuration
- Uses `ultracite` preset for consistent formatting
- Configured for Cloudflare globals (`KVNamespace`, `Fetcher`)
- Ignores generated files and lock files

### Content Structure
- Posts are in `content/posts/` as markdown files
- Categories and tags are defined in respective directories
- All content is managed through TinaCMS interface

### Image Handling
- Custom image loader for Cloudflare compatibility
- Images stored in `src/images/` and `public/`
- TinaCMS media stored in `public/`

### Testing
- E2E tests with Playwright in `e2e/` directory
- Test configuration in `e2e/playwright.config.ts`