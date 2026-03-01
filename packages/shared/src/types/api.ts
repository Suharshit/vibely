/**
 * API Response Type Definitions
 * Standard response formats for all API endpoints
 */

/**
 * Standard success response
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

/**
 * Standard error response
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };
}