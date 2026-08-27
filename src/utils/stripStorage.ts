import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

// In-memory cache fallback
const memoryStore = new Map<string, { dataUrl: string; blobUrl?: string; createdAt: number }>();

function getUploadDir(): string {
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return path.join("/tmp", "transium_uploads");
  }
  return path.join(process.cwd(), "public", "uploads");
}

// Upload to free cloud image host so any phone scanning the QR code gets the image immediately
async function uploadToCloudHost(base64Data: string): Promise<string | undefined> {
  // Method 1: ImgBB Public API
  try {
    const apiKeys = [
      "c2b4cbe4580bfb9f62624d673f8d9b1c",
      "6d207e02198a847aa5ad3ac2292fc10a",
      "0bc5b4a8e3d09a25ce2521f57422f281",
    ];

    for (const key of apiKeys) {
      try {
        const formData = new FormData();
        formData.append("image", base64Data);

        const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.data?.url) {
            return data.data.url;
          }
        }
      } catch {
        // Try next key
      }
    }
  } catch (err) {
    console.warn("ImgBB upload failed:", err);
  }

  // Method 2: tmpfiles.org upload API fallback
  try {
    const buffer = Buffer.from(base64Data, "base64");
    const blob = new Blob([buffer], { type: "image/png" });
    const formData = new FormData();
    formData.append("file", blob, "transium-strip.png");

    const res = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.url) {
        // Convert https://tmpfiles.org/123/file.png to direct download URL https://tmpfiles.org/dl/123/file.png
        const directUrl = data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
        return directUrl;
      }
    }
  } catch (err) {
    console.warn("TmpFiles upload fallback failed:", err);
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

  // 1. If Vercel Blob token is configured in Vercel project, use it
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

  // 2. Upload to Cloud Host CDN
  if (!publicBlobUrl) {
    publicBlobUrl = await uploadToCloudHost(base64Data);
  }

  // 3. Write to local /tmp or public disk cache
  try {
    const uploadsDir = getUploadDir();
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, `${id}.png`);
    fs.writeFileSync(filePath, buffer);
    fileSaved = true;
  } catch (fsErr) {
    console.warn("Could not write to disk:", fsErr);
  }

  // 4. Memory store
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
