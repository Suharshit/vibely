import { NextResponse } from "next/server";

/**
 * POST /api/auth/google
 * OAuth login with Google
 */
export async function POST() {
  try {
    // TODO: Implement Google OAuth with Supabase
    // 1. Initiate OAuth flow with Supabase
    // 2. Handle callback
    // 3. Return user data and session

    return NextResponse.json(
      { message: "Google OAuth endpoint - Not implemented yet" },
      { status: 501 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
