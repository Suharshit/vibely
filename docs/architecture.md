# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                          │
├─────────────────────────┬───────────────────────────────────┤
│      Web (Next.js)      │      Mobile (Expo)                │
│   - Event Management    │   - Event Management              │
│   - Photo Upload        │   - Photo Upload                  │
│   - Guest Sessions      │   - Guest Sessions                │
│   - Personal Vault      │   - Personal Vault                │
└─────────────────────────┴───────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  /api/auth/*     │  /api/events/*   │  /api/photos/*        │
│  /api/users/*    │  /api/guest/*    │  /api/vault           │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Supabase    │  │ Cloudflare R2│  │  Upstash     │
│  (Auth + DB) │  │ (Storage)    │  │  (Rate Limit)│
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │
        ↓                 ↓
┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  ImageKit    │
│  (Database)  │  │  (CDN)       │
└──────────────┘  └──────────────┘
```

## Monorepo Structure

```
vibely/
├── apps/
│   ├── web/              # Next.js 14 web application
│   │   ├── app/          # App Router pages & API routes
│   │   ├── components/   # React components
│   │   ├── lib/          # Client libraries (Supabase, R2, ImageKit)
│   │   └── types/        # App-specific types
│   │
│   └── mobile/           # Expo React Native app
│       ├── screens/      # Mobile screens
│       ├── components/   # RN components
│       ├── navigation/   # Navigation config
│       └── lib/          # Mobile utilities
│
└── packages/
    └── shared/           # Shared code between apps
        ├── types/        # TypeScript type definitions
        ├── validation/   # Zod schemas
        └── constants/    # API routes, config
```

## Data Flow

### Photo Upload Flow

```
1. User/Guest uploads photo
   ↓
2. Client compresses image
   ↓
3. POST /api/photos/upload
   ↓
4. Validate auth/session
   ↓
5. Upload to Cloudflare R2
   ↓
6. Create thumbnail
   ↓
7. Store metadata in Supabase
   ↓
8. Return ImageKit URLs
```

### Event Expiration Flow

```
1. Vercel Cron triggers daily
   ↓
2. Find expired events
   ↓
3. Mark photos as deleted
   ↓
4. Schedule R2 cleanup
   ↓
5. Update event status
   ↓
6. Send notifications (future)
```

## Authentication Flow

### Registered Users

```
User → Supabase Auth → JWT Token → API Routes
```

### Guest Users

```
Guest → Generate session token → Store in Supabase → API Routes
```

## Security Layers

1. **Rate Limiting**: Upstash Redis (100 req/min)
2. **Input Validation**: Zod schemas
3. **Authentication**: JWT tokens
4. **Authorization**: Role-based (host/contributor/viewer)
5. **Storage Security**: Signed URLs with expiration

## Technology Decisions

### Why Next.js 14?

- Server Components for performance
- App Router for modern patterns
- API routes for backend
- Vercel deployment integration

### Why Expo?

- Cross-platform (iOS + Android)
- OTA updates
- Great developer experience
- Large ecosystem

### Why Turborepo?

- Fast builds with caching
- Simple configuration
- Vercel integration
- Great DX

### Why Supabase?

- PostgreSQL (reliable, powerful)
- Built-in auth
- Real-time subscriptions
- Good free tier

### Why Cloudflare R2?

- S3-compatible API
- No egress fees
- Fast global delivery
- Cost-effective

### Why ImageKit?

- Automatic optimization
- On-the-fly transformations
- CDN delivery
- Easy integration
