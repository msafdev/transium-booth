"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, RefreshCw, Sparkles, Upload, Video, VideoOff, Check, AlertCircle } from "lucide-react";
import { soundFx } from "../utils/sound";
import { PhotoItem } from "../types/photobooth";

interface CameraViewProps {
  onPhotosCaptured: (photos: PhotoItem[]) => void;
  onSinglePhotoCaptured?: (photo: PhotoItem, slotIndex: number) => void;
  retakeSlotIndex: number | null;
  onCancelRetake?: () => void;
  existingPhotos: PhotoItem[];
}

export const CameraView: React.FC<CameraViewProps> = ({
  onPhotosCaptured,
  onSinglePhotoCaptured,
  retakeSlotIndex,
  onCancelRetake,
  existingPhotos,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Capture State
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number>(3); // 3 seconds default
  const [capturedBatch, setCapturedBatch] = useState<PhotoItem[]>([]);

  // Initialize camera stream
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setErrorMsg(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : "user",
          width: { ideal: 1280 },
          height: { ideal: 960 },
          aspectRatio: { ideal: 4 / 3 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Query available video devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevs);
      if (!selectedDeviceId && videoDevs.length > 0) {
        setSelectedDeviceId(videoDevs[0].deviceId);
      }
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      setIsCameraActive(false);
      const message = err instanceof Error ? err.message : "Could not access camera";
      setErrorMsg("Camera permission denied or camera not found. You can also upload photos directly.");
    }
  }, [selectedDeviceId, stream]);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture frame from video feed
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Handle mirror mode
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.95);
  }, [isMirrored]);

  // Start 4-photo automatic photobooth sequence
  const startFullSequence = async () => {
    if (isCapturing || !isCameraActive) return;

    setIsCapturing(true);
    const newPhotos: PhotoItem[] = [];
    setCapturedBatch([]);

    for (let shot = 0; shot < 4; shot++) {
      setCurrentShotIndex(shot);

      // Countdown 3.. 2.. 1..
      for (let c = timerDuration; c > 0; c--) {
        setCountdown(c);
        soundFx.playCountdownBeep(false);
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Flash & Capture
      setCountdown(0);
      soundFx.playCountdownBeep(true);
      soundFx.playShutterSound();
      setIsFlashing(true);

      const dataUrl = captureFrame();
      if (dataUrl) {
        const item: PhotoItem = {
          id: `photo-${Date.now()}-${shot}`,
          dataUrl,
          timestamp: Date.now(),
        };
        newPhotos.push(item);
        setCapturedBatch([...newPhotos]);
      }

      await new Promise((r) => setTimeout(r, 150));
      setIsFlashing(false);
      setCountdown(null);

      // Wait between shots if not last
      if (shot < 3) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    setIsCapturing(false);
    onPhotosCaptured(newPhotos);
  };

  // Retake a single slot
  const startSingleRetake = async (slotIdx: number) => {
    if (isCapturing || !isCameraActive) return;

    setIsCapturing(true);
    setCurrentShotIndex(slotIdx);

    for (let c = timerDuration; c > 0; c--) {
      setCountdown(c);
      soundFx.playCountdownBeep(false);
      await new Promise((r) => setTimeout(r, 1000));
    }

    setCountdown(0);
    soundFx.playCountdownBeep(true);
    soundFx.playShutterSound();
    setIsFlashing(true);

    const dataUrl = captureFrame();
    if (dataUrl && onSinglePhotoCaptured) {
      const item: PhotoItem = {
        id: `photo-${Date.now()}-${slotIdx}`,
        dataUrl,
        timestamp: Date.now(),
      };
      onSinglePhotoCaptured(item, slotIdx);
    }

    await new Promise((r) => setTimeout(r, 150));
    setIsFlashing(false);
    setCountdown(null);
    setIsCapturing(false);
  };

  // Upload image files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readPromises: Promise<PhotoItem>[] = [];
    const maxFiles = Math.min(files.length, 4);

    for (let i = 0; i < maxFiles; i++) {
      const file = files[i];
      readPromises.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: `upload-${Date.now()}-${i}`,
              dataUrl: reader.result as string,
              timestamp: Date.now(),
            });
          };
          reader.readAsDataURL(file);
        })
      );
    }

    Promise.all(readPromises).then((uploadedPhotos) => {
      if (retakeSlotIndex !== null && uploadedPhotos.length > 0 && onSinglePhotoCaptured) {
        onSinglePhotoCaptured(uploadedPhotos[0], retakeSlotIndex);
      } else {
        // Pad to 4 if fewer uploaded
        const combined = [...uploadedPhotos];
        while (combined.length < 4) {
          combined.push(uploadedPhotos[combined.length % uploadedPhotos.length]);
        }
        onPhotosCaptured(combined);
      }
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Video Viewfinder Container */}
      <div className="relative w-full aspect-[4/3] max-w-xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 flex items-center justify-center">
        {/* Flash Effect */}
        <div
          className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-150 ${
            isFlashing ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-transform ${
            isMirrored ? "scale-x-[-1]" : "scale-x-100"
          } ${!isCameraActive ? "hidden" : "block"}`}
        />

        {/* Camera Inactive / Error Fallback */}
        {!isCameraActive && (
          <div className="p-6 text-center text-white flex flex-col items-center gap-3">
            <VideoOff className="w-12 h-12 text-white/50" />
            <p className="text-sm font-medium max-w-xs text-white/80">
              {errorMsg || "Camera is not connected or permission is pending."}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => startCamera(selectedDeviceId)}
                className="px-4 py-2 bg-white text-[#3673FD] font-semibold rounded-full text-xs flex items-center gap-1.5 hover:bg-white/90 shadow-md cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Camera
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full text-xs flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photos
              </button>
            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] animate-pulse">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 border-4 border-white flex items-center justify-center shadow-2xl backdrop-blur-md">
              <span className="text-5xl sm:text-6xl font-black text-white drop-shadow-md">
                {countdown > 0 ? countdown : "📸"}
              </span>
            </div>
            <p className="mt-4 text-white font-bold text-lg drop-shadow tracking-wider uppercase">
              {retakeSlotIndex !== null
                ? `Retaking Photo #${retakeSlotIndex + 1}`
                : `Shot ${currentShotIndex + 1} of 4`}
            </p>
          </div>
        )}

        {/* Viewfinder Corner Overlays */}
        <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="w-6 h-6 border-t-2 border-l-2 border-white/60 rounded-tl-md" />
            <div className="w-6 h-6 border-t-2 border-r-2 border-white/60 rounded-tr-md" />
          </div>
          <div className="flex justify-between">
            <div className="w-6 h-6 border-b-2 border-l-2 border-white/60 rounded-bl-md" />
            <div className="w-6 h-6 border-b-2 border-r-2 border-white/60 rounded-br-md" />
          </div>
        </div>

        {/* Live Shot Counter Badges */}
        {isCapturing && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>
              {retakeSlotIndex !== null
                ? `Retake #${retakeSlotIndex + 1}`
                : `Capturing ${currentShotIndex + 1}/4`}
            </span>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Camera Controls & Trigger Bar */}
      <div className="w-full max-w-xl mt-4 flex flex-col gap-3">
        {/* Settings row */}
        <div className="flex items-center justify-between px-2 text-white/90 text-xs">
          {/* Timer Selector */}
          <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">
            <span className="font-semibold text-white/70 mr-1">Timer:</span>
            {[3, 5].map((sec) => (
              <button
                key={sec}
                onClick={() => setTimerDuration(sec)}
                disabled={isCapturing}
                className={`px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  timerDuration === sec
                    ? "bg-white text-[#3673FD] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Mirror Toggle & Device Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMirrored(!isMirrored)}
              disabled={isCapturing}
              className={`px-3 py-1.5 rounded-full font-semibold bg-white/15 hover:bg-white/25 backdrop-blur-md transition-all flex items-center gap-1 cursor-pointer ${
                isMirrored ? "text-white" : "text-white/60"
              }`}
              title="Toggle camera mirror"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Mirror {isMirrored ? "ON" : "OFF"}</span>
            </button>

            {devices.length > 1 && (
              <select
                value={selectedDeviceId}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value);
                  startCamera(e.target.value);
                }}
                disabled={isCapturing}
                className="bg-white/15 text-white text-xs rounded-full px-3 py-1.5 backdrop-blur-md border-none focus:ring-2 focus:ring-white outline-none cursor-pointer"
              >
                {devices.map((d, i) => (
                  <option key={d.deviceId} value={d.deviceId} className="bg-slate-800 text-white">
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {retakeSlotIndex !== null ? (
            <>
              <button
                onClick={() => startSingleRetake(retakeSlotIndex)}
                disabled={isCapturing}
                className="flex-1 py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-extrabold text-base shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                <span>Shoot Photo #{retakeSlotIndex + 1}</span>
              </button>

              {onCancelRetake && (
                <button
                  onClick={onCancelRetake}
                  disabled={isCapturing}
                  className="py-3.5 px-5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm backdrop-blur-md transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={startFullSequence}
                disabled={isCapturing || !isCameraActive}
                className="flex-1 py-4 px-6 rounded-full bg-white text-[#3673FD] hover:bg-white/95 font-black text-lg shadow-[0_10px_25px_rgba(0,0,0,0.25)] transform active:scale-95 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-6 h-6 text-[#3673FD]" />
                <span>{isCapturing ? "Capturing 4-Shots..." : "Start 4-Shot Photobooth"}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isCapturing}
                className="py-4 px-5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                title="Upload photos from device"
              >
                <Upload className="w-5 h-5" />
                <span className="hidden sm:inline">Upload</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
