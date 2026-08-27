export interface PhotoItem {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export interface StickerPlacement {
  id: string;
  src: string;
  alt: string;
  xPercent: number; // center x (0 - 100 relative to strip)
  yPercent: number; // center y (0 - 100 relative to strip)
  widthPercent: number; // width % relative to strip width
  rotationDeg: number; // rotation in degrees
  zIndex?: number;
}

export type FrameTheme = {
  id: string;
  name: string;
  bgClass: string;
  bgColor: string;
  textColor: string;
  subtextColor: string;
  borderColor?: string;
};

export type PhotoFilter = {
  id: string;
  name: string;
  cssFilter: string;
  canvasFilter?: string;
  description: string;
};

export interface PhotoboothConfig {
  frameColor: string;
  textColor: string;
  filter: string;
  caption: string;
  showDate: boolean;
  dateText: string;
  stickerPreset: string;
  showStickers: boolean;
}
