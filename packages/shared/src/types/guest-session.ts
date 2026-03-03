/**
 * Guest Session Type Definition
 * Represents a temporary session for guest photo uploads
 */

export interface GuestSession {
  /** Unique session identifier (UUID) */
  id: string;

  /** Event ID this session is for */
  event_id: string;

  /** Display name of the guest */
  display_name: string;

  /** Unique session token for authentication */
  session_token: string;

  /** Session creation timestamp */
  created_at: string;
}

/**
 * Create guest session payload
 */
export interface GuestSessionCreate {
  event_id: string;
  display_name: string;
  invite_token: string;
}

/**
 * Guest session response
 * Returned when creating a session
 */
export interface GuestSessionResponse extends GuestSession {
  /** Event details */
  event: {
    id: string;
    title: string;
    expires_at: string;
  };
}
