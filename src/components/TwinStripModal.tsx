"use client";

import React from "react";
import { X, Download, Printer } from "lucide-react";
import { PhotoStrip } from "./PhotoStrip";
import { PhotoItem, FrameTheme, PhotoFilter, StickerPlacement } from "../types/photobooth";

interface TwinStripModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoItem[];
  theme: FrameTheme;
  filter: PhotoFilter;
  stickers: StickerPlacement[];
  caption: string;
  showDate: boolean;
  dateText: string;
  onDownload: () => void;
  isDownloading: boolean;
}

export const TwinStripModal: React.FC<TwinStripModalProps> = ({
  isOpen,
  onClose,
  photos,
  theme,
  filter,
  stickers,
  caption,
  showDate,
  dateText,
  onDownload,
  isDownloading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900/90 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col items-center overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-2">
          <Printer className="w-5 h-5 text-amber-400" />
          <span>Twin Print Preview (2-Up Strip)</span>
        </h3>
        <p className="text-xs text-white/70 mb-6 text-center max-w-md">
          Classic double-strip format with center dotted cut-line — perfect for printing and sharing with your friend!
        </p>

        {/* Twin Strips Visual */}
        <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 bg-slate-800/80 p-6 rounded-2xl border border-white/10 overflow-x-auto w-full max-w-2xl">
          {/* Strip 1 */}
          <div className="scale-75 sm:scale-90 origin-top transform-gpu">
            <PhotoStrip
              photos={photos}
              theme={theme}
              filter={filter}
              stickers={stickers}
              caption={caption}
              showDate={showDate}
              dateText={dateText}
            />
          </div>

          {/* Dotted Cut Line */}
          <div className="h-96 border-r-2 border-dashed border-white/40 my-auto" />

          {/* Strip 2 */}
          <div className="scale-75 sm:scale-90 origin-top transform-gpu">
            <PhotoStrip
              photos={photos}
              theme={theme}
              filter={filter}
              stickers={stickers}
              caption={caption}
              showDate={showDate}
              dateText={dateText}
            />
          </div>
        </div>

        {/* Download Action */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="py-3.5 px-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-extrabold text-sm shadow-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? "Preparing Print File..." : "Download Twin Print PNG"}</span>
          </button>
          <button
            onClick={onClose}
            className="py-3.5 px-6 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
