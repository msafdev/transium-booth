import { NextRequest, NextResponse } from "next/server";

const DEFAULT_GDRIVE_FOLDER_ID = "1OV1osHIXrRjtaaIt7hX90AkY1AXGdZr6";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, filename, webhookUrl } = body;

    if (!image) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    const targetWebhook = webhookUrl || process.env.GOOGLE_DRIVE_WEBHOOK_URL;
    const finalFilename = filename || `transium-booth-${Date.now()}.png`;

    if (!targetWebhook) {
      return NextResponse.json({
        success: false,
        error: "Google Drive Webhook URL is not configured yet.",
        setupGuideRequired: true,
        folderUrl: `https://drive.google.com/drive/folders/${DEFAULT_GDRIVE_FOLDER_ID}?usp=sharing`,
      });
    }

    // Forward image to Google Apps Script Webhook
    const gdriveRes = await fetch(targetWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image,
        filename: finalFilename,
        folderId: DEFAULT_GDRIVE_FOLDER_ID,
      }),
    });

    if (!gdriveRes.ok) {
      const errText = await gdriveRes.text();
      return NextResponse.json(
        { error: `Google Drive responded with error: ${errText}` },
        { status: 502 }
      );
    }

    const result = await gdriveRes.json();

    return NextResponse.json({
      success: true,
      fileUrl: result.url || result.fileUrl,
      downloadUrl: result.downloadUrl,
      filename: finalFilename,
    });
  } catch (err: unknown) {
    console.error("Google Drive Upload Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload to Google Drive" },
      { status: 500 }
    );
  }
}
