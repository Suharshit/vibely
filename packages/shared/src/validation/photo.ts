import { z } from "zod";

/**
 * Photo Validation Schemas
 */

/**
 * Photo upload validation (metadata)
 */
export const uploadPhotoSchema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
});

export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>;

/**
 * File validation constraints
 */
export const PHOTO_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "image/webp",
  ],
  MAX_DIMENSION: 8000, // 8000x8000 pixels
};

/**
 * Validate file constraints (runtime check)
 */
export function validatePhotoFile(file: {
  size: number;
  type: string;
}): { valid: boolean; error?: string } {
  if (file.size > PHOTO_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${PHOTO_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (!PHOTO_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${PHOTO_CONSTRAINTS.ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  return { valid: true };
}