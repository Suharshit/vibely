# Architecture: Vibely

## Monorepo Structure

- `apps/vibely-web`: Next.js frontend and API routes.
- `apps/vibely-mobile`: Expo React Native mobile application.
- `packages/shared`: Shared types, Zod schemas, and utility functions.
- `supabase/`: Database migrations and Edge Functions.

## Component Overview

- **Web**: Handles event management, guest uploads, and dashboard.
- **Mobile**: Optimized for hosts and power users (Vault, Profile).
- **Shared**: Ensures type safety and validation consistency across platforms.

## Infrastructure

- **Supabase**: Primary database (Postgres) with RLS for security.
- **ImageKit**: CDN for optimized image delivery and transformations.
- **Upstash**: Redis-based rate limiting for API protection.
