import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/events/:id/members
 * Get all members of an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Implement get event members
    // 1. Verify user has access to event
    // 2. Fetch members from database
    // 3. Return member list with roles

    return NextResponse.json(
      { message: `Get event ${id} members endpoint - Not implemented yet` },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
