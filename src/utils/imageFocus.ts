export type ImageFocusPoint = {
  x: number;
  y: number;
};

export const CENTER_IMAGE_FOCUS: ImageFocusPoint = {
  x: 50,
  y: 50,
};

const MIN_IMAGE_FOCUS = 0;
const MAX_IMAGE_FOCUS = 100;

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

export function imageFocusPointsEqual(
  first: ImageFocusPoint,
  second: ImageFocusPoint,
): boolean {
  return first.x === second.x && first.y === second.y;
}
