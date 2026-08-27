import { NextRequest, NextResponse } from "next/server";
import { saveStrip } from "../../../utils/stripStorage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Missing or invalid image data" }, { status: 400 });
    }

    // Generate unique short ID
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const id = `strip_${Date.now()}_${randomSuffix}`;

    const { fileSaved, publicBlobUrl } = await saveStrip(id, image);

    // Determine public base URL
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;

    const shareUrl = `${baseUrl}/strip/${id}`;
    const directImageUrl = publicBlobUrl || (fileSaved ? `${baseUrl}/uploads/${id}.png` : `${baseUrl}/api/strip/${id}`);

    return NextResponse.json({
      success: true,
      id,
      shareUrl,
      imageUrl: directImageUrl,
      createdAt: Date.now(),
    });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process strip upload" },
      { status: 500 }
    );
  }
}
