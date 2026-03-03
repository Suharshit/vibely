import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/events/:id/gallery
 * Get all photos for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // TODO: Implement get event gallery
    // 1. Verify user has access to event
    // 2. Fetch photos from database (paginated)
    // 3. Return photos with ImageKit URLs

    return NextResponse.json(
      { message: `Get event ${id} gallery endpoint - Not implemented yet` },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
