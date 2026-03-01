import { z } from "zod";

/**
 * Guest Session Validation Schemas
 */

/**
 * Create guest session validation
 */
export const createGuestSessionSchema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be less than 50 characters"),
  invite_token: z.string().min(1, "Invite token is required"),
});

export type CreateGuestSessionInput = z.infer<typeof createGuestSessionSchema>;