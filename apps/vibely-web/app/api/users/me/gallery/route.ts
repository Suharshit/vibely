import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/users/me/gallery
 * Get all photos uploaded by current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get pagination params from query string
    new URL(request.url);

    // TODO: Implement get user gallery
    // 1. Verify authentication
    // 2. Fetch user's photos from database
    // 3. Return paginated photos

    return NextResponse.json(
      { message: "Get user gallery endpoint - Not implemented yet" },
      { status: 501 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
