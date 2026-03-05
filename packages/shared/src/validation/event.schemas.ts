// ============================================================
// packages/shared/validation/event.schemas.ts
// ============================================================
// WHY Zod for validation?
// Zod validates AND transforms data in one step. For example,
// z.coerce.date() converts a string "2025-03-15" to a JS Date
// automatically. It also generates TypeScript types from the
// schema so your request body type is always in sync with
// your validation rules — no duplication.
//
// WHY validate on the server AND client?
// Client validation: instant feedback, better UX
// Server validation: the real security layer — clients can
// always bypass browser validation with a raw HTTP request.
// The Zod schemas here are shared so both sides use identical rules.
// ============================================================

import { z } from "zod";

// ── Create Event ─────────────────────────────────────────────

export const createEventSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be under 100 characters")
    .trim(),

  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .trim()
    .optional()
    .nullable(),

  event_date: z
    .string()
    // ISO 8601 string from form inputs (datetime-local)
    .datetime({ message: "Invalid date format" })
    .refine(
      (val) => new Date(val) > new Date(),
      "Event date must be in the future"
    ),

  expires_at: z
    .string()
    .datetime({ message: "Invalid expiry date format" })
    .optional(), // If omitted, API defaults to event_date + 30 days

  upload_permission: z.enum(["open", "restricted"]).default("open"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

// ── Update Event ─────────────────────────────────────────────

export const updateEventSchema = z.object({
  title: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(500).trim().optional().nullable(),
  event_date: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  upload_permission: z.enum(["open", "restricted"]).optional(),
  status: z.enum(["active", "expired", "archived"]).optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// ── Join Event ───────────────────────────────────────────────

export const joinEventSchema = z.object({
  // Token from the invite URL — validated against DB
  invite_token: z.string().length(12, "Invalid invite token").trim(),
});

export type JoinEventInput = z.infer<typeof joinEventSchema>;
