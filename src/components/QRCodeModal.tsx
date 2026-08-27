"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, ExternalLink, Smartphone, CheckCircle, FolderHeart, AlertCircle, RefreshCw } from "lucide-react";

export const GDRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1OV1osHIXrRjtaaIt7hX90AkY1AXGdZr6?usp=sharing";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl?: string;
  isUploading?: boolean;
  uploadError?: string | null;
  onRetry?: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  isUploading,
  uploadError,
  onRetry,
}) => {
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetQrUrl = shareUrl || GDRIVE_FOLDER_URL;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetQrUrl);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-sm bg-[#3673FD] border border-white/30 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl flex flex-col items-center text-center text-white animate-pop-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Badge */}
        <div className="flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black shadow-md mb-2.5">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instant Mobile Scan</span>
        </div>

        <h3 className="text-xl font-black text-white mb-1 tracking-tight">
          Save Photo Strip
        </h3>
        <p className="text-xs text-white/85 mb-3 max-w-xs leading-relaxed">
          Scan this QR code with your phone camera to view, save, and share your photobooth strip!
        </p>

        {/* Polaroid Style White Frame for QR */}
        <div className="relative p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center mb-3 min-h-[210px] transition-all">
          {isUploading ? (
            <div className="w-[180px] h-[180px] flex flex-col items-center justify-center gap-3 text-slate-800">
              <div className="w-9 h-9 border-3 border-[#3673FD] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-extrabold text-slate-800">Preparing Photo Strip...</span>
            </div>
          ) : uploadError ? (
            <div className="w-[180px] h-[180px] flex flex-col items-center justify-center gap-2 text-slate-800 p-2">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <span className="text-xs font-bold text-rose-600">Scan Google Drive</span>
              <QRCodeSVG
                value={GDRIVE_FOLDER_URL}
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <QRCodeSVG
                value={targetQrUrl}
                size={180}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/assets/transium-logo.png",
                  x: undefined,
                  y: undefined,
                  height: 38,
                  width: 38,
                  excavate: true,
                }}
              />
              <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Ready to Scan • Auto-Saved</span>
              </div>
            </div>
          )}
        </div>

        {/* Link & Actions */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-black/20 border border-white/20 px-3.5 py-2 rounded-xl text-xs">
            <span className="text-white/90 truncate flex-1 text-left font-mono text-[11px]">{targetQrUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer shrink-0 active:scale-95"
              title="Copy link"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <a
              href={GDRIVE_FOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 border border-white/20"
              title="Open Google Drive Event Folder"
            >
              <FolderHeart className="w-3.5 h-3.5 text-amber-300" />
              <span>Drive Album</span>
            </a>

            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-colors cursor-pointer active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
