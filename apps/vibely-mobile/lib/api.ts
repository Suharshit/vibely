// ============================================================
// apps/mobile/lib/api.ts
// ============================================================
// Generic API client for calling the Next.js API from mobile.
//
// Auth is handled by reading the current Supabase session and
// passing the JWT as a Bearer token. This ensures the Next.js
// API route handlers can call supabase.auth.getUser() and get
// the correct user — exactly like browser cookie-based auth.
//
// NOTE: Most reads go directly to Supabase (see useEvents.ts).
// This client is used for API routes that require the service
// role key (photo uploads, guest sessions, etc.).
// ============================================================

import { supabase } from "@/lib/supabase/client";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * Retrieve the current access token from the Supabase session.
 * Returns an empty string if not authenticated.
 */
async function getAccessToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? "";
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE}/api`;
  }

  /**
   * Make an authenticated request to the Next.js API.
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await getAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        (body as { error?: string }).error ??
          `API request failed (${response.status})`
      );
    }

    return (await response.json()) as T;
  }

  /** GET request */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /** POST request */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /** PATCH request */
  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /** DELETE request */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();
