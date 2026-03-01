/**
 * Application Configuration Constants
 */

export const APP_CONFIG = {
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Photo constraints
  PHOTO: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_DIMENSION: 8000, // 8000x8000 pixels
    THUMBNAIL_WIDTH: 300,
    THUMBNAIL_HEIGHT: 300,
  },

  // Event defaults
  EVENT: {
    DEFAULT_EXPIRATION_DAYS: 7,
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
  },

  // Token lengths
  TOKEN: {
    INVITE_TOKEN_LENGTH: 12,
    SESSION_TOKEN_LENGTH: 32,
  },

  // Rate limiting
  RATE_LIMIT: {
    AUTHENTICATED: 100, // requests per minute
    GUEST: 50, // requests per minute
    UPLOAD: 10, // uploads per minute
  },
} as const;