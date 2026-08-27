import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

// In-memory cache fallback for server instances
const memoryStore = new Map<string, { dataUrl: string; blobUrl?: string; createdAt: number }>();

function getUploadDir(): string {
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return path.join("/tmp", "transium_uploads");
  }
  return path.join(process.cwd(), "public", "uploads");
}

export async function saveStrip(
  id: string,
  dataUrl: string
): Promise<{ success: boolean; fileSaved: boolean; publicBlobUrl?: string }> {
  let fileSaved = false;
  let publicBlobUrl: string | undefined;

  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // 1. If Vercel Blob token is configured in Vercel project, upload to official Vercel Blob CDN
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`strips/${id}.png`, buffer, {
        access: "public",
        contentType: "image/png",
      });
      publicBlobUrl = blob.url;
    } catch (blobErr) {
      console.warn("Vercel Blob upload failed:", blobErr);
    }
  }

  // 2. Write to local server disk cache (/tmp or public/uploads)
  try {
    const uploadsDir = getUploadDir();
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, `${id}.png`);
    fs.writeFileSync(filePath, buffer);
    fileSaved = true;
  } catch (fsErr) {
    console.warn("Could not write to disk cache:", fsErr);
  }

  // 3. Keep in memory cache
  memoryStore.set(id, {
    dataUrl,
    blobUrl: publicBlobUrl,
    createdAt: Date.now(),
  });

  return { success: true, fileSaved, publicBlobUrl };
}

export function getStrip(id: string): { buffer?: Buffer; redirectUrl?: string } | null {
  const stored = memoryStore.get(id);
  if (stored?.blobUrl) {
    return { redirectUrl: stored.blobUrl };
  }

  // 1. Try reading from disk (/tmp/transium_uploads or public/uploads)
  try {
    const uploadsDir = getUploadDir();
    const filePath = path.join(uploadsDir, `${id}.png`);
    if (fs.existsSync(filePath)) {
      return { buffer: fs.readFileSync(filePath) };
    }
  } catch {
    // Fallback
  }

  try {
    const fallbackPath = path.join(process.cwd(), "public", "uploads", `${id}.png`);
    if (fs.existsSync(fallbackPath)) {
      return { buffer: fs.readFileSync(fallbackPath) };
    }
  } catch {
    // Fallback
  }

  // 2. Try memory
  if (stored?.dataUrl) {
    const base64Data = stored.dataUrl.replace(/^data:image\/\w+;base64,/, "");
    return { buffer: Buffer.from(base64Data, "base64") };
  }

  return null;
}
