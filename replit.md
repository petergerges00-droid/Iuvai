# IUVAI

A human intelligence infrastructure platform for AI. IUVAI connects qualified human experts across different fields with companies and AI projects that need human expertise for AI training, evaluation, and development.

## Run & Operate

- `pnpm --filter @workspace/iuvai run dev` — run the IUVAI web app (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, Wouter, Framer Motion, React Hook Form + Zod
- Auth & DB: Supabase (existing project, external)
- Fonts: DM Sans + Space Mono (via Google Fonts)
- API: Express 5 (shared api-server, not used by IUVAI frontend)
- Codegen: Orval (not used by IUVAI — Supabase is the backend)

## Where things live

- `artifacts/iuvai/` — IUVAI React + Vite web app
- `artifacts/iuvai/src/lib/supabase.ts` — Supabase client, types, and all auth/profile helpers
- `artifacts/iuvai/src/pages/` — page components (Login, Signup, Onboarding, Dashboards, etc.)
- `artifacts/api-server/` — shared Express API server (not used by IUVAI at this stage)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (not used by IUVAI — Supabase is the backend)

## Architecture decisions

- IUVAI uses Supabase directly from the frontend (no custom backend). All auth, profile reads/writes, and RLS enforcement happen via `@supabase/supabase-js`.
- The Supabase auth user UUID is used as the primary key for `profiles`, `expert_profiles`, and `company_profiles` (existing tables — not recreated here).
- Account type routing: after login, `profile.account_type` determines whether the user goes to `/dashboard` (expert) or `/company-dashboard` (company), or `/onboarding` if null.
- Supabase Row Level Security enforces that users can only read/write their own profile data.

## Product

- **Auth**: Email/password signup with email verification, login, logout, forgot/reset password
- **Onboarding**: Account type selection (Expert vs AI Company) → role-specific multi-step profile form
- **Expert dashboard**: Profile completion, verification status (coming soon), expertise display, assessments (coming soon), available projects (coming soon)
- **Company dashboard**: Company profile, find experts (coming soon), submit project (coming soon), active projects (coming soon)
- **Settings**: Update profile info and password

## User preferences

- Connect to existing Supabase project (do NOT create a new one or use Replit's built-in DB for auth)
- Do NOT create a mock backend
- No emoji in the UI

## Gotchas

- Google Fonts `@import` must be the FIRST line in `artifacts/iuvai/src/index.css` (before `@import 'tailwindcss'`) to avoid PostCSS ordering errors.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set as Replit Secrets — the app will throw on startup if they're missing.
- Never instantiate a second Supabase client — always import from `@/lib/supabase`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
