"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { Download, Share2, Sparkles, ArrowLeft, Heart, Check, Copy, AlertCircle, Camera } from "lucide-react";

function StripShareContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const queryImg = searchParams?.get("img");

  const [imageUrl, setImageUrl] = useState<string | null>(queryImg || null);
  const [isLoading, setIsLoading] = useState<boolean>(!queryImg);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [canShare, setCanShare] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && "share" in navigator) {
      setCanShare(true);
    }
  }, []);

  useEffect(() => {
    // Welcoming celebration confetti
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3673FD", "#FFD166", "#06D6A0", "#EF476F", "#FFFFFF"],
    });

    if (queryImg) {
      setImageUrl(queryImg);
      setIsLoading(false);
    } else if (id) {
      const targetUrl = `/api/strip/${id}`;
      setImageUrl(targetUrl);
      setIsLoading(false);
    }
  }, [id, queryImg]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      setIsDownloading(true);
      const res = await fetch(imageUrl);
      const contentType = res.headers.get("content-type") || "";

      // Ensure response is an image and not a 404 JSON error
      if (!res.ok || contentType.includes("application/json")) {
        window.open(imageUrl, "_blank");
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `transium-booth-${id || "photo"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.7 },
      });
    } catch {
      window.open(imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!canShare || !imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], `transium-booth-${id || "photo"}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Transium Photobooth Strip 📸",
          text: "Check out my 4-cut photobooth strip!",
        });
      } else {
        await navigator.share({
          title: "My Transium Photobooth Strip 📸",
          url: window.location.href,
        });
      }
    } catch {
      // User cancelled share
    }
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <main className="relative min-h-screen bg-[#3673FD] text-white flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      {/* Background Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute top-10 left-8 w-12 h-12 opacity-25 animate-float-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/star.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute bottom-16 right-10 w-14 h-14 opacity-25 animate-float-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/confetti-1.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute top-1/2 left-4 w-10 h-10 opacity-20 animate-float-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/star.png" alt="" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-md flex items-center justify-between gap-4 pb-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer backdrop-blur-md border border-white/25 active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span>Shoot New</span>
        </button>

        <div className="relative w-32 h-9">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/transium-logotype.png"
            alt="Transium"
            className="w-full h-full object-contain filter drop-shadow"
          />
        </div>
      </header>

      {/* Main Content */}
      <section className="relative z-10 w-full max-w-md my-auto py-2 flex flex-col items-center gap-5">
        {/* Banner */}
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-black shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Your 4-Cut Photobooth Strip!</span>
        </div>

        {/* Photo Strip Image Preview */}
        <div className="relative w-full max-w-[320px] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border-2 border-white/30 bg-slate-950 flex items-center justify-center min-h-[420px] transition-all">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 text-white/80 text-xs font-bold p-8">
              <div className="w-9 h-9 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Loading your photo strip...</span>
            </div>
          ) : imageError ? (
            <div className="flex flex-col items-center justify-center text-center p-6 gap-2 text-white">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-sm font-bold">Strip expired or not found</p>
              <button
                onClick={() => router.push("/")}
                className="mt-2 px-4 py-2 rounded-xl bg-white text-[#3673FD] font-bold text-xs"
              >
                Create a New Strip
              </button>
            </div>
          ) : imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt="Transium Photobooth Strip"
              onError={() => setImageError(true)}
              className="w-full h-auto object-contain block select-none"
            />
          ) : (
            <div className="p-8 text-center text-sm">Strip not found</div>
          )}
        </div>

        {/* Download & Share Actions */}
        <div className="w-full max-w-[320px] flex flex-col gap-3">
          {/* Main Save Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-base shadow-2xl flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-5 h-5 text-slate-950" />
            <span>{isDownloading ? "Saving..." : "Save to Camera Roll / Download"}</span>
          </button>

          <div className="flex gap-2">
            {canShare && (
              <button
                onClick={handleShare}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-white text-[#3673FD] hover:bg-white/95 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            )}

            <button
              onClick={handleCopyLink}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer backdrop-blur-md border border-white/25 active:scale-95"
            >
              {hasCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{hasCopied ? "Link Copied!" : "Copy Link"}</span>
            </button>
          </div>

          <p className="text-[11px] text-white/80 text-center leading-tight pt-1">
            💡 <strong>Tip</strong>: You can also tap and hold the strip above to save directly into your Photos app!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-md pt-4 pb-2 text-center text-xs text-white/70">
        <p>© {new Date().getFullYear()} Transium Photobooth</p>
      </footer>
    </main>
  );
}

export default function StripSharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#3673FD] flex items-center justify-center text-white font-bold text-sm">
          Loading photo strip...
        </div>
      }
    >
      <StripShareContent />
    </Suspense>
  );
}
