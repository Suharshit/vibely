# Project Brief: Vibely

Event-centric photo sharing with zero friction for guests.

## Core Objective

Enable hosts to create events where guests can upload photos via QR code without needing an account or a dedicated app.

## Tech Stack

- **Monorepo**: Turborepo + pnpm
- **Web**: Next.js 14 (App Router) + Tailwind CSS
- **Mobile**: Expo SDK 51 + NativeWind
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **Infrastructure**: ImageKit (CDN), Upstash Redis (Rate Limiting)

## Key Goals

- Seamless guest experience (no sign-up)
- Real-time event galleries
- Personal photo vaults for persistent storage
- Automated cleanup of expired data via pg_cron
