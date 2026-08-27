import { NextRequest, NextResponse } from "next/server";
import { saveStrip } from "../../../utils/stripStorage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, origin } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Missing or invalid image data" }, { status: 400 });
    }

    // Generate unique short ID
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const id = `strip_${Date.now()}_${randomSuffix}`;

    const { fileSaved, publicBlobUrl } = await saveStrip(id, image);

    // Base URL determination
    let baseUrl = "https://transium-booth.vercel.app";

    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      baseUrl = origin;
    } else if (process.env.NEXT_PUBLIC_SITE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (origin) {
      baseUrl = origin;
    }

    const directImageUrl = publicBlobUrl || (fileSaved ? `${baseUrl}/uploads/${id}.png` : `${baseUrl}/api/strip/${id}`);

    // Clean direct share URL without external ads
    const shareUrl = publicBlobUrl
      ? `${baseUrl}/strip/${id}?img=${encodeURIComponent(publicBlobUrl)}`
      : `${baseUrl}/strip/${id}`;

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
