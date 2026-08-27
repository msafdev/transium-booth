"use client";

import React from "react";
import { StickerPlacement } from "../types/photobooth";

interface StickerScatterProps {
  stickers: StickerPlacement[];
  interactive?: boolean;
}

export const StickerScatter: React.FC<StickerScatterProps> = ({ stickers, interactive = false }) => {
  return (
    <div className="absolute inset-0 z-40 pointer-events-none overflow-visible select-none">
      {stickers.map((sticker) => {
        return (
          <div
            key={sticker.id}
            className={`absolute flex items-center justify-center transition-transform duration-200 ${
              interactive ? "pointer-events-auto cursor-pointer hover:scale-110 active:scale-95" : ""
            }`}
            style={{
              left: `${sticker.xPercent}%`,
              top: `${sticker.yPercent}%`,
              width: `${sticker.widthPercent}%`,
              transform: `translate(-50%, -50%) rotate(${sticker.rotationDeg}deg)`,
              zIndex: 40 + (sticker.zIndex || 10),
              filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.22))",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sticker.src}
              alt={sticker.alt || "Sticker"}
              className="w-full h-auto object-contain block select-none pointer-events-none"
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
};
