/**
 * Photo Type Definition
 * Represents a photo uploaded to an event
 */

export type PhotoStatus = "active" | "deleted" | "archived";

export interface Photo {
  /** Unique photo identifier (UUID) */
  id: string;

  /** Event ID this photo belongs to */
  event_id: string;

  /** User ID who uploaded (if registered user) */
  uploaded_by_user: string | null;

  /** Guest session ID who uploaded (if guest) */
  uploaded_by_guest: string | null;

  /** Storage key in Cloudflare R2 */
  storage_key: string;

  /** Thumbnail storage key in R2 */
  thumbnail_key: string;

  /** Original filename */
  original_filename: string;

  /** File size in bytes */
  file_size: number;

  /** Current photo status */
  status: PhotoStatus;

  /** Whether photo is saved to any user's vault */
  is_saved_to_vault: boolean;

  /** Upload timestamp */
  created_at: string;

  /** Deletion timestamp (if deleted) */
  deleted_at: string | null;
}

/**
 * Photo with URLs
 * Includes ImageKit CDN URLs for display
 */
export interface PhotoWithUrls extends Photo {
  /** Full-size image URL (via ImageKit) */
  url: string;

  /** Thumbnail URL (via ImageKit) */
  thumbnail_url: string;

  /** Uploader information */
  uploader: {
    type: "user" | "guest";
    name: string;
    avatar_url?: string | null;
  };
}

/**
 * Photo upload response
 */
export interface PhotoUploadResponse {
  id: string;
  url: string;
  thumbnail_url: string;
  uploaded_at: string;
}

/**
 * Paginated photos response
 */
export interface PhotosResponse {
  photos: PhotoWithUrls[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}