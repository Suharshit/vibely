import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/login
 * Login existing user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // TODO: Implement login logic with Supabase
    // 1. Validate input with Zod
    // 2. Authenticate with Supabase Auth
    // 3. Return user data and session

    return NextResponse.json(
      { message: "Login endpoint - Not implemented yet" },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}