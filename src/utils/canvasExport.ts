import { PhotoItem, StickerPlacement, FrameTheme, PhotoFilter } from "../types/photobooth";

interface ExportOptions {
  photos: PhotoItem[];
  theme: FrameTheme;
  filter: PhotoFilter;
  stickers: StickerPlacement[];
  caption: string;
  showDate: boolean;
  dateText: string;
  isTwin?: boolean;
}

// Helper to load an HTMLImageElement
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Draw a single photobooth strip onto a given CanvasRenderingContext2D
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

  // 1. Draw Background
  ctx.save();
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(offsetX, offsetY, width, height);

  // If theme has border
  if (theme.borderColor) {
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX + 1.5, offsetY + 1.5, width - 3, height - 3);
  }
  ctx.restore();

  // 2. Dimensions & Layout constants matching preview
  const padX = width * 0.065; // horizontal margin
  const photoW = width - padX * 2;
  const photoH = photoW * 0.75; // 4:3 landscape ratio per photo

  const headerH = height * 0.085; // ~8.5% for top header
  const footerH = height * 0.09; // ~9% for bottom caption/date
  const availablePhotoArea = height - headerH - footerH;
  const photoGap = (availablePhotoArea - photoH * 4) / 5;

  // 3. Draw Photos FIRST (So that logo and stickers always sit on top!)
  for (let i = 0; i < 4; i++) {
    const photo = photos[i];
    const photoX = offsetX + padX;
    const photoY = offsetY + headerH + photoGap + i * (photoH + photoGap);

    ctx.save();

    // Draw photo background placeholder
    ctx.fillStyle = "#E2E8F0";
    const radius = 12;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, radius);
    ctx.fill();

    if (photo && photo.dataUrl) {
      const img = loadedImagesMap.get(photo.id);
      if (img) {
        // Apply filter to context
        if (filter.canvasFilter && filter.canvasFilter !== "none") {
          ctx.filter = filter.canvasFilter;
        }

        // Draw with object-fit cover
        const imgAspect = img.width / img.height;
        const targetAspect = photoW / photoH;
        let sWidth = img.width;
        let sHeight = img.height;
        let sx = 0;
        let sy = 0;

        if (imgAspect > targetAspect) {
          // Source is wider
          sWidth = img.height * targetAspect;
          sx = (img.width - sWidth) / 2;
        } else {
          // Source is taller
          sHeight = img.width / targetAspect;
          sy = (img.height - sHeight) / 2;
        }

        // Clip to rounded rect
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoW, photoH, radius);
        ctx.clip();

        ctx.drawImage(img, sx, sy, sWidth, sHeight, photoX, photoY, photoW, photoH);
      }
    } else {
      // Empty slot placeholder
      ctx.fillStyle = "#94A3B8";
      ctx.font = `bold ${width * 0.038}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Photo ${i + 1}`, photoX + photoW / 2, photoY + photoH / 2);
    }

    ctx.restore();
  }

  // 4. Draw Top Header: Transium Logotype (ON TOP of background & photos)
  const logotypeImg = loadedImagesMap.get("/assets/transium-logotype.png");
  if (logotypeImg) {
    ctx.save();
    const logoW = width * 0.64;
    const logoH = (logoW / logotypeImg.width) * logotypeImg.height;
    const logoCenterX = offsetX + width / 2;
    const logoCenterY = offsetY + headerH * 0.58;

    ctx.translate(logoCenterX, logoCenterY);
    ctx.rotate((-3.5 * Math.PI) / 180); // Tilted ~ -3.5 degrees

    // Drop shadow for logo
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.drawImage(logotypeImg, -logoW / 2, -logoH / 2, logoW, logoH);
    ctx.restore();
  }

  // 5. Draw Scattered & Rotated Stickers / Badges (ALWAYS ON TOP of photos and borders)
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

    // Realistic sticker drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;

    ctx.drawImage(stickerImg, -stW / 2, -stH / 2, stW, stH);
    ctx.restore();
  }

  // 6. Draw Footer Text (Caption & Timestamp)
  ctx.save();
  const footerCenterY = offsetY + height - footerH * 0.52;

  ctx.fillStyle = theme.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (caption) {
    ctx.font = `bold ${width * 0.034}px sans-serif`;
    ctx.fillText(caption.toUpperCase(), offsetX + width / 2, footerCenterY - (showDate ? height * 0.012 : 0));
  }

  if (showDate && dateText) {
    ctx.fillStyle = theme.subtextColor;
    ctx.font = `600 ${width * 0.024}px sans-serif`;
    ctx.fillText(dateText, offsetX + width / 2, footerCenterY + (caption ? height * 0.014 : 0));
  }
  ctx.restore();
}

// Export high resolution single or twin strip
export async function exportPhotoboothStrip(options: ExportOptions): Promise<string> {
  const { photos, theme, filter, stickers, caption, showDate, dateText, isTwin = false } = options;

  // Single strip base resolution
  const singleWidth = 640;
  const singleHeight = 1920; // 1:3 ratio classic 4-cut photobooth strip
  const scaleFactor = 2; // 2x DPR for ultra crisp print quality

  // Preload all needed images
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

  await Promise.all([...stickerPromises, ...photoPromises]);

  // Create canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  if (isTwin) {
    const gutter = 36;
    const totalW = (singleWidth * 2 + gutter * 3) * scaleFactor;
    const totalH = (singleHeight + gutter * 2) * scaleFactor;

    canvas.width = totalW;
    canvas.height = totalH;
    ctx.scale(scaleFactor, scaleFactor);

    // Canvas background
    ctx.fillStyle = "#F3F4F6";
    ctx.fillRect(0, 0, totalW / scaleFactor, totalH / scaleFactor);

    // Strip 1 (Left)
    await renderStripOnCanvas(ctx, {
      offsetX: gutter,
      offsetY: gutter,
      width: singleWidth,
      height: singleHeight,
      photos,
      theme,
      filter,
      stickers,
      caption,
      showDate,
      dateText,
      loadedImagesMap,
    });

    // Strip 2 (Right)
    await renderStripOnCanvas(ctx, {
      offsetX: singleWidth + gutter * 2,
      offsetY: gutter,
      width: singleWidth,
      height: singleHeight,
      photos,
      theme,
      filter,
      stickers,
      caption,
      showDate,
      dateText,
      loadedImagesMap,
    });

    // Draw center cut dotted line
    ctx.save();
    ctx.strokeStyle = "#9CA3AF";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    const cutLineX = singleWidth + gutter * 1.5;
    ctx.beginPath();
    ctx.moveTo(cutLineX, gutter / 2);
    ctx.lineTo(cutLineX, singleHeight + gutter * 1.5);
    ctx.stroke();
    ctx.restore();
  } else {
    canvas.width = singleWidth * scaleFactor;
    canvas.height = singleHeight * scaleFactor;
    ctx.scale(scaleFactor, scaleFactor);

    await renderStripOnCanvas(ctx, {
      offsetX: 0,
      offsetY: 0,
      width: singleWidth,
      height: singleHeight,
      photos,
      theme,
      filter,
      stickers,
      caption,
      showDate,
      dateText,
      loadedImagesMap,
    });
  }

  return canvas.toDataURL("image/png", 1.0);
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
