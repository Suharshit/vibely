/**
 * Event Member Type Definition
 * Represents a user's membership in an event
 */

export type MemberRole = "host" | "contributor" | "viewer";

export interface EventMember {
  /** Unique member record identifier (UUID) */
  id: string;

  /** Event ID this membership belongs to */
  event_id: string;

  /** User ID of the member */
  user_id: string;

  /** Member's role in the event */
  role: MemberRole;

  /** When user joined the event */
  joined_at: string;

  /** Whether this is a guest user (vs registered user) */
  is_guest: boolean;
}

/**
 * Event member with user details
 * Used for displaying member lists
 */
export interface EventMemberWithUser extends EventMember {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

/**
 * Update member role payload
 */
export interface UpdateMemberRole {
  role: MemberRole;
}
