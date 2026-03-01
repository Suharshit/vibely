/**
 * Personal Vault Type Definition
 * Represents a photo saved to a user's personal vault
 */

export interface PersonalVault {
  /** Unique vault entry identifier (UUID) */
  id: string;

  /** User ID who saved the photo */
  user_id: string;

  /** Photo ID that was saved */
  photo_id: string;

  /** When photo was saved to vault */
  saved_at: string;
}

/**
 * Vault entry with photo details
 * Used for displaying vault contents
 */
export interface VaultEntryWithPhoto extends PersonalVault {
  photo: {
    id: string;
    event_id: string;
    url: string;
    thumbnail_url: string;
    original_filename: string;
    created_at: string;
    event: {
      id: string;
      title: string;
    };
  };
}

/**
 * Paginated vault response
 */
export interface VaultResponse {
  entries: VaultEntryWithPhoto[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
