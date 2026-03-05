// ============================================================
// packages/shared/src/validation/photo.schemas.ts
// ============================================================

import { z } from "zod";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "../utils/storage";

// ── Upload initiation schema ──────────────────────────────────
// Sent by client to POST /api/photos/upload to get an upload URL.
// We validate metadata before accepting the file.

export const uploadInitSchema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename too long"),
  content_type: z.enum(ALLOWED_MIME_TYPES, {
    errorMap: () => ({
      message: "File type not supported. Use JPEG, PNG, WebP, or HEIC.",
    }),
  }),
  file_size: z
    .number()
    .int()
    .positive("File size must be positive")
    .max(MAX_FILE_SIZE_BYTES, "File must be under 10MB"),
  // Optional: guest session token for guest uploads
  guest_token: z.string().optional(),
});

export type UploadInitInput = z.infer<typeof uploadInitSchema>;

// ── Upload completion schema ──────────────────────────────────
// After the file is in storage, client calls this to save metadata.

export const uploadCompleteSchema = z.object({
  photo_id: z.string().min(1),
  event_id: z.string().uuid(),
  storage_key: z.string().min(1),
  original_filename: z.string().min(1),
  file_size: z.number().int().positive(),
  guest_token: z.string().optional(),
});

export type UploadCompleteInput = z.infer<typeof uploadCompleteSchema>;
