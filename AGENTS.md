# Agentic Coding Guidelines for AMC

This document contains instructions for AI coding agents operating in this repository.

## Project Architecture & Tech Stack

- **Monorepo**: Turborepo with npm workspaces (`apps/*`, `packages/*`).
- **Framework**: Next.js 15+ (App Router, React 19) in `apps/web`.
- **Styling**: Tailwind CSS v4, base-ui, shadcn/ui.
- **State & Data Fetching**: tRPC v11, React Query v5.
- **Database**: LibSQL/SQLite via Drizzle ORM (in `@AMC/db`).
- **Authentication**: Better Auth (in `@AMC/auth`).
- **Validation**: Zod (in `@AMC/env`, `@AMC/api`, etc.).

## 1. Build, Lint & Test Commands

### Core Commands (Root)
- **Install dependencies**: `npm install`
- **Start dev servers**: `npm run dev` (starts web app and packages via Turbo)
- **Build all**: `npm run build`
- **Check types**: `npm run check-types`

### App-Specific Commands
- **Start Web App**: `npm run dev:web` (or `turbo -F web dev`)
- **Web App Directory**: Run Next.js commands within `apps/web` (e.g., `npx next build`).

### Database Commands (Run from root)
- **Push Schema**: `npm run db:push`
- **Generate Migrations**: `npm run db:generate`
- **Run Migrations**: `npm run db:migrate`
- **Start DB Studio**: `npm run db:studio`
- **Start Local DB**: `npm run db:local`

*(Note: There are currently no unit test frameworks configured. Focus on type-checking (`npm run check-types`) to verify code correctness.)*

## 2. Code Style & Conventions

### General Typescript & React
- Use **TypeScript** strictly. Avoid `any`; use `unknown` if necessary. Define proper Zod schemas for external boundaries.
- Favor functional components and React Hooks. Use Server Components by default in Next.js App Router.
- For interactive components, clearly denote with `"use client";` at the very top of the file.
- Prefer arrow functions for components and handlers.
- Do not use default exports except when required by Next.js conventions (e.g., `page.tsx`, `layout.tsx`).

### State & Data Fetching
- For API routes, utilize tRPC routers (defined in `@AMC/api`).
- When fetching data in Client Components, use `@trpc/react-query` hooks instead of raw fetch.
- Server Components should use server-side tRPC callers or direct DB queries when appropriate.
- For form handling, use `@tanstack/react-form` combined with Zod validation.

### Styling
- Use **Tailwind CSS v4** for styling. Rely on utility classes.
- Use `clsx` and `tailwind-merge` for conditional class combinations (e.g., standard `cn()` utility).
- For UI components, utilize `base-ui` and the pre-configured `shadcn` components.
- Do not write custom CSS unless absolutely necessary (use Tailwind arbitrary values `w-[200px]` instead).

### Project Structure & Imports
- **Apps**: `apps/web` contains the main Next.js frontend.
- **Packages**: Logic is extracted into reusable packages inside `packages/`:
  - `api`: tRPC routers and procedures.
  - `auth`: Better Auth configuration.
  - `db`: Database schema (Drizzle) and connections.
  - `env`: Zod environment variable validation.
- When importing across packages, use the configured aliases: `@AMC/api`, `@AMC/db`, etc. Avoid deep relative imports.

### Error Handling
- Use structured error handling. Return specific error types from tRPC procedures (e.g., `TRPCError`).
- In the UI, handle loading (`isPending`) and error (`isError`) states gracefully using React Query states.
- Log critical errors to the console in development, but surface user-friendly messages via toast notifications (e.g., `sonner`).

### Clean Code Principles
- Keep files small and focused on a single responsibility.
- Write meaningful variable and function names.
- Avoid leaving commented-out code or excessive `console.log` statements in final commits.
