import { EXPO_PUBLIC_API_URL } from "@env";

/**
 * API Client for mobile app
 * Communicates with Next.js API routes
 */

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
  }

  /**
   * Make authenticated request
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      // TODO: Add authentication token from storage
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "API request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      // TODO: Add authentication token
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type for FormData - fetch will set it with boundary
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  }
}

export const api = new ApiClient();
