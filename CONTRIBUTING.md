# Contributing to Vibely

Thank you for considering contributing to Vibely! This document outlines the process and guidelines.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Provide:

- **Clear title and description**
- **Use case** - Why is this enhancement useful?
- **Proposed solution** (if you have one)
- **Alternatives considered**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Follow the coding style** (ESLint/Prettier will help)
3. **Add tests** if applicable
4. **Update documentation** if needed
5. **Write clear commit messages** (see below)

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(web): add event creation form
fix(mobile): resolve QR scanner crash on iOS
docs: update installation instructions
refactor(shared): simplify validation schemas
```

## 🏗️ Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git

### Setup Steps

```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/vibely.git
cd vibely

# 2. Add upstream remote
git remote add upstream https://github.com/Suharshit/vibely.git

# 3. Install dependencies
pnpm install

# 4. Create a feature branch
git checkout -b feature/my-feature

# 5. Make your changes and test
pnpm dev
pnpm type-check
pnpm lint

# 6. Commit and push
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

## 🧪 Testing

Before submitting a PR:

```bash
# Type check all packages
pnpm type-check

# Lint all code
pnpm lint

# Build everything
pnpm build
```

## 📁 Project Structure

```
vibely/
├── apps/
│   ├── web/          # Next.js web app
│   └── mobile/       # Expo mobile app
├── packages/
│   └── shared/       # Shared types and validation
├── .github/          # GitHub workflows and templates
└── docs/             # Additional documentation
```

## 🎨 Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (runs on commit)
- **Linting**: ESLint (runs on commit)
- **Naming**:
  - Components: PascalCase (`EventCard.tsx`)
  - Files: kebab-case (`event-utils.ts`)
  - Functions: camelCase (`getUserEvents`)

## 🔍 Code Review Process

1. **Automated checks** must pass (type check, lint, build)
2. **At least one approval** from a maintainer
3. **No merge conflicts** with main branch
4. **Documentation updated** if needed

## ❓ Questions?

- Open a GitHub Discussion
- Check existing issues
- Reach out to maintainers

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
