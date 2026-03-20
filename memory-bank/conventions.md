# Conventions: Vibely

## Coding Standards

- **TypeScript**: Strict mode enabled throughout the monorepo.
- **Validation**: Every API input is validated using Zod schemas from `packages/shared`.
- **Security**: Row Level Security (RLS) handles all authorization in Supabase.

## Styling Patterns

- **Web**: Tailwind CSS with a focus on Neumorphic and modern aesthetics.
- **Mobile**: NativeWind for utility-first styling consistent with Web.

## API Consistency

- **Routes**: Next.js App Router for web; typed fetch/hooks for mobile.
- **Error Handling**: Standardized error codes and localized error messages.

## Environment Management

- Shared `.env.example` templates for local setup consistency.
