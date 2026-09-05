export type ImageFocusPoint = {
  x: number;
  y: number;
};

export type ImageFramingProfile = {
  focusX: number;
  focusY: number;
  cropPercent: number;
};

export type ImageFramingProfiles = {
  avatar: ImageFramingProfile;
  card: ImageFramingProfile;
};

export type ImageFramingProfileName = keyof ImageFramingProfiles;

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

export function createImageFramingProfile(
  focusX?: number,
  focusY?: number,
  cropPercent?: number,
): ImageFramingProfile {
  const focus = createImageFocusPoint(focusX, focusY);

  return {
    focusX: focus.x,
    focusY: focus.y,
    cropPercent: normalizeImageCropPercent(cropPercent),
  };
}

export function createImageFramingProfiles(
  avatar?: Partial<ImageFramingProfile>,
  card?: Partial<ImageFramingProfile>,
): ImageFramingProfiles {
  return {
    avatar: createImageFramingProfile(
      avatar?.focusX,
      avatar?.focusY,
      avatar?.cropPercent,
    ),
    card: createImageFramingProfile(
      card?.focusX,
      card?.focusY,
      card?.cropPercent,
    ),
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

export function getImageCropFrameForAspectRatio(
  focus: ImageFocusPoint,
  cropPercent: number | undefined,
  sourceAspectRatio: number,
  targetAspectRatio: number,
): ImageCropFrame {
  const safeSourceAspectRatio =
    Number.isFinite(sourceAspectRatio) && sourceAspectRatio > 0
      ? sourceAspectRatio
      : 1;
  const safeTargetAspectRatio =
    Number.isFinite(targetAspectRatio) && targetAspectRatio > 0
      ? targetAspectRatio
      : 1;
  const normalizedCrop = normalizeImageCropPercent(cropPercent);
  const cropScale = (100 - normalizedCrop) / 100;

  let fittedWidth = 100;
  let fittedHeight = 100;

  if (safeSourceAspectRatio > safeTargetAspectRatio) {
    fittedWidth =
      (safeTargetAspectRatio / safeSourceAspectRatio) * 100;
  } else if (safeSourceAspectRatio < safeTargetAspectRatio) {
    fittedHeight =
      (safeSourceAspectRatio / safeTargetAspectRatio) * 100;
  }

  const width = fittedWidth * cropScale;
  const height = fittedHeight * cropScale;

  return {
    left: ((100 - width) * focus.x) / 100,
    top: ((100 - height) * focus.y) / 100,
    width,
    height,
  };
}

export function imageFocusPointsEqual(
  first: ImageFocusPoint,
  second: ImageFocusPoint,
): boolean {
  return first.x === second.x && first.y === second.y;
}

export function imageFramingProfilesEqual(
  first: ImageFramingProfiles,
  second: ImageFramingProfiles,
): boolean {
  return (
    first.avatar.focusX === second.avatar.focusX &&
    first.avatar.focusY === second.avatar.focusY &&
    first.avatar.cropPercent === second.avatar.cropPercent &&
    first.card.focusX === second.card.focusX &&
    first.card.focusY === second.card.focusY &&
    first.card.cropPercent === second.card.cropPercent
  );
}
