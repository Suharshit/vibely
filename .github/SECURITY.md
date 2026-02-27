# Security Policy

## 🔒 Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### Do NOT

- Open a public GitHub issue
- Discuss the vulnerability in public forums
- Exploit the vulnerability

### Do

1. **Email**: Send details to [suharshit123@gmail.com]
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

3. **Response Time**: We'll acknowledge within 48 hours

## 🛡️ Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🔐 Security Measures

- **Authentication**: Supabase Auth with email and OAuth
- **API Security**: Rate limiting via Upstash Redis
- **Data Storage**: Encrypted at rest (Cloudflare R2)
- **Environment Variables**: Never committed to repository
- **Dependencies**: Regular updates via Dependabot

## 📋 Security Checklist

- [ ] All API routes validate input with Zod
- [ ] Authentication required for sensitive operations
- [ ] Rate limiting on public endpoints
- [ ] CORS properly configured
- [ ] SQL injection prevented (Supabase ORM)
- [ ] XSS prevented (React escaping)
- [ ] CSRF tokens on forms
- [ ] Secrets in environment variables

## 🔄 Update Process

Security updates are prioritized:

1. **Critical**: Patched within 24 hours
2. **High**: Patched within 1 week
3. **Medium**: Patched in next release
4. **Low**: Addressed in regular updates

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/auth-helpers)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)