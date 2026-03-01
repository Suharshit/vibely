import { z } from "zod";

/**
 * Event Validation Schemas
 */

/**
 * Create event validation
 */
export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  cover_image_url: z.string().url("Invalid cover image URL").optional(),
  event_date: z.string().datetime("Invalid event date format"),
  expires_at: z.string().datetime("Invalid expiration date format"),
  upload_permission: z.enum(["open", "restricted"]).default("open"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

/**
 * Update event validation
 */
export const updateEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .nullable()
    .optional(),
  cover_image_url: z
    .string()
    .url("Invalid cover image URL")
    .nullable()
    .optional(),
  event_date: z.string().datetime("Invalid event date format").optional(),
  expires_at: z.string().datetime("Invalid expiration date format").optional(),
  upload_permission: z.enum(["open", "restricted"]).optional(),
  status: z.enum(["active", "expired", "archived"]).optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

/**
 * Join event validation
 */
export const joinEventSchema = z.object({
  invite_token: z.string().min(1, "Invite token is required"),
});

export type JoinEventInput = z.infer<typeof joinEventSchema>;

/**
 * Update member role validation
 */
export const updateMemberRoleSchema = z.object({
  role: z.enum(["host", "contributor", "viewer"], {
    errorMap: () => ({ message: "Invalid role" }),
  }),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
