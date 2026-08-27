import { NextRequest, NextResponse } from "next/server";
import { getStrip } from "../../../../utils/stripStorage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = getStrip(id);
  if (result) {
    if (result.redirectUrl) {
      return NextResponse.redirect(result.redirectUrl, 307);
    }
    if (result.buffer) {
      return new NextResponse(new Uint8Array(result.buffer), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  }

  return NextResponse.json({ error: "Photo strip not found" }, { status: 404 });
}
