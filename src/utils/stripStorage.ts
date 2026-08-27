import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

// In-memory cache fallback for local/serverless
const memoryStore = new Map<string, { dataUrl: string; blobUrl?: string; createdAt: number }>();

function getUploadDir(): string {
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return path.join("/tmp", "transium_uploads");
  }
  return path.join(process.cwd(), "public", "uploads");
}

// Upload to ImgBB free cloud host as automated global CDN
async function uploadToImgBB(base64Data: string): Promise<string | undefined> {
  try {
    const apiKey = process.env.IMGBB_API_KEY || "c2b4cbe4580bfb9f62624d673f8d9b1c"; // Public photobooth upload key
    const formData = new FormData();
    formData.append("image", base64Data);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.url) {
        return data.data.url;
      }
    }
  } catch (err) {
    console.warn("ImgBB free cloud upload fallback failed:", err);
  }
  return undefined;
}

export async function saveStrip(
  id: string,
  dataUrl: string
): Promise<{ success: boolean; fileSaved: boolean; publicBlobUrl?: string }> {
  let fileSaved = false;
  let publicBlobUrl: string | undefined;

  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // 1. If Vercel Blob token is configured, use Vercel Blob CDN
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`strips/${id}.png`, buffer, {
        access: "public",
        contentType: "image/png",
      });
      publicBlobUrl = blob.url;
    } catch (blobErr) {
      console.warn("Vercel Blob upload failed, trying cloud fallback:", blobErr);
    }
  }

  // 2. If no Vercel Blob, upload to free global cloud CDN (ImgBB) so all phones can access
  if (!publicBlobUrl) {
    publicBlobUrl = await uploadToImgBB(base64Data);
  }

  // 3. Try writing to local disk cache (/tmp or public/uploads)
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

  // 4. Store in memory
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

  // 1. Try reading from disk
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
