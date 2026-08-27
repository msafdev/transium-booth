import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

// In-memory cache fallback for local/dev and serverless invocations
const memoryStore = new Map<string, { dataUrl: string; blobUrl?: string; createdAt: number }>();

export async function saveStrip(
  id: string,
  dataUrl: string
): Promise<{ success: boolean; fileSaved: boolean; publicBlobUrl?: string }> {
  let fileSaved = false;
  let publicBlobUrl: string | undefined;

  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // 1. If Vercel Blob token is configured, upload directly to Vercel Blob CDN (Fast & Persistent)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`strips/${id}.png`, buffer, {
        access: "public",
        contentType: "image/png",
      });
      publicBlobUrl = blob.url;
    } catch (blobErr) {
      console.warn("Vercel Blob upload failed, falling back to local/memory:", blobErr);
    }
  }

  // 2. Try writing to public/uploads (for local server / Node hosting)
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, `${id}.png`);
    fs.writeFileSync(filePath, buffer);
    fileSaved = true;
  } catch {
    // Expected in read-only serverless
  }

  // 3. Keep in memory store
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

  // 1. Try reading from filesystem
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", `${id}.png`);
    if (fs.existsSync(filePath)) {
      return { buffer: fs.readFileSync(filePath) };
    }
  } catch {
    // Fallback to memory
  }

  // 2. Try memory store
  if (stored?.dataUrl) {
    const base64Data = stored.dataUrl.replace(/^data:image\/\w+;base64,/, "");
    return { buffer: Buffer.from(base64Data, "base64") };
  }

  return null;
}
