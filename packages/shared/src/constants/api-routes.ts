/**
 * API Routes Constants
 * Centralized API endpoint definitions
 */

export const API_ROUTES = {
  // Auth endpoints
  AUTH: {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    GOOGLE: "/api/auth/google",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
  },

  // User endpoints
  USER: {
    ME: "/api/users/me",
    GALLERY: "/api/users/me/gallery",
  },

  // Event endpoints
  EVENTS: {
    BASE: "/api/events",
    BY_ID: (id: string) => `/api/events/${id}`,
    GALLERY: (id: string) => `/api/events/${id}/gallery`,
    MEMBERS: (id: string) => `/api/events/${id}/members`,
    JOIN: (id: string) => `/api/events/${id}/join`,
    LEAVE: (id: string) => `/api/events/${id}/leave`,
    MEMBER_ROLE: (eventId: string, userId: string) =>
      `/api/events/${eventId}/members/${userId}`,
    INVITE: (id: string) => `/api/events/${id}/invite`,
    EXPIRE: (id: string) => `/api/events/${id}/expire`,
  },

  // Guest endpoints
  GUEST: {
    SESSION: "/api/guest/session",
    SESSION_BY_TOKEN: (token: string) => `/api/guest/session/${token}`,
  },

  // Photo endpoints
  PHOTOS: {
    UPLOAD: "/api/photos/upload",
    BY_ID: (id: string) => `/api/photos/${id}`,
    SAVE: (id: string) => `/api/photos/${id}/save`,
  },

  // Vault endpoints
  VAULT: {
    BASE: "/api/vault",
  },
} as const;
