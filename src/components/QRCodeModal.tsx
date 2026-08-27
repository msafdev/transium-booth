"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, QrCode, Copy, Check, ExternalLink, Smartphone, Sparkles } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  isUploading: boolean;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  isUploading,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Badge */}
        <div className="flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-3.5 py-1 rounded-full text-xs font-bold border border-amber-300/30 mb-3">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile QR Download</span>
        </div>

        <h3 className="text-xl font-black text-white mb-1">
          Scan to Save to Phone
        </h3>
        <p className="text-xs text-white/70 mb-5 max-w-xs leading-relaxed">
          Open your phone&apos;s camera app and point it at the QR code below to download your 4-cut strip!
        </p>

        {/* QR Code Container */}
        <div className="relative p-4 bg-white rounded-2xl shadow-2xl flex items-center justify-center mb-5 border-4 border-amber-400">
          {isUploading ? (
            <div className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-2 text-slate-700">
              <div className="w-8 h-8 border-3 border-[#3673FD] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold">Uploading strip...</span>
            </div>
          ) : shareUrl ? (
            <QRCodeSVG
              value={shareUrl}
              size={200}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "/assets/transium-logo.png",
                x: undefined,
                y: undefined,
                height: 42,
                width: 42,
                excavate: true,
              }}
            />
          ) : (
            <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-500 text-xs">
              Generating QR...
            </div>
          )}
        </div>

        {/* Link & Copy Actions */}
        {shareUrl && (
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-black/40 border border-white/15 px-3 py-2 rounded-xl text-xs">
              <span className="text-white/75 truncate flex-1 text-left font-mono">{shareUrl}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer shrink-0"
                title="Copy share link"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Link</span>
              </a>
              <button
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer"
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
