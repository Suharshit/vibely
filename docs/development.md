# Development Workflow - Vibely

## 🚀 Getting Started

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/vibely.git
cd vibely

# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env

# Fill in your API keys in .env files
```

### Daily Development

```bash
# Start both web and mobile
pnpm dev

# Or start individually
pnpm dev:web      # Web only
pnpm dev:mobile   # Mobile only
```

## 📝 Code Quality

### Before Committing

Our Git hooks will automatically run, but you can run manually:

```bash
# Format all code
pnpm format

# Check formatting
pnpm format:check

# Lint all packages
pnpm lint

# Fix lint issues
pnpm lint:fix

# Type check everything
pnpm type-check

# Run all checks (recommended before push)
pnpm validate
```

### Writing Code

1. **Follow TypeScript strict mode** - No `any` types
2. **Use shared types** - Import from `@repo/shared`
3. **Validate with Zod** - All API inputs/outputs
4. **Write descriptive comments** - Especially for complex logic
5. **Keep functions small** - Single responsibility principle

## 🏗️ Building

### Build All Apps

```bash
pnpm build
```

### Build Specific App

```bash
pnpm build:web
pnpm build:mobile
```

### Build Caching

Turborepo caches builds. If nothing changed, builds are instant!

```bash
# Clear cache if needed
pnpm clean:cache
```

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test
```

## 📦 Adding Dependencies

### Root Dependencies (dev tools)

```bash
pnpm add -D package-name -w
```

### App-Specific Dependencies

```bash
# Web app
pnpm add package-name --filter=web

# Mobile app
pnpm add package-name --filter=mobile

# Shared package
pnpm add package-name --filter=@repo/shared
```

## 🔧 Troubleshooting

### Clear Everything

```bash
pnpm clean
pnpm install
```

### Port Conflicts

```bash
# Web (default 3000)
pnpm dev:web -- -p 3001

# Mobile (default 8081)
npx expo start --port 8082
```

### TypeScript Errors

```bash
# Rebuild TypeScript
pnpm type-check

# Restart TS server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### ESLint Not Working

```bash
# Reinstall ESLint config
pnpm install

# Restart ESLint server in VS Code
Cmd+Shift+P → "ESLint: Restart ESLint Server"
```

## 📱 Mobile Development

### Using Physical Device

1. Install Expo Go app
2. Same WiFi as dev machine
3. Scan QR code

### Using Simulator

```bash
# iOS (Mac only)
pnpm dev:mobile
# Press 'i'

# Android
pnpm dev:mobile
# Press 'a'
```

### API Connection

Mobile needs your computer's IP, not localhost:

```bash
# Find your IP
# Mac/Linux: ifconfig
# Windows: ipconfig

# Update apps/mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

## 🎨 Working with Shared Package

### Adding New Types

```typescript
// packages/shared/src/types/my-type.ts
export interface MyType {
  id: string;
  name: string;
}

// Export from index
// packages/shared/src/types/index.ts
export * from "./my-type";
```

### Adding Validation

```typescript
// packages/shared/src/validation/my-validation.ts
import { z } from "zod";

export const mySchema = z.object({
  name: z.string().min(1),
});

export type MyInput = z.infer<typeof mySchema>;
```

### Using in Apps

```typescript
// apps/web or apps/mobile
import { MyType } from "@repo/shared/types";
import { mySchema } from "@repo/shared/validation";

const data: MyType = { id: "1", name: "Test" };
mySchema.parse(input);
```

## 🔄 Git Workflow

### Feature Development

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes
# Commits will auto-lint via Git hooks

# Push and open PR
git push origin feature/amazing-feature
```

### Before Pushing

```bash
# Run full validation
pnpm validate

# If all passes, push
git push
```

## 📊 Performance Tips

1. **Use Turbo filters** - Only build what you need

```bash
   turbo build --filter=web
```

2. **Parallel dev** - Both apps run simultaneously

```bash
   pnpm dev  # Runs web + mobile in parallel
```

3. **Cache awareness** - Turbo caches everything
   - Builds
   - Lints
   - Type checks

4. **Fast Refresh** - Both Next.js and Expo support it
   - Changes reflect instantly
   - No full rebuild needed

## 🎯 Best Practices

1. **Commit Often** - Small, focused commits
2. **Write Tests** - For critical logic
3. **Document Complex Code** - Help future you
4. **Use Shared Types** - Never duplicate types
5. **Validate Everything** - Use Zod schemas
6. **Review PRs** - Catch issues early
7. **Update Dependencies** - Weekly Dependabot PRs

---

Happy coding! 🚀
