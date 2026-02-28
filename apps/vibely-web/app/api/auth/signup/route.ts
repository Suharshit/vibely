import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/signup
 * Create a new user account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // TODO: Implement signup logic with Supabase
    // 1. Validate input with Zod
    // 2. Create user in Supabase Auth
    // 3. Create user profile in database
    // 4. Return user data and session

    return NextResponse.json(
      { message: "Signup endpoint - Not implemented yet" },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}