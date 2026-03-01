# Git Workflow

## Branch Strategy

We follow a simplified Git Flow model:

```
main (production)
  ↑
develop (integration)
  ↑
feature/* (feature branches)
bugfix/* (bug fixes)
hotfix/* (emergency fixes)
```

### Branch Descriptions

- **main**: Production-ready code. Protected branch.
- **develop**: Integration branch. All features merge here first.
- **feature/**: New features (`feature/event-creation`)
- **bugfix/**: Non-critical bug fixes (`bugfix/photo-upload-error`)
- **hotfix/**: Critical production fixes (`hotfix/auth-bypass`)

## Workflow

### Starting a New Feature

```bash
# 1. Update develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Work on your feature
git add .
git commit -m "feat: add my feature"

# 4. Push to remote
git push origin feature/my-feature

# 5. Open PR to develop
```

### Fixing a Bug

```bash
# 1. Create bugfix branch from develop
git checkout develop
git pull origin develop
git checkout -b bugfix/fix-description

# 2. Fix and commit
git add .
git commit -m "fix: resolve issue description"

# 3. Push and open PR
git push origin bugfix/fix-description
```

### Hotfix (Emergency)

```bash
# 1. Create from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 2. Fix, test thoroughly
git add .
git commit -m "fix: critical security issue"

# 3. PR to main AND develop
```

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance
- `test`: Testing
- `chore`: Maintenance
- `ci`: CI/CD changes

### Scopes

- `web`: Web app
- `mobile`: Mobile app
- `shared`: Shared package
- `api`: API routes
- `db`: Database
- `auth`: Authentication
- `ui`: UI components

### Examples

```bash
feat(web): add event creation form
fix(mobile): resolve QR scanner crash on iOS
docs: update API documentation
refactor(shared): simplify type definitions
perf(api): optimize photo upload endpoint
```

## Pull Request Guidelines

1. **Title**: Use conventional commit format
2. **Description**: Use the PR template
3. **Size**: Keep PRs focused and reviewable (<400 lines)
4. **Tests**: Include tests for new features
5. **Documentation**: Update docs if needed
6. **CI**: Ensure all checks pass

## Code Review

### As an Author

- Self-review before requesting review
- Respond to feedback promptly
- Keep discussions professional
- Update based on feedback

### As a Reviewer

- Be constructive and kind
- Ask questions rather than make demands
- Approve when ready, request changes if needed
- Review within 48 hours

## Merging

- **Squash merge** for feature branches (clean history)
- **Merge commit** for release branches (preserve history)
- Delete branch after merge
- Celebrate! 🎉
