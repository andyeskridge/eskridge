# Agent Guidelines for Eskridge Repository

## Build/Lint/Test Commands
- **Build**: `npm run build` (includes TinaCMS build + Next.js build)
- **Dev**: `npm run dev` (TinaCMS + Next.js dev server)
- **Lint**: `npm run lint` (Biome check)
- **Lint CI**: `npm run lint:ci` (Biome CI mode)
- **E2E Tests**: `npm run e2e` (Playwright tests)
- **Deploy**: `npm run deploy` (Build + deploy to Cloudflare)

## Code Style Guidelines
- **Linter**: Uses Biome with "ultracite" config
- **Imports**: Barrel imports (`@/components`, `@/lib`, `@/tina`)
- **Types**: TypeScript strict mode enabled, import types with `type` keyword
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Components**: Function declarations for components, not arrow functions
- **Props**: Destructure props in function params, use TypeScript interfaces
- **Exports**: Named exports for utilities, default exports for pages/components

## Framework Stack
- Next.js 15 app router with React 19
- TailwindCSS for styling with custom color scheme
- TinaCMS for content management
- Cloudflare deployment via OpenNext