"use client";

import React from "react";
import { PhotoItem, FrameTheme, PhotoFilter, StickerPlacement } from "../types/photobooth";
import { StickerScatter } from "./StickerScatter";
import { RotateCcw } from "lucide-react";

interface PhotoStripProps {
  photos: PhotoItem[];
  theme: FrameTheme;
  filter: PhotoFilter;
  stickers: StickerPlacement[];
  caption: string;
  showDate: boolean;
  dateText: string;
  onRetakeSlot?: (slotIndex: number) => void;
  showStickers?: boolean;
}

export const PhotoStrip: React.FC<PhotoStripProps> = ({
  photos,
  theme,
  filter,
  stickers,
  caption,
  showDate,
  dateText,
  onRetakeSlot,
  showStickers = true,
}) => {
  return (
    <div
      id="photobooth-strip-container"
      className="relative w-full max-w-[340px] sm:max-w-[360px] mx-auto rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] p-4 sm:p-5 flex flex-col items-center select-none transition-colors duration-300"
      style={{
        backgroundColor: theme.bgColor,
        border: theme.borderColor ? `1.5px solid ${theme.borderColor}` : "1.5px solid rgba(255,255,255,0.15)",
      }}
    >
      {/* 1. Top Header: Transium Logotype (Always on Top with z-30) */}
      <div className="relative z-30 w-full flex justify-center items-center pt-2 pb-3 pointer-events-none">
        <div
          className="relative w-48 sm:w-52 h-12 transition-transform duration-300 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
          style={{
            transform: "rotate(-3.5deg)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/transium-logotype.png"
            alt="Transium"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* 2. Four Photo Slots (z-10) */}
      <div className="relative z-10 w-full flex flex-col gap-3 sm:gap-3.5">
        {[0, 1, 2, 3].map((index) => {
          const photo = photos[index];

          return (
            <div
              key={index}
              className="group relative w-full aspect-[4/3] bg-slate-200/90 rounded-lg overflow-hidden shadow-inner border border-black/10 flex items-center justify-center"
            >
              {photo && photo.dataUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.dataUrl}
                    alt={`Shot ${index + 1}`}
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{
                      filter: filter.cssFilter,
                    }}
                  />
                  {onRetakeSlot && (
                    <button
                      onClick={() => onRetakeSlot(index)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs sm:text-sm backdrop-blur-[2px] cursor-pointer z-20"
                      title={`Retake Photo ${index + 1}`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake #{index + 1}</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-400/60 flex items-center justify-center text-xs font-bold text-slate-500">
                    {index + 1}
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Photo {index + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Scattered & Rotated Stickers (Always on Top with z-40) */}
      {showStickers && <StickerScatter stickers={stickers} />}

      {/* 4. Bottom Footer: Caption & Date (z-30) */}
      <div className="relative z-30 w-full flex flex-col items-center justify-center pt-4 pb-2 text-center gap-1">
        {caption && (
          <p
            className="font-black text-xs sm:text-sm tracking-widest uppercase transition-colors drop-shadow-sm"
            style={{ color: theme.textColor }}
          >
            {caption}
          </p>
        )}
        {showDate && (
          <p
            className="font-semibold text-[10px] sm:text-xs tracking-wider opacity-90 transition-colors drop-shadow-sm"
            style={{ color: theme.subtextColor }}
          >
            {dateText}
          </p>
        )}
      </div>
    </div>
  );
};
