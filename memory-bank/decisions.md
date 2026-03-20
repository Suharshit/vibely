# Decisions: Vibely

## Upload Strategy

**Signed URL Uploads**: Clients upload directly to Supabase Storage using signed URLs to bypass Next.js server limits and reduce latency.

## CDN Choice

**ImageKit**: Selected for easy real-time transformations (blur, resize) and efficient global delivery.

## Rate Limiting

**Upstash Redis**: Used for global, serverless rate limiting on sensitive endpoints (upload, session creation) to prevent abuse.

## Data Lifecycle

**pg_cron + Edge Functions**: Automated cleanup of expired events and soft-deleted photos to manage storage costs and privacy.

## Shared Logic

**Packages/Shared**: All validation (Zod) and entity types reside in a shared package to prevent drift between Web and Mobile.
