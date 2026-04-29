# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Smart Campus artifact

Hackathon-grade web app for university resource management:
- `artifacts/api-server` — Express + Drizzle + JWT auth, seeds 6 users + 20 resources + 60 bookings on boot, background IoT simulator.
- `artifacts/smart-campus` — React + Vite SPA. Routes: `/`, `/dashboard`, `/resources`, `/resources/:id`, `/bookings`, `/map`, `/analytics` (admin), `/notifications`, `/admin` (admin).
- Stack: Wouter routing, TanStack Query, Orval-generated hooks, Tailwind v4, shadcn/ui, framer-motion, react-leaflet, sonner toasts, next-themes (dark default).
- Demo creds: `admin@campus.edu`/`Admin@123`, `prof.smith@campus.edu`/`Faculty@123`, `student1@campus.edu`/`Student@123`.
- Auth token stored in localStorage; `setAuthTokenGetter` wired in `App.tsx`. JWT bearer header on every Orval call.
- Orval rule: when passing `{ query: { ... } }` options, MUST include `queryKey: getXQueryKey(...)`.
