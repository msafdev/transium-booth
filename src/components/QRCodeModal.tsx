"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, QrCode, Copy, Check, ExternalLink, Smartphone, Sparkles, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  isUploading: boolean;
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

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-sm bg-slate-950/90 border border-white/25 rounded-3xl p-6 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex flex-col items-center text-center text-white animate-pop-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Badge */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black shadow-md mb-2.5">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Photobooth Pass</span>
        </div>

        <h3 className="text-xl font-black text-white mb-1 tracking-tight">
          Scan to Save to Phone
        </h3>
        <p className="text-xs text-white/75 mb-4 max-w-xs leading-relaxed">
          Point your phone camera at the QR code below to download your 4-cut strip directly to your camera roll!
        </p>

        {/* Polaroid Style White Frame for QR */}
        <div className="relative p-4 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center mb-4 border-4 border-amber-400 min-h-[220px] transition-all">
          {isUploading ? (
            <div className="w-[190px] h-[190px] flex flex-col items-center justify-center gap-3 text-slate-800">
              <div className="w-10 h-10 border-4 border-[#3673FD] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-extrabold text-slate-800">Generating QR Code...</span>
            </div>
          ) : uploadError ? (
            <div className="w-[190px] h-[190px] flex flex-col items-center justify-center gap-2 text-slate-800 p-2">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <span className="text-xs font-bold text-rose-600">Upload Issue</span>
              <span className="text-[10px] text-slate-600 leading-tight line-clamp-2">{uploadError}</span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-1 px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          ) : shareUrl ? (
            <div className="flex flex-col items-center gap-2">
              <QRCodeSVG
                value={shareUrl}
                size={185}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/assets/transium-logo.png",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
              <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Ready to Scan</span>
              </div>
            </div>
          ) : (
            <div className="w-[190px] h-[190px] flex items-center justify-center text-slate-500 text-xs font-semibold">
              Preparing...
            </div>
          )}
        </div>

        {/* Link & Actions */}
        {shareUrl && (
          <div className="w-full flex flex-col gap-2.5">
            <div className="flex items-center gap-2 bg-black/50 border border-white/15 px-3.5 py-2 rounded-2xl text-xs">
              <span className="text-white/80 truncate flex-1 text-left font-mono text-[11px]">{shareUrl}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer shrink-0 active:scale-95"
                title="Copy share link"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex gap-2">
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 border border-white/15"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Page</span>
              </a>
              <button
                onClick={onClose}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg transition-colors cursor-pointer active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
