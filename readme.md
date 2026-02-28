# 📸 Vibely

> An event-centric photo sharing platform enabling seamless photo uploads and sharing for events without requiring guest accounts.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2050-000020.svg)](https://expo.dev/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.0-EF4444.svg)](https://turbo.build/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🌟 Features

- 🎉 **Event Creation** - Create events with custom details and expiration dates
- 📱 **QR Code Sharing** - Generate shareable QR codes and invite links
- 📸 **Guest Uploads** - Allow guests to upload photos without creating accounts
- 🔒 **Personal Vaults** - Save favorite photos before events expire
- ⚡ **Auto-Cleanup** - Photos automatically delete after event expiration
- 🌐 **Cross-Platform** - Seamless experience on web and mobile

## 🏗️ Architecture

This is a monorepo containing:
```
vibely/
├── apps/
│   ├── web/          # Next.js 14 web application (App Router)
│   └── mobile/       # Expo React Native mobile app
└── packages/
    └── shared/       # Shared TypeScript types, validation, and utilities
```

## 🛠️ Tech Stack

### Frontend
- **Web**: Next.js 14 with App Router, Tailwind CSS
- **Mobile**: Expo (React Native), NativeWind
- **Language**: TypeScript

### Backend & Infrastructure
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (Email + Google OAuth)
- **Image Storage**: Cloudflare R2
- **Image Delivery**: ImageKit CDN
- **Rate Limiting**: Upstash Redis
- **Cron Jobs**: Vercel Cron

### Development Tools
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Git

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/Suharshit/vibely.git
   cd vibely
```

2. **Install dependencies**
```bash
   pnpm install
```

3. **Set up environment variables**
```bash
   # Copy example env files
   cp apps/web/.env.example apps/web/.env.local
   cp apps/mobile/.env.example apps/mobile/.env
```

4. **Start development servers**
```bash
   pnpm dev
```

   This starts:
   - Web app: http://localhost:3000
   - Mobile app: Expo DevTools

## 📝 Available Scripts
```bash
# Development
pnpm dev          # Start all apps in development mode
pnpm dev:web      # Start only web app
pnpm dev:mobile   # Start only mobile app

# Building
pnpm build        # Build all apps for production
pnpm build:web    # Build only web app
pnpm build:mobile # Build only mobile app

# Code Quality
pnpm lint         # Lint all packages
pnpm type-check   # Type check all packages
pnpm format       # Format code with Prettier

# Cleanup
pnpm clean        # Remove all build artifacts and caches
```

## 📂 Project Structure
```
apps/web/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utilities (Supabase, R2, ImageKit clients)
└── types/            # TypeScript type definitions

apps/mobile/
├── screens/          # Mobile screens
├── components/       # React Native components
├── navigation/       # Navigation configuration
└── lib/              # Mobile utilities

packages/shared/
├── types/            # Shared TypeScript types
├── validation/       # Zod schemas
└── constants/        # API constants and configurations
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
5. Push to your fork (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📋 Roadmap

- [x] Phase 1: Monorepo setup
- [ ] Phase 2: Web app foundation
- [ ] Phase 3: Mobile app foundation
- [ ] Phase 4: Shared package & types
- [ ] Phase 5: Integration & verification
- [ ] Phase 6: Authentication implementation
- [ ] Phase 7: Event management features
- [ ] Phase 8: Photo upload & storage
- [ ] Phase 9: Guest session handling
- [ ] Phase 10: Personal vault feature
- [ ] Phase 11: Auto-cleanup cron jobs
- [ ] Phase 12: Production deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Suharshit** - [GitHub](https://github.com/Suharshit)

## 🙏 Acknowledgments

- Built with [Turborepo](https://turbo.build/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database by [Supabase](https://supabase.com/)
- Image delivery by [ImageKit](https://imagekit.io/)

---

<p align="center">Made with ❤️ for seamless event photo sharing</p>