# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js blog/portfolio site for Andy Eskridge, deployed on Cloudflare Pages. The project uses:
- **Next.js 15.3.3** with App Router
- **React 19.1.0** with modern features
- **TinaCMS 2.8.1** for content management
- **Tailwind CSS 4.1.11** for styling with PostCSS
- **Biome 1.9.4** with Ultracite preset for linting/formatting
- **TypeScript 5.8.3** for type safety
- **Cloudflare Pages** for deployment with KV storage and D1 database
- **OpenNext for Cloudflare 1.5.1** for serverless deployment

## Development Commands

### Core Development
- `bun run dev` - Start development server with TinaCMS
- `bun run build` - Build TinaCMS content and Next.js app
- `bun run start` - Start production server locally

### Cloudflare Worker Development
- `bun run dev:worker` - Preview worker locally on port 8771
- `bun run build:worker` - Build worker for Cloudflare using OpenNext
- `bun run preview:worker` - Build and preview worker locally
- `bun run deploy` - Build and deploy to Cloudflare Pages
- `bun run cf-typegen` - Generate Cloudflare environment types

### Linting and Type Checking
- `bun run lint` - Run Biome linter
- `bun run lint:ci` - Run Biome in CI mode
- Run TypeScript compiler with `bunx tsc --noEmit` for type checking
- **ALWAYS run `bun run lint` before pushing code to ensure code quality**

### TinaCMS
- `bun run tina:build` - Build TinaCMS schema
- TinaCMS admin interface available at `/admin` when dev server is running

### Testing
- `bun run e2e` - Run Playwright end-to-end tests

### Cache Management
- `bun run populate:local` - Populate local cache
- `bun run populate:remote` - Populate remote cache

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
- Static pages: `/about`, `/projects`, `/speaking`, `/uses`, `/thank-you`
- Dynamic routes: `/articles/[filename]`, `/categories/[slug]`, `/tags/[slug]`
- API routes: `/api/preview/enter`, `/api/preview/exit`
- Generated routes: `/feed.xml`, `/sitemap.xml`
- Custom 404 page with `not-found.tsx`

#### Styling
- Tailwind CSS 4.1.11 with PostCSS configuration
- Dark mode support via `next-themes 0.4.6`
- Custom components in `src/components/`
- Typography styles in `typography.ts`
- Tailwind Typography plugin for article content
- PostCSS configuration in `postcss.config.mjs`

#### Deployment
- Cloudflare Pages with OpenNext adapter (@opennextjs/cloudflare 1.5.1)
- KV storage for incremental cache (`NEXT_INC_CACHE_KV`)
- D1 database for tag caching (`NEXT_TAG_CACHE_D1`)
- Memory queue for background tasks
- Custom image loader for Cloudflare
- OpenNext configuration in `open-next.config.ts`
- Wrangler configuration in `wrangler.json` with observability enabled

### Environment Variables Required
- `NEXT_PUBLIC_TINA_CLIENT_ID` - TinaCMS client ID
- `TINA_TOKEN` - TinaCMS token
- `TINA_INDEXER_TOKEN` - TinaCMS indexer token (production)
- `GITHUB_BRANCH` - Git branch for TinaCMS

### Path Aliases
- `@/*` maps to `src/*`
- `@/tina/*` maps to `tina/*`

### TypeScript Configuration
- TypeScript 5.8.3 with strict mode enabled
- ESNext target with bundler module resolution
- Includes Next.js plugin for enhanced type checking
- Cloudflare environment types generated via `bun run cf-typegen`

## Important Notes

### Biome Configuration
- Uses `ultracite` preset (version 4.2.13) for consistent formatting
- Configured for Cloudflare globals (`KVNamespace`, `Fetcher`)
- Ignores generated files: `tina-lock.json`, `cloudflare-env.d.ts`, `bun.lock`, `renovate.json`
- Configuration in `biome.json` with schema validation

### Content Structure
- Posts are in `content/posts/` as markdown files
- Categories and tags are defined in respective directories
- All content is managed through TinaCMS interface

### Image Handling
- Custom image loader for Cloudflare compatibility
- Images stored in `src/images/` and `public/`
- TinaCMS media stored in `public/`

### Testing
- E2E tests with Playwright 1.54.1 in `e2e/` directory
- Test configuration in `e2e/playwright.config.ts`
- Run tests with `bun run e2e`

### Package Management
- **ALWAYS use `bun` for package management** - never use npm or yarn
- Uses `bun.lock` for dependency locking
- Install dependencies with `bun install`
- Add dependencies with `bun add <package>`
- Includes `trustedDependencies` for Biome and Tailwind CSS
- React types overrides for version 19.1.8 compatibility
- Renovate configuration for automated dependency updates

### Key Dependencies
- **UI/UX**: `@headlessui/react` 2.2.4 for accessible components
- **Content Processing**: `cheerio` 1.1.0 for HTML parsing, `feed` 5.1.0 for RSS generation
- **Utilities**: `clsx` 2.1.1 for conditional class names
- **Development**: Wrangler 4.25.0 for Cloudflare development
- **Build Tools**: OpenNext AWS 3.7.0 for additional deployment options