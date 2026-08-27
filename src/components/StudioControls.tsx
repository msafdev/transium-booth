"use client";

import React, { useState } from "react";
import { FrameTheme, PhotoFilter, StickerPlacement } from "../types/photobooth";
import { FRAME_THEMES, PHOTO_FILTERS, DEFAULT_STICKER_PRESETS } from "../constants/photoboothData";
import {
  Palette,
  Sparkles,
  Sliders,
  Type,
  Download,
  Shuffle,
  RotateCcw,
  Check,
  FileImage,
  QrCode,
  Smartphone,
  CheckCircle2,
  Wand2,
  Calendar,
  Share2,
} from "lucide-react";

interface StudioControlsProps {
  currentTheme: FrameTheme;
  onThemeChange: (theme: FrameTheme) => void;
  currentFilter: PhotoFilter;
  onFilterChange: (filter: PhotoFilter) => void;
  caption: string;
  onCaptionChange: (caption: string) => void;
  showDate: boolean;
  onShowDateToggle: (val: boolean) => void;
  dateText: string;
  onDateTextChange: (val: string) => void;
  showStickers: boolean;
  onShowStickersToggle: (val: boolean) => void;
  onRandomizeStickers: () => void;
  onPresetChange: (presetKey: string) => void;
  onDownloadSingle: () => void;
  onOpenQRCode: () => void;
  onRetakeAll: () => void;
  isDownloading: boolean;
  isUploadingQR: boolean;
}

type TabType = "theme" | "filters" | "stickers" | "text" | "export";

export const StudioControls: React.FC<StudioControlsProps> = ({
  currentTheme,
  onThemeChange,
  currentFilter,
  onFilterChange,
  caption,
  onCaptionChange,
  showDate,
  onShowDateToggle,
  dateText,
  onDateTextChange,
  showStickers,
  onShowStickersToggle,
  onRandomizeStickers,
  onPresetChange,
  onDownloadSingle,
  onOpenQRCode,
  onRetakeAll,
  isDownloading,
  isUploadingQR,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("theme");

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "theme", label: "Frame", icon: Palette },
    { id: "filters", label: "Filters", icon: Sliders },
    { id: "stickers", label: "Stickers", icon: Sparkles },
    { id: "text", label: "Text", icon: Type },
    { id: "export", label: "Save", icon: Share2 },
  ];

  return (
    <div className="w-full bg-slate-950/75 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/20 text-white flex flex-col gap-5 transition-all">
      {/* Top Segmented Navigation Tabs */}
      <div className="grid grid-cols-5 gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/10">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-2.5 px-1 rounded-xl text-xs sm:text-sm font-black flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer select-none ${
                isActive
                  ? t.id === "export"
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg scale-[1.02]"
                    : "bg-white text-[#3673FD] shadow-lg scale-[1.02]"
                  : t.id === "export"
                  ? "text-amber-300 hover:text-white hover:bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="leading-none">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Frame Theme Color */}
      {activeTab === "theme" && (
        <div className="flex flex-col gap-3.5 animate-pop-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-300" />
              Choose Frame Color
            </span>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/15">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: currentTheme.bgColor }}
              />
              <span className="text-xs font-bold text-amber-300">{currentTheme.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FRAME_THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme)}
                  className={`group relative p-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-amber-400 bg-white/20 shadow-xl scale-[1.04]"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25"
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-2xl shadow-lg flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
                    style={{
                      backgroundColor: theme.bgColor,
                      border: theme.borderColor ? `2px solid ${theme.borderColor}` : "1.5px solid rgba(0,0,0,0.15)",
                    }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-6 h-6 filter drop-shadow font-black ${
                          theme.bgColor === "#FFFFFF" ||
                          theme.bgColor === "#FEF3C7" ||
                          theme.bgColor === "#BFDBFE" ||
                          theme.bgColor === "#FBCFE8" ||
                          theme.bgColor === "#D1E7DD"
                            ? "text-slate-950"
                            : "text-white"
                        }`}
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-white text-center leading-tight">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Photo Tone Filters */}
      {activeTab === "filters" && (
        <div className="flex flex-col gap-3.5 animate-pop-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-amber-300" />
              Photo Tone & Filter
            </span>
            <span className="text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
              {currentFilter.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PHOTO_FILTERS.map((f) => {
              const isSelected = f.id === currentFilter.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onFilterChange(f)}
                  className={`p-3 rounded-2xl flex flex-col items-start gap-1 border-2 transition-all cursor-pointer text-left ${
                    isSelected
                      ? "border-amber-400 bg-white/20 shadow-xl scale-[1.03]"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black text-white">{f.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />}
                  </div>
                  <span className="text-[10px] text-white/70 leading-tight">{f.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Stickers & Assets */}
      {activeTab === "stickers" && (
        <div className="flex flex-col gap-3.5 animate-pop-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Stickers & Badges
            </span>
            <button
              onClick={() => onShowStickersToggle(!showStickers)}
              className={`px-3.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                showStickers
                  ? "bg-emerald-400 text-slate-950 shadow-md scale-105"
                  : "bg-white/15 text-white/60 hover:text-white"
              }`}
            >
              {showStickers ? "✨ Stickers: ON" : "Stickers: OFF"}
            </button>
          </div>

          {showStickers && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(DEFAULT_STICKER_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => onPresetChange(key)}
                    className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white text-center transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <button
                onClick={onRandomizeStickers}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400/25 to-amber-500/25 hover:from-amber-400/35 hover:to-amber-500/35 border border-amber-300/40 text-amber-200 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md group"
              >
                <Shuffle className="w-4 h-4 text-amber-300 transition-transform group-hover:rotate-180" />
                <span>🎲 Shuffle Sticker Layout & Angles</span>
              </button>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-[11px] text-white/85 leading-relaxed flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>All badges, stamps, stars & confetti are placed dynamically over the photo slots!</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Text & Date Customization */}
      {activeTab === "text" && (
        <div className="flex flex-col gap-4 animate-pop-in">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-amber-300" />
              Bottom Strip Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="e.g. TRANSIUM MOMENTS"
              className="w-full bg-black/40 text-white placeholder-white/40 text-sm font-bold rounded-2xl px-4 py-3 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                Timestamp / Date
              </label>
              <button
                onClick={() => onShowDateToggle(!showDate)}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                  showDate ? "bg-emerald-400 text-slate-950 shadow-sm" : "bg-white/15 text-white/60"
                }`}
              >
                {showDate ? "Date: Shown" : "Date: Hidden"}
              </button>
            </div>

            {showDate && (
              <input
                type="text"
                value={dateText}
                onChange={(e) => onDateTextChange(e.target.value)}
                placeholder="e.g. 2026.08.27 • 10:05 AM"
                className="w-full bg-black/40 text-white placeholder-white/40 text-sm font-semibold rounded-2xl px-4 py-3 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              />
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Share & Export */}
      {activeTab === "export" && (
        <div className="flex flex-col gap-3.5 animate-pop-in">
          {/* Mobile QR Card (Hero Action) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-950 text-amber-400 rounded-xl shadow">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black">Scan QR Code on Phone</h4>
              </div>
              <span className="bg-slate-950 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Most Popular
              </span>
            </div>
            <p className="text-xs font-medium text-slate-900 leading-relaxed">
              Uploads your strip to the cloud and creates a QR code so you and your friends can save it directly to your phone&apos;s photo albums!
            </p>
            <button
              onClick={onOpenQRCode}
              disabled={isUploadingQR}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>{isUploadingQR ? "Preparing QR Code..." : "✨ Generate Mobile QR Code"}</span>
            </button>
          </div>

          {/* Computer Download Button */}
          <button
            onClick={onDownloadSingle}
            disabled={isDownloading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-white/95 text-[#3673FD] font-black text-sm shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileImage className="w-4 h-4 text-[#3673FD]" />
            <span>{isDownloading ? "Downloading..." : "💾 Download 4K PNG to Computer"}</span>
          </button>
        </div>
      )}

      {/* Bottom Global Actions Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-white/15 gap-2">
        <button
          onClick={onRetakeAll}
          className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Strip</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQRCode}
            disabled={isUploadingQR}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Scan QR Code to save on phone"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-950" />
            <span>{isUploadingQR ? "Loading..." : "Scan QR"}</span>
          </button>

          {activeTab !== "export" && (
            <button
              onClick={onDownloadSingle}
              disabled={isDownloading}
              className="py-2.5 px-4 rounded-2xl bg-white text-[#3673FD] hover:bg-white/95 font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-[#3673FD]" />
              <span>Save PNG</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
