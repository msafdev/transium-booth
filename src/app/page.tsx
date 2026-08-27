"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { CameraView } from "../components/CameraView";
import { PhotoStrip } from "../components/PhotoStrip";
import { StudioControls } from "../components/StudioControls";
import { QRCodeModal } from "../components/QRCodeModal";
import { PhotoItem, FrameTheme, PhotoFilter, StickerPlacement } from "../types/photobooth";
import { FRAME_THEMES, PHOTO_FILTERS, DEFAULT_STICKER_PRESETS } from "../constants/photoboothData";
import { exportPhotoboothStrip, downloadDataUrl } from "../utils/canvasExport";
import { Camera, Sparkles, SlidersHorizontal, Image as ImageIcon, Heart, QrCode } from "lucide-react";

export default function PhotoboothPage() {
  // State
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [theme, setTheme] = useState<FrameTheme>(FRAME_THEMES[0]);
  const [filter, setFilter] = useState<PhotoFilter>(PHOTO_FILTERS[0]);
  const [stickers, setStickers] = useState<StickerPlacement[]>(
    DEFAULT_STICKER_PRESETS.default.stickers
  );
  const [showStickers, setShowStickers] = useState<boolean>(true);
  const [caption, setCaption] = useState<string>("TRANSIUM BOOTH");
  const [showDate, setShowDate] = useState<boolean>(true);
  const [dateText, setDateText] = useState<string>("");

  const [activeView, setActiveView] = useState<"capture" | "customize">("capture");
  const [retakeSlotIndex, setRetakeSlotIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // QR Code & Cloud Upload State
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [qrShareUrl, setQrShareUrl] = useState<string>("");
  const [isUploadingCloud, setIsUploadingCloud] = useState<boolean>(false);

  // Initialize date timestamp
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, ".");
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setDateText(`${formattedDate} • ${formattedTime}`);
  }, []);

  // When 4 photos are captured
  const handlePhotosCaptured = (capturedPhotos: PhotoItem[]) => {
    setPhotos(capturedPhotos);
    setActiveView("customize");
    setRetakeSlotIndex(null);

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3673FD", "#FFD166", "#06D6A0", "#EF476F", "#FFFFFF"],
    });
  };

  // When a single photo is retaken
  const handleSinglePhotoCaptured = (photo: PhotoItem, slotIndex: number) => {
    setPhotos((prev) => {
      const updated = [...prev];
      updated[slotIndex] = photo;
      return updated;
    });
    setRetakeSlotIndex(null);
    setActiveView("customize");
  };

  // Trigger retake on a specific slot
  const handleRetakeSlot = (slotIndex: number) => {
    setRetakeSlotIndex(slotIndex);
    setActiveView("capture");
  };

  // Reset all photos & start fresh
  const handleRetakeAll = () => {
    setPhotos([]);
    setRetakeSlotIndex(null);
    setActiveView("capture");
  };

  // Randomize sticker rotations and minor offsets
  const handleRandomizeStickers = () => {
    setStickers((prev) =>
      prev.map((s) => ({
        ...s,
        rotationDeg: Math.floor(Math.random() * 50) - 25, // -25deg to +25deg
        xPercent: Math.max(8, Math.min(92, s.xPercent + (Math.random() * 6 - 3))),
        yPercent: Math.max(5, Math.min(95, s.yPercent + (Math.random() * 4 - 2))),
      }))
    );
  };

  // Switch sticker preset
  const handlePresetChange = (presetKey: string) => {
    const preset = DEFAULT_STICKER_PRESETS[presetKey];
    if (preset) {
      setStickers(preset.stickers);
      setShowStickers(true);
    }
  };

  // Download single strip PNG to local computer
  const handleDownloadSingle = async () => {
    try {
      setIsDownloading(true);
      const dataUrl = await exportPhotoboothStrip({
        photos,
        theme,
        filter,
        stickers: showStickers ? stickers : [],
        caption,
        showDate,
        dateText,
        scale: 2,
        format: "image/png",
      });

      const filename = `transium-booth-${Date.now()}.png`;
      downloadDataUrl(dataUrl, filename);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export photobooth strip. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Upload strip to Cloud / Server and open QR Code Modal
  const handleOpenQRCode = async () => {
    try {
      setIsQRModalOpen(true);
      setIsUploadingCloud(true);
      setQrShareUrl("");

      // Render web-optimized crisp strip for fast upload
      const dataUrl = await exportPhotoboothStrip({
        photos,
        theme,
        filter,
        stickers: showStickers ? stickers : [],
        caption,
        showDate,
        dateText,
        scale: 1.5,
        format: "image/jpeg",
        quality: 0.92,
      });

      // Upload to API
      const res = await fetch("/api/upload-strip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          caption,
          theme: theme.name,
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to upload strip");
      }

      setQrShareUrl(result.shareUrl);

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch (err) {
      console.error("QR upload error:", err);
      alert("Could not generate cloud QR code. Please check your network connection.");
      setIsQRModalOpen(false);
    } finally {
      setIsUploadingCloud(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#3673FD] text-white flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      {/* Background Floating Decorative Assets */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute top-12 left-8 w-12 h-12 opacity-25 animate-float-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/star.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute bottom-20 right-12 w-16 h-16 opacity-20 animate-float-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/star.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute top-1/3 right-8 w-10 h-10 opacity-20 animate-float-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/star.png" alt="" className="w-full h-full object-contain" />
        </div>

        <div className="absolute top-24 right-1/4 w-12 h-12 opacity-25 animate-float-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/confetti-1.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute bottom-1/4 left-10 w-14 h-14 opacity-25 animate-float-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/confetti-2.png" alt="" className="w-full h-full object-contain" />
        </div>

        <div className="absolute bottom-8 left-1/4 w-20 h-20 opacity-15 animate-float-2 hidden sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/transium-logo.png" alt="" className="w-full h-full object-contain" />
        </div>

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      </div>

      {/* Main Header */}
      <header className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/15">
        <div className="flex items-center gap-3">
          <div className="relative w-36 sm:w-44 h-10 sm:h-12 drop-shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/transium-logotype.png"
              alt="Transium"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase text-white shadow-sm border border-white/25">
            Photobooth
          </span>
        </div>

        {/* Top Switcher Tabs (Shoot vs Customize) */}
        <div className="flex items-center gap-2 bg-black/25 p-1.5 rounded-full backdrop-blur-md border border-white/15">
          <button
            onClick={() => setActiveView("capture")}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === "capture"
                ? "bg-white text-[#3673FD] shadow-md"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera {retakeSlotIndex !== null ? `(Retake #${retakeSlotIndex + 1})` : "Mode"}</span>
          </button>

          <button
            onClick={() => setActiveView("customize")}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === "customize"
                ? "bg-white text-[#3673FD] shadow-md"
                : "text-white/80 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Studio & Decorate</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="relative z-10 w-full max-w-5xl my-auto py-6 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12">
        {/* Left Column: Camera Viewfinder (In Capture Mode) or Photobooth Strip (In Customize Mode) */}
        {activeView === "capture" ? (
          <div className="w-full max-w-xl flex flex-col items-center gap-4">
            <CameraView
              onPhotosCaptured={handlePhotosCaptured}
              onSinglePhotoCaptured={handleSinglePhotoCaptured}
              retakeSlotIndex={retakeSlotIndex}
              onCancelRetake={() => {
                setRetakeSlotIndex(null);
                setActiveView("customize");
              }}
              existingPhotos={photos}
            />

            {/* Quick Strip Preview Below Camera */}
            {photos.length > 0 && (
              <div className="w-full flex items-center justify-between bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="font-semibold">{photos.length} Photos ready</span>
                </div>
                <button
                  onClick={() => setActiveView("customize")}
                  className="font-bold underline hover:text-amber-200 cursor-pointer"
                >
                  Go to Customize →
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Customize View: Left is the Strip, Right is the Controls */
          <div className="flex flex-col items-center">
            {/* Header above the strip */}
            <div className="flex items-center justify-between w-full max-w-[360px] pb-3 px-1 gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border border-white/25">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                4-Cut Strip Preview
              </span>
              <button
                onClick={handleOpenQRCode}
                className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black transition-all hover:bg-amber-300 cursor-pointer active:scale-95 shadow-sm"
                title="Scan QR Code to save on phone"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
            </div>

            <PhotoStrip
              photos={photos}
              theme={theme}
              filter={filter}
              stickers={stickers}
              caption={caption}
              showDate={showDate}
              dateText={dateText}
              onRetakeSlot={handleRetakeSlot}
              showStickers={showStickers}
            />
          </div>
        )}

        {/* Right Column: Studio Controls or Live Strip Thumbnail */}
        {activeView === "capture" ? (
          <div className="w-full max-w-sm hidden lg:flex flex-col items-center">
            <div className="w-full max-w-[340px] flex items-center justify-between pb-2 px-1 text-xs font-bold text-white/80">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-white" />
                <span>Strip Preview</span>
              </span>
              {photos.length > 0 && (
                <span className="text-amber-300 text-[11px] font-semibold">{photos.length}/4 Shots</span>
              )}
            </div>
            <div className="scale-90 origin-top">
              <PhotoStrip
                photos={photos}
                theme={theme}
                filter={filter}
                stickers={stickers}
                caption={caption}
                showDate={showDate}
                dateText={dateText}
                showStickers={showStickers}
              />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md lg:max-w-lg flex flex-col gap-4">
            <StudioControls
              currentTheme={theme}
              onThemeChange={setTheme}
              currentFilter={filter}
              onFilterChange={setFilter}
              caption={caption}
              onCaptionChange={setCaption}
              showDate={showDate}
              onShowDateToggle={setShowDate}
              dateText={dateText}
              onDateTextChange={setDateText}
              showStickers={showStickers}
              onShowStickersToggle={setShowStickers}
              onRandomizeStickers={handleRandomizeStickers}
              onPresetChange={handlePresetChange}
              onDownloadSingle={handleDownloadSingle}
              onOpenQRCode={handleOpenQRCode}
              onRetakeAll={handleRetakeAll}
              isDownloading={isDownloading}
              isUploadingQR={isUploadingCloud}
            />
          </div>
        )}
      </section>

      {/* QR Code Modal for Mobile Scan & Cloud Save */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        shareUrl={qrShareUrl}
        isUploading={isUploadingCloud}
      />

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl pt-4 pb-2 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs text-white/70 gap-2">
        <p>© {new Date().getFullYear()} Transium Photobooth • Saved to local device & mobile QR</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for joyful memories
        </p>
      </footer>
    </main>
  );
}
