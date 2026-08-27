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
  Printer,
  FileImage,
  QrCode,
  Smartphone,
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
  onDownloadTwin: () => void;
  onOpenQRCode: () => void;
  onRetakeAll: () => void;
  isDownloading: boolean;
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
  onDownloadTwin,
  onOpenQRCode,
  onRetakeAll,
  isDownloading,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("theme");

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "theme", label: "Frame", icon: Palette },
    { id: "filters", label: "Filters", icon: Sliders },
    { id: "stickers", label: "Stickers", icon: Sparkles },
    { id: "text", label: "Text", icon: Type },
    { id: "export", label: "Save", icon: Download },
  ];

  return (
    <div className="w-full bg-white/15 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/25 text-white flex flex-col gap-5">
      {/* Navigation Tabs */}
      <div className="grid grid-cols-5 gap-1.5 bg-black/25 p-1.5 rounded-2xl">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? t.id === "export"
                    ? "bg-amber-400 text-slate-900 shadow-md scale-[1.02]"
                    : "bg-white text-[#3673FD] shadow-md scale-[1.02]"
                  : t.id === "export"
                  ? "text-amber-200 hover:text-white hover:bg-white/10"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="leading-none">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Frame Themes */}
      {activeTab === "theme" && (
        <div className="flex flex-col gap-3.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-white/90">Select Frame Color</span>
            <span className="text-xs font-bold text-amber-300 bg-black/20 px-2.5 py-0.5 rounded-full">
              {currentTheme.name}
            </span>
          </div>

          {/* Color Grid with full readable names */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FRAME_THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme)}
                  className={`group relative p-2.5 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all cursor-pointer text-center ${
                    isSelected
                      ? "border-white bg-white/25 shadow-lg scale-105"
                      : "border-transparent bg-white/10 hover:bg-white/15 hover:border-white/20"
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-xl shadow-md flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
                    style={{
                      backgroundColor: theme.bgColor,
                      border: theme.borderColor ? `1.5px solid ${theme.borderColor}` : "1px solid rgba(0,0,0,0.15)",
                    }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-5 h-5 filter drop-shadow ${
                          theme.bgColor === "#FFFFFF" || theme.bgColor === "#FEF3C7" || theme.bgColor === "#BFDBFE" || theme.bgColor === "#FBCFE8" || theme.bgColor === "#D1E7DD"
                            ? "text-slate-900"
                            : "text-white"
                        }`}
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-white leading-tight">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Photo Filters */}
      {activeTab === "filters" && (
        <div className="flex flex-col gap-3.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-white/90">Photo Tone & Filter</span>
            <span className="text-xs font-bold text-amber-300 bg-black/20 px-2.5 py-0.5 rounded-full">
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
                    isSelected ? "border-white bg-white/25 shadow-lg scale-[1.02]" : "border-transparent bg-white/10 hover:bg-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-white">{f.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-[10px] text-white/70 leading-tight">{f.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Stickers & Scattering */}
      {activeTab === "stickers" && (
        <div className="flex flex-col gap-3.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-white/90">Sticker Overlay & Scatter</span>
            <button
              onClick={() => onShowStickersToggle(!showStickers)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                showStickers ? "bg-emerald-400 text-slate-950 shadow-sm" : "bg-white/20 text-white/70"
              }`}
            >
              {showStickers ? "Stickers: ON" : "Stickers: OFF"}
            </button>
          </div>

          {showStickers && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(DEFAULT_STICKER_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => onPresetChange(key)}
                    className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white text-center transition-all cursor-pointer active:scale-95"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <button
                onClick={onRandomizeStickers}
                className="w-full py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Shuffle className="w-4 h-4 text-amber-300" />
                <span>Randomize Angles & Scatter</span>
              </button>

              <div className="p-3 rounded-2xl bg-black/25 border border-white/10 text-[11px] text-white/85 leading-relaxed flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>All Transium badges, stamps, bus icons, stars & confetti are placed dynamically on top of your photos!</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Text & Date Customization */}
      {activeTab === "text" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-white/90">Bottom Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="e.g. TRANSIUM MOMENTS"
              className="w-full bg-black/30 text-white placeholder-white/40 text-sm font-bold rounded-xl px-4 py-2.5 border border-white/25 focus:outline-none focus:ring-2 focus:ring-white transition-all"
            />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-white/90">Date / Timestamp</label>
              <button
                onClick={() => onShowDateToggle(!showDate)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  showDate ? "bg-emerald-400 text-slate-950 shadow-sm" : "bg-white/20 text-white/70"
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
                placeholder="e.g. 2026.08.27 • 09:21 AM"
                className="w-full bg-black/30 text-white placeholder-white/40 text-sm font-semibold rounded-xl px-4 py-2.5 border border-white/25 focus:outline-none focus:ring-2 focus:ring-white transition-all"
              />
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Save & Download Actions */}
      {activeTab === "export" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* QR Code Action Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-slate-950" />
                <h4 className="text-sm font-black">Scan QR to Save on Phone</h4>
              </div>
              <span className="bg-black/20 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Instant
              </span>
            </div>
            <p className="text-xs font-medium text-slate-900 leading-relaxed">
              Uploads your strip to the cloud and creates a QR code so guests can scan and save directly to their mobile gallery!
            </p>
            <button
              onClick={onOpenQRCode}
              className="w-full py-3 px-4 rounded-xl bg-slate-950 text-white hover:bg-slate-900 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Generate Mobile QR Code</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 flex flex-col gap-1">
            <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-300" />
              Direct Computer Download
            </h4>
            <p className="text-[11px] text-white/75 leading-relaxed">
              Save high-resolution 2x DPR PNG files locally.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Single Strip Download */}
            <button
              onClick={onDownloadSingle}
              disabled={isDownloading}
              className="py-3 px-4 rounded-xl bg-white text-[#3673FD] hover:bg-white/95 font-black text-xs shadow-md flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileImage className="w-4 h-4 text-[#3673FD]" />
              <span>{isDownloading ? "Generating..." : "Download 1-Strip"}</span>
            </button>

            {/* Twin Strip Download (2-Up Print Format) */}
            <button
              onClick={onDownloadTwin}
              disabled={isDownloading}
              className="py-3 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer backdrop-blur-md disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Download Twin Strip</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Global Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/20 gap-2">
        <button
          onClick={onRetakeAll}
          className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Strip</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQRCode}
            className="py-2.5 px-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-amber-200 hover:text-white font-black text-xs flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer active:scale-95"
            title="Scan QR Code to save on phone"
          >
            <QrCode className="w-4 h-4 text-amber-300" />
            <span>QR Code</span>
          </button>

          {activeTab !== "export" && (
            <button
              onClick={onDownloadSingle}
              disabled={isDownloading}
              className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
