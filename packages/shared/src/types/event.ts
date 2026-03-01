/**
 * Event Type Definition
 * Represents a photo-sharing event
 */

export type EventStatus = "active" | "expired" | "archived";
export type UploadPermission = "open" | "restricted";

export interface Event {
  /** Unique event identifier (UUID) */
  id: string;

  /** Event title */
  title: string;

  /** Event description */
  description: string | null;

  /** URL to event cover image */
  cover_image_url: string | null;

  /** User ID of event host */
  host_id: string;

  /** Unique invite token for joining event */
  invite_token: string;

  /** Scheduled event date/time */
  event_date: string; // ISO 8601 date string

  /** When photos will be auto-deleted */
  expires_at: string; // ISO 8601 date string

  /** Current event status */
  status: EventStatus;

  /** Who can upload photos */
  upload_permission: UploadPermission;

  /** Event creation timestamp */
  created_at: string;

  /** Last update timestamp */
  updated_at: string;
}

/**
 * Event creation payload
 * Fields required to create a new event
 */
export interface EventCreate {
  title: string;
  description?: string;
  cover_image_url?: string;
  event_date: string;
  expires_at: string;
  upload_permission?: UploadPermission;
}

/**
 * Event update payload
 * Fields that can be updated
 */
export type EventUpdate = Partial<
  Pick<
    Event,
    | "title"
    | "description"
    | "cover_image_url"
    | "event_date"
    | "expires_at"
    | "upload_permission"
    | "status"
  >
>;

/**
 * Event with additional computed fields
 * Used for displaying events with extra info
 */
export interface EventWithDetails extends Event {
  /** Number of photos in event */
  photo_count: number;

  /** Number of members */
  member_count: number;

  /** Host user profile */
  host: {
    id: string;
    name: string;
    avatar_url: string | null;
  };

  /** Whether current user is a member */
  is_member?: boolean;

  /** Current user's role in event */
  user_role?: "host" | "contributor" | "viewer";
}
