<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-7c3aed?style=flat-square" />
<img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" />
<img src="https://img.shields.io/badge/Expo-SDK%2051-000020?style=flat-square&logo=expo" />
<img src="https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript" />
<img src="https://img.shields.io/badge/Supabase-powered-3ecf8e?style=flat-square&logo=supabase" />
<img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />

<br />
<br />

# 📸 Vibely

**Event-centric photo sharing — no app required for guests.**

Hosts create an event, share a QR code, and guests upload photos instantly from their phone browser. No sign-up, no friction. Photos auto-expire after the event unless saved to a personal vault.

[Live Demo](https://vibely.vercel.app) · [Report a Bug](https://github.com/Suharshit/vibely/issues/new?template=bug_report.md) · [Request a Feature](https://github.com/Suharshit/vibely/issues/new?template=feature_request.md)

</div>

---

## ✨ The Problem It Solves

After every event — weddings, birthdays, team offsites — photos end up scattered across a dozen different phones. The host spends days chasing people on WhatsApp for photos that never arrive.

**Vibely fixes this in 3 steps:**
1. Host creates an event and shares a QR code
2. Guests scan and upload directly from their browser — no account needed
3. Everyone sees the full gallery in real time

---

## 🎯 Core Features

| Feature | Description |
|---|---|
| **Guest Uploads** | Guests upload photos without creating an account — just scan the QR and enter a name |
| **Event Gallery** | Real-time photo grid with lightbox preview, hosted on ImageKit CDN |
| **Personal Vault** | Save favourites across all events before photos expire |
| **Photo Detail** | Full metadata view — uploader, date, event, download original |
| **Event Management** | Create, edit, cover image upload, QR code sharing, member management |
| **User Profiles** | Name, bio, avatar upload, upload stats |
| **Auto-Expiry** | Photos auto-expire with the event; saved vault photos persist |
| **Rate Limiting** | Upload and session abuse prevention via Upstash Redis |

---

## 🏗️ Tech Stack

### Monorepo
| Tool | Purpose |
|---|---|
| [Turborepo](https://turbo.build) | Monorepo build system with pipeline caching |
| [pnpm workspaces](https://pnpm.io/workspaces) | Package management across apps |

### Web (`apps/web`)
| Tool | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org) | App Router, Server Components, API Routes |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [TypeScript](https://typescriptlang.org) | Strict mode throughout |

### Mobile (`apps/mobile`)
| Tool | Purpose |
|---|---|
| [Expo SDK 51](https://expo.dev) | React Native with managed workflow |
| [NativeWind](https://nativewind.dev) | Tailwind for React Native |
| [React Navigation](https://reactnavigation.org) | Stack + bottom tab navigation |
| [EAS Build](https://docs.expo.dev/build/introduction/) | Cloud builds for iOS & Android |

### Backend & Infrastructure
| Tool | Purpose |
|---|---|
| [Supabase](https://supabase.com) | PostgreSQL, Auth, Storage, Edge Functions, pg_cron |
| [ImageKit](https://imagekit.io) | CDN image delivery with real-time transformations |
| [Upstash Redis](https://upstash.com) | Serverless rate limiting |
| [Vercel](https://vercel.com) | Web deployment |

### Shared Package (`packages/shared`)
- Entity types and Zod validation schemas
- Storage key utilities and ImageKit URL builders
- Invite token generation (nanoid)
- API constants and error codes

---

## 📁 Project Structure

```
vibely/
├── apps/
│   ├── web/                          # Next.js 14 web app
│   │   ├── app/                      # App Router pages
│   │   │   ├── api/                  # 20+ API route handlers
│   │   │   ├── dashboard/            # Event list
│   │   │   ├── events/[id]/          # Event detail + edit
│   │   │   ├── photos/[id]/          # Photo detail
│   │   │   ├── vault/                # Personal vault
│   │   │   ├── profile/              # User profile
│   │   │   └── guest/[token]/        # Guest upload page
│   │   ├── components/               # Shared UI components
│   │   ├── hooks/                    # useEvents, usePhotos, useVault, useProfile
│   │   ├── lib/                      # Supabase client, rate limiter
│   │   └── middleware.ts             # Auth guard
│   │
│   └── mobile/                       # Expo React Native app
│       ├── screens/                  # All screen components
│       ├── components/               # Shared RN components
│       ├── hooks/                    # Mobile-specific hooks
│       ├── navigation/               # Stack + tab navigators
│       └── lib/                      # Supabase client, AsyncStorage
│
├── packages/
│   └── shared/                       # Shared TypeScript package
│       ├── types/                    # Entity type definitions
│       ├── validation/               # Zod schemas
│       └── utils/                    # storage, invite helpers
│
└── supabase/
    ├── migrations/                   # 005 migration files
    └── functions/                    # Edge Functions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase CLI
- Expo CLI (for mobile)

### 1. Clone and install

```bash
git clone https://github.com/Suharshit/vibely.git
cd vibely
pnpm install
```

### 2. Set up Supabase

```bash
# Start local Supabase
supabase start

# Run all migrations
supabase db push
```

### 3. Configure environment variables

```bash
# Web
cp apps/web/.env.example apps/web/.env.local

# Mobile
cp apps/mobile/.env.example apps/mobile/.env
```

Fill in the values — see `.env.example` files for documentation on each variable.

Required services:
- [Supabase](https://supabase.com) — database, auth, storage
- [ImageKit](https://imagekit.io) — image CDN (free tier: 20GB/month)
- [Upstash](https://upstash.com) — Redis for rate limiting (free tier: 10k commands/day)

### 4. Run the development servers

```bash
# Run all apps in parallel
pnpm dev

# Or individually
pnpm --filter web dev          # http://localhost:3000
pnpm --filter mobile start     # Expo dev server
```

### 5. Check project health

```bash
pnpm status   # custom health check script
```

---

## 🗄️ Database Schema

The Supabase PostgreSQL schema consists of 7 core tables:

```
users               — auth profile (name, email, avatar, bio)
events              — event metadata (title, dates, invite_token, cover_image)
event_members       — user ↔ event membership with role (host/contributor/viewer)
photos              — photo metadata (storage_key, status, uploader references)
personal_vault      — user ↔ photo many-to-many for saved photos
guest_sessions      — session tokens for accountless guest uploads
```

Row Level Security (RLS) is enabled on all tables. Key policies:
- Users can only read events they're members of
- Only hosts can edit or delete events
- Photos are only visible to event members
- Guest sessions are managed via service role only

---

## 📤 Upload Architecture

Vibely uses a **two-step signed URL upload flow** to avoid routing file bytes through the Next.js server:

```
Client                    API (Next.js)          Supabase Storage
  │                           │                        │
  ├── POST /api/photos/upload ─→                       │
  │      (filename, type, size)                        │
  │                    ←── signed URL + photo_id       │
  │                                                    │
  ├───────────── PUT signed URL ──────────────────────→│
  │                  (raw file bytes)           stores file
  │
  ├── POST /api/photos/:id/complete ─→
  │                    verifies file exists in storage
  │                    status: 'uploading' → 'active'
  │←─────────────── activated photo ──────────────────
```

Benefits: no server body size limits, native upload progress tracking, lower latency.

---

## ⚙️ Automated Cleanup

Four `pg_cron` jobs run on schedule inside Postgres:

| Job | Schedule | What it does |
|---|---|---|
| `expire-events` | Daily 00:05 UTC | Marks events as `expired` when `expires_at` passes |
| `soft-delete-expired-photos` | Daily 00:15 UTC | Marks un-saved photos as `deleted` after event expiry |
| `cleanup-abandoned-uploads` | Hourly :30 | Removes `uploading` rows older than 2 hours |
| `cleanup-old-guest-sessions` | Daily 01:00 UTC | Removes guest sessions older than 90 days |

A Supabase Edge Function runs daily at 02:00 UTC to **hard-delete** storage files for photos soft-deleted 7+ days ago.

---

## 🔒 Rate Limiting

Implemented via Upstash Redis with a sliding window counter:

| Endpoint | Limit |
|---|---|
| `POST /api/photos/upload` | 20 uploads / user / hour |
| `POST /api/guest/session` | 5 sessions / IP / 15 min |
| `POST /api/events/:id/join` | 10 attempts / IP / minute |
| Auth endpoints | 10 attempts / IP / 15 min |

Rate limiting degrades gracefully — if Upstash is unavailable, requests are allowed through.

---

## 📱 Mobile

The Expo app supports all MVP features with platform-native implementations:

- `expo-image-picker` + `expo-image-manipulator` for photo selection and compression (images compressed to max 2400px / 82% JPEG before upload)
- `expo-file-system` `uploadAsync` for upload progress tracking (React Native `fetch` doesn't support upload progress)
- `expo-media-library` for saving photos to camera roll
- `AsyncStorage` for guest session persistence
- Bottom tab navigation: Events / Vault / Profile
- Action sheets (iOS) and Alert dialogs (Android) for destructive actions

**EAS Build profiles:**

```bash
eas build --profile preview     # internal testing
eas build --profile production  # App Store / Play Store
```

---

## 🌐 Deployment

### Web (Vercel)

```bash
# Connect repo to Vercel, set root directory to apps/web
# Add all environment variables from apps/web/.env.example
vercel --prod
```

Verify deployment: `https://yourdomain.vercel.app/health`

### Mobile (EAS)

```bash
cd apps/mobile
eas init                    # initialize EAS project
eas build --platform all --profile production
eas submit --platform all   # submit to stores
```

---

## 🤝 Contributing

Contributions are welcome. Please read the [contributing guidelines](.github/CONTRIBUTING.md) and open an issue before submitting a PR for large changes.

```bash
# Development workflow
git checkout -b feat/your-feature
pnpm lint
pnpm typecheck
pnpm test
git push origin feat/your-feature
# Open a PR against develop
```

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built by <a href="https://github.com/Suharshit">Suharshit</a> · Powered by Supabase, ImageKit, and Vercel</sub>
</div>
