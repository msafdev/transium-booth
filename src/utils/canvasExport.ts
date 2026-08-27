import { PhotoItem, StickerPlacement, FrameTheme, PhotoFilter } from "../types/photobooth";

interface ExportOptions {
  photos: PhotoItem[];
  theme: FrameTheme;
  filter: PhotoFilter;
  stickers: StickerPlacement[];
  caption: string;
  showDate: boolean;
  dateText: string;
  scale?: number;
  format?: "image/png" | "image/jpeg" | "image/webp";
  quality?: number;
}

// Helper to safely load an HTMLImageElement without CORS issues
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => reject(e);
      fallbackImg.src = src;
    };
    img.src = src;
  });
}

// Exact layout constants matching PhotoStrip.tsx DOM layout at 1x base
// DOM: max-w-[360px], p-5 (20px), gap-3.5 (14px), aspect 4:3 photos
export const STRIP_BASE_WIDTH = 360;
export const STRIP_BASE_PADDING = 20;
export const STRIP_PHOTO_WIDTH = STRIP_BASE_WIDTH - STRIP_BASE_PADDING * 2; // 320px
export const STRIP_PHOTO_HEIGHT = STRIP_PHOTO_WIDTH * 0.75; // 240px (4:3 ratio)
export const STRIP_PHOTO_GAP = 14; // 14px gap between photos
export const STRIP_HEADER_HEIGHT = 68; // Top padding + logo + margin
export const STRIP_FOOTER_HEIGHT = 64; // Caption + date + bottom padding

// Total exact mathematical height of DOM strip
export const STRIP_BASE_HEIGHT =
  STRIP_BASE_PADDING +
  STRIP_HEADER_HEIGHT +
  STRIP_PHOTO_HEIGHT * 4 +
  STRIP_PHOTO_GAP * 3 +
  STRIP_FOOTER_HEIGHT +
  STRIP_BASE_PADDING; // = 20 + 68 + 960 + 42 + 64 + 20 = 1174px

// Draw a single photobooth strip onto a given CanvasRenderingContext2D (Pixel-perfect to DOM)
export async function renderStripOnCanvas(
  ctx: CanvasRenderingContext2D,
  options: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    photos: PhotoItem[];
    theme: FrameTheme;
    filter: PhotoFilter;
    stickers: StickerPlacement[];
    caption: string;
    showDate: boolean;
    dateText: string;
    loadedImagesMap: Map<string, HTMLImageElement>;
  }
) {
  const { offsetX, offsetY, width, height, photos, theme, filter, stickers, caption, showDate, dateText, loadedImagesMap } = options;

  const scale = width / STRIP_BASE_WIDTH;

  // 1. Draw Strip Background
  ctx.save();
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(offsetX, offsetY, width, height);

  if (theme.borderColor) {
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(offsetX + 1 * scale, offsetY + 1 * scale, width - 2 * scale, height - 2 * scale);
  }
  ctx.restore();

  const padX = STRIP_BASE_PADDING * scale;
  const photoW = STRIP_PHOTO_WIDTH * scale;
  const photoH = STRIP_PHOTO_HEIGHT * scale;
  const photoGap = STRIP_PHOTO_GAP * scale;
  const headerH = STRIP_HEADER_HEIGHT * scale;
  const photoRadius = 10 * scale;

  // 2. Draw 4 Photo Slots FIRST (z-10 layer)
  for (let i = 0; i < 4; i++) {
    const photo = photos[i];
    const photoX = offsetX + padX;
    const photoY = offsetY + padX + headerH + i * (photoH + photoGap);

    ctx.save();

    // Placeholder background
    ctx.fillStyle = "#E2E8F0";
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
    ctx.fill();

    if (photo && photo.dataUrl) {
      const img = loadedImagesMap.get(photo.id);
      if (img) {
        if (filter.canvasFilter && filter.canvasFilter !== "none") {
          ctx.filter = filter.canvasFilter;
        }

        // Object-fit cover math
        const imgAspect = img.width / img.height;
        const targetAspect = photoW / photoH;
        let sWidth = img.width;
        let sHeight = img.height;
        let sx = 0;
        let sy = 0;

        if (imgAspect > targetAspect) {
          sWidth = img.height * targetAspect;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width / targetAspect;
          sy = (img.height - sHeight) / 2;
        }

        // Clip to rounded photo frame
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
        ctx.clip();

        ctx.drawImage(img, sx, sy, sWidth, sHeight, photoX, photoY, photoW, photoH);
      }
    } else {
      ctx.fillStyle = "#94A3B8";
      ctx.font = `bold ${14 * scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Photo ${i + 1}`, photoX + photoW / 2, photoY + photoH / 2);
    }

    ctx.restore();
  }

  // 3. Draw Top Header: Transium Logotype (Tilted -3.5deg, Always on Top with z-30)
  const logotypeImg = loadedImagesMap.get("/assets/transium-logotype.png");
  if (logotypeImg) {
    ctx.save();
    // DOM width: w-52 (208px at base 360px width)
    const logoW = 208 * scale;
    const logoH = (logoW / logotypeImg.width) * logotypeImg.height;
    const logoCenterX = offsetX + width / 2;
    const logoCenterY = offsetY + padX + headerH * 0.52;

    ctx.translate(logoCenterX, logoCenterY);
    ctx.rotate((-3.5 * Math.PI) / 180);

    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 8 * scale;
    ctx.shadowOffsetY = 3 * scale;

    ctx.drawImage(logotypeImg, -logoW / 2, -logoH / 2, logoW, logoH);
    ctx.restore();
  }

  // 4. Draw Scattered & Rotated Stickers (Always on Top with z-40)
  const sortedStickers = [...stickers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const sticker of sortedStickers) {
    const stickerImg = loadedImagesMap.get(sticker.src);
    if (!stickerImg) continue;

    ctx.save();
    const stW = (sticker.widthPercent / 100) * width;
    const stH = (stW / stickerImg.width) * stickerImg.height;

    const stCenterX = offsetX + (sticker.xPercent / 100) * width;
    const stCenterY = offsetY + (sticker.yPercent / 100) * height;

    ctx.translate(stCenterX, stCenterY);
    ctx.rotate((sticker.rotationDeg * Math.PI) / 180);

    ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetY = 4 * scale;

    ctx.drawImage(stickerImg, -stW / 2, -stH / 2, stW, stH);
    ctx.restore();
  }

  // 5. Draw Footer Text (Caption & Timestamp)
  ctx.save();
  const footerAreaY = offsetY + padX + headerH + 4 * photoH + 3 * photoGap;
  const footerCenterY = footerAreaY + (STRIP_FOOTER_HEIGHT * scale) * 0.5;

  ctx.fillStyle = theme.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (caption) {
    ctx.font = `bold ${13 * scale}px sans-serif`;
    ctx.fillText(caption.toUpperCase(), offsetX + width / 2, footerCenterY - (showDate ? 10 * scale : 0));
  }

  if (showDate && dateText) {
    ctx.fillStyle = theme.subtextColor;
    ctx.font = `600 ${10 * scale}px sans-serif`;
    ctx.fillText(dateText, offsetX + width / 2, footerCenterY + (caption ? 12 * scale : 0));
  }
  ctx.restore();
}

// Export single high resolution strip (Exact replica of live preview)
export async function exportPhotoboothStrip(options: ExportOptions): Promise<string> {
  const { photos, theme, filter, stickers, caption, showDate, dateText, scale = 2, format = "image/png", quality = 0.95 } = options;

  const totalWidth = STRIP_BASE_WIDTH * scale;
  const totalHeight = STRIP_BASE_HEIGHT * scale;

  // Preload all needed images safely
  const loadedImagesMap = new Map<string, HTMLImageElement>();

  // Preload logotype
  try {
    const logo = await loadImage("/assets/transium-logotype.png");
    loadedImagesMap.set("/assets/transium-logotype.png", logo);
  } catch (e) {
    console.warn("Could not load logotype asset", e);
  }

  // Preload stickers
  const stickerPromises = stickers.map(async (st) => {
    if (!loadedImagesMap.has(st.src)) {
      try {
        const img = await loadImage(st.src);
        loadedImagesMap.set(st.src, img);
      } catch (e) {
        console.warn("Could not load sticker:", st.src, e);
      }
    }
  });

  // Preload photos
  const photoPromises = photos.map(async (photo) => {
    if (photo && photo.dataUrl) {
      try {
        const img = await loadImage(photo.dataUrl);
        loadedImagesMap.set(photo.id, img);
      } catch (e) {
        console.warn("Could not load photo:", photo.id, e);
      }
    }
  });

  await Promise.allSettled([...stickerPromises, ...photoPromises]);

  // Create canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  canvas.width = totalWidth;
  canvas.height = totalHeight;

  await renderStripOnCanvas(ctx, {
    offsetX: 0,
    offsetY: 0,
    width: totalWidth,
    height: totalHeight,
    photos,
    theme,
    filter,
    stickers,
    caption,
    showDate,
    dateText,
    loadedImagesMap,
  });

  return canvas.toDataURL(format, quality);
}

// Helper to trigger browser download
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
