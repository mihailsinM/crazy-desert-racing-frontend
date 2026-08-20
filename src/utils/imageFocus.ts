export type ImageFocusPoint = {
  x: number;
  y: number;
};

export type ImageCropFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const CENTER_IMAGE_FOCUS: ImageFocusPoint = {
  x: 50,
  y: 50,
};

const MIN_IMAGE_FOCUS = 0;
const MAX_IMAGE_FOCUS = 100;
export const IMAGE_CROP_PERCENT_OPTIONS = [
  0,
  5,
  10,
  15,
  20,
  25,
  30,
  35,
] as const;
export const DEFAULT_IMAGE_CROP_PERCENT = 0;
export const MAX_IMAGE_CROP_PERCENT = 35;

function normalizeCoordinate(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return CENTER_IMAGE_FOCUS.x;
  }

  return Math.min(
    MAX_IMAGE_FOCUS,
    Math.max(MIN_IMAGE_FOCUS, Math.round(value)),
  );
}

export function createImageFocusPoint(
  x: number | undefined,
  y: number | undefined,
): ImageFocusPoint {
  return {
    x: normalizeCoordinate(x),
    y: normalizeCoordinate(y),
  };
}

export function getImageObjectPosition(focus: ImageFocusPoint): string {
  return `${focus.x}% ${focus.y}%`;
}

export function normalizeImageCropPercent(
  value: number | undefined,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_IMAGE_CROP_PERCENT;
  }

  return IMAGE_CROP_PERCENT_OPTIONS.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value)
      ? option
      : closest,
  );
}

export function getImageCropScale(cropPercent: number | undefined): number {
  const normalizedCrop = normalizeImageCropPercent(cropPercent);

  return 100 / (100 - normalizedCrop);
}

export function getImageCropFrame(
  focus: ImageFocusPoint,
  cropPercent: number | undefined,
): ImageCropFrame {
  const normalizedCrop = normalizeImageCropPercent(cropPercent);
  const visiblePercent = 100 - normalizedCrop;

  return {
    left: (normalizedCrop * focus.x) / 100,
    top: (normalizedCrop * focus.y) / 100,
    width: visiblePercent,
    height: visiblePercent,
  };
}

export function imageFocusPointsEqual(
  first: ImageFocusPoint,
  second: ImageFocusPoint,
): boolean {
  return first.x === second.x && first.y === second.y;
}
