import { z } from "zod";

/**
 * User Validation Schemas
 */

/**
 * Update user profile validation
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  avatar_url: z.string().url("Invalid avatar URL").nullable().optional(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .nullable()
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;