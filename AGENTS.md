# Vibely — Agent Instructions

## Project Overview

Vibely is an event-centric photo sharing platform. Hosts create events and share
QR codes. Guests upload photos without creating an account. Photos auto-expire
after events end unless saved to a personal vault.

## Monorepo Structure

- `apps/vibely-web` — Next.js 14 App Router (web frontend + ALL API routes)
- `apps/vibely-mobile` — Expo React Native app
- `packages/shared` — Shared TypeScript types, Zod schemas, utility functions
- `supabase/migrations/` — Numbered SQL migration files (001–005 exist)
- `supabase/functions/` — Supabase Edge Functions (Deno runtime)

## Backend Scope for Jules

Jules ONLY works on:

- `supabase/migrations/` — new migration files
- `supabase/functions/` — new or updated Edge Functions
- `apps/vibely-web/app/api/` — Next.js API route handlers
- `apps/vibely-web/lib/` — server-side utilities
- `apps/vibely-web/hooks/` — data fetching hooks (no UI)
- `packages/shared/` — types, schemas, utilities

Jules NEVER modifies:

- `apps/vibely-web/app/` page files (anything not inside `api/`)
- `apps/vibely-web/components/`
- `apps/vibely-mobile/` (entire directory)
- `apps/vibely-web/app/layout.tsx`
- `apps/vibely-web/proxy.ts`

## Tech Stack

- Database: Supabase (PostgreSQL) with Row Level Security on all tables
- Auth: Supabase Auth (JWT Bearer tokens)
- Storage: Supabase Storage (event-photos, avatars, event-covers buckets)
- CDN: ImageKit (URL endpoint in NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT)
- Rate limiting: Upstash Redis (see apps/vibely-web/lib/rate-limit.ts)
- Serverless: Next.js API routes on Vercel
- Edge Functions: Deno runtime (supabase/functions/)

## Authentication Pattern

Every authenticated API route uses this exact pattern:

```ts
import { createClient, createAdminClient } from "@/lib/supabase/server";
const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// Use adminSupabase for queries that need to bypass RLS
const adminSupabase = createAdminClient();
```

## API Route Conventions

- All routes: `apps/vibely-web/app/api/{resource}/route.ts`
- Nested: `apps/vibely-web/app/api/{resource}/[id]/route.ts`
- Always validate request body with Zod before processing
- Return `{ error: string }` for errors with appropriate HTTP status
- Return data directly (not wrapped in `{ data: ... }`) for success
- Use `createAdminClient()` for writes and RLS-bypassing reads
- Use `createClient()` for reads that respect RLS

## Database Conventions

- All tables have RLS enabled
- UUIDs as primary keys (`gen_random_uuid()`)
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Soft deletes via `status = 'deleted'` and `deleted_at` (not hard DELETE)
- Migration files are numbered sequentially: 006_feature_name.sql

## Shared Package

- Import types: `import type { Event, Photo } from '@repo/shared/types'`
- Import schemas: `import { someSchema } from '@repo/shared/validation/...'`
- Import utils: `import { thumbnailUrl } from '@repo/shared/utils/storage'`
- When adding new types/schemas, add to the appropriate file in packages/shared/

## Storage Key Patterns

- Photos: `events/{eventId}/{photoId}/{filename}`
- Avatars: `{userId}/avatar.{ext}` (fixed name — overwrites on update)
- Covers: `{eventId}/cover.{ext}` (fixed name — overwrites on update)

## Rate Limiting

Use pre-configured limiters from `apps/vibely-web/lib/rate-limit.ts`.
Add new limiters there if needed. Always check `if (!rl.success) return rl.response!;`

## ImageKit URL Helpers

Use helpers from `packages/shared/utils/storage.ts`:

- `thumbnailUrl(storageKey)` — 400px thumbnail
- `previewUrl(storageKey)` — 1200px preview
- `fullUrl(storageKey)` — full quality

## What Good PRs Look Like

- One migration file per PR (increment the number)
- API routes include inline comments explaining WHY (not what)
- Zod validation for every request body
- RLS policies in the migration for any new tables
- No `console.log` left in production code (use `console.error` for actual errors only)
