"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, ExternalLink, Smartphone, CheckCircle, FolderHeart } from "lucide-react";

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
  shareUrl = GDRIVE_FOLDER_URL,
}) => {
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetUrl = shareUrl || GDRIVE_FOLDER_URL;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
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
          <FolderHeart className="w-3.5 h-3.5" />
          <span>Google Drive Album</span>
        </div>

        <h3 className="text-xl font-black text-white mb-1 tracking-tight">
          Scan for Photos
        </h3>
        <p className="text-xs text-white/85 mb-4 max-w-xs leading-relaxed">
          Scan this QR code with your phone camera to open the event&apos;s Google Drive album and download all photobooth strips!
        </p>

        {/* Polaroid Style White Frame for QR */}
        <div className="relative p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center mb-4 min-h-[220px] transition-all">
          <div className="flex flex-col items-center gap-2">
            <QRCodeSVG
              value={targetUrl}
              size={185}
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
              <span>Google Drive Link Ready</span>
            </div>
          </div>
        </div>

        {/* Link & Actions */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-black/20 border border-white/20 px-3.5 py-2 rounded-xl text-xs">
            <span className="text-white/90 truncate flex-1 text-left font-mono text-[11px]">{targetUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer shrink-0 active:scale-95"
              title="Copy Google Drive link"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 border border-white/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Drive</span>
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
