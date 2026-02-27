# Vibely

An event-centric photo sharing platform with web and mobile apps.

## Monorepo Structure
```
events-manager/
├── apps/
│   ├── web/          Next.js 14 web application
│   └── mobile/       Expo mobile application
└── packages/
    └── shared/       Shared TypeScript types and validation
```

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Expo, Tailwind CSS, NativeWind
- **Backend:** Next.js API Routes, Supabase (Auth + PostgreSQL)
- **Storage:** Cloudflare R2, ImageKit
- **Monorepo:** Turborepo with pnpm workspaces

## Getting Started
```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev

# Build all apps
pnpm build

# Type check everything
pnpm type-check

# Lint all code
pnpm lint
```

## Environment Variables

See `.env.example` files in each app directory.

## Project Status

🚧 Currently in Phase 1: Monorepo foundations complete
```

---

## ✅ What We Just Accomplished

Let's recap **Phase 1**:

1. ✅ **Understood monorepos** - Why they exist and their benefits
2. ✅ **Chose Turborepo** - Understanding why it's right for your project
3. ✅ **Initialized workspace** - Set up pnpm workspaces
4. ✅ **Configured Turborepo** - Created the build pipeline
5. ✅ **Created structure** - Root folders for apps and packages
6. ✅ **Added Git** - Version control ready

---

## 📁 Your Current Structure
```
events-manager/
├── .git/
├── .gitignore
├── node_modules/
├── apps/                    (empty, ready for Phase 2)
├── packages/                (empty, ready for Phase 4)
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
└── README.md