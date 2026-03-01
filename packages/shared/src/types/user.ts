/**
 * User Type Definition
 * Represents a registered user in the system
 */

export interface User {
  /** Unique user identifier (UUID) */
  id: string;

  /** User's full name */
  name: string;

  /** User's email address (unique) */
  email: string;

  /** URL to user's avatar image */
  avatar_url: string | null;

  /** Short bio/description */
  bio: string | null;

  /** Authentication provider used */
  auth_provider: "email" | "google";

  /** Account creation timestamp */
  created_at: string; // ISO 8601 date string

  /** Last update timestamp */
  updated_at: string; // ISO 8601 date string
}

/**
 * Partial user type for updates
 * Only includes fields that can be updated
 */
export type UserUpdate = Partial<Pick<User, "name" | "avatar_url" | "bio">>;

/**
 * Public user profile
 * Limited information visible to other users
 */
export type UserProfile = Pick<User, "id" | "name" | "avatar_url" | "bio">;