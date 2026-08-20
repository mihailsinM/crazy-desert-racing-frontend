import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
} from "react";

import {
  CENTER_IMAGE_FOCUS,
  createImageFocusPoint,
  getImageCropFrame,
  IMAGE_CROP_PERCENT_OPTIONS,
  imageFocusPointsEqual,
  MAX_IMAGE_CROP_PERCENT,
  normalizeImageCropPercent,
  type ImageFocusPoint,
} from "../../utils/imageFocus";
import FocalImage from "./FocalImage";

export type ImageFocusPreviewVariant = "circle" | "square" | "wide";

type ImageFocusPickerProps = {
  imageUrl: string;
  value: ImageFocusPoint;
  onChange: (focus: ImageFocusPoint) => void;
  cropPercent?: number;
  onCropPercentChange?: (cropPercent: number) => void;
  disabled?: boolean;
  imageAlt?: string;
  previewVariants?: readonly ImageFocusPreviewVariant[];
};

const KEYBOARD_FOCUS_STEP = 2;
const KEYBOARD_FOCUS_LARGE_STEP = 10;
const DEFAULT_PREVIEW_VARIANTS: readonly ImageFocusPreviewVariant[] = [
  "circle",
];
const PREVIEW_LABELS: Record<ImageFocusPreviewVariant, string> = {
  circle: "Round preview",
  square: "Square card",
  wide: "Wide card",
};

function ImageFocusPicker({
  imageUrl,
  value,
  onChange,
  cropPercent,
  onCropPercentChange,
  disabled = false,
  imageAlt = "Image",
  previewVariants = DEFAULT_PREVIEW_VARIANTS,
}: ImageFocusPickerProps) {
  const cropEnabled =
    typeof cropPercent === "number" &&
    typeof onCropPercentChange === "function";
  const normalizedCrop = normalizeImageCropPercent(cropPercent);
  const cropFrame = getImageCropFrame(value, normalizedCrop);
  const cropProgress = (normalizedCrop / MAX_IMAGE_CROP_PERCENT) * 100;

  function updateFromPointer(event: PointerEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();

    if (bounds.width === 0 || bounds.height === 0) {
      return;
    }

    onChange(
      createImageFocusPoint(
        ((event.clientX - bounds.left) / bounds.width) * 100,
        ((event.clientY - bounds.top) / bounds.height) * 100,
      ),
    );
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (
      disabled ||
      !event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      return;
    }

    updateFromPointer(event);
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    const step = event.shiftKey
      ? KEYBOARD_FOCUS_LARGE_STEP
      : KEYBOARD_FOCUS_STEP;
    let nextFocus: ImageFocusPoint;

    switch (event.key) {
      case "ArrowLeft":
        nextFocus = createImageFocusPoint(value.x - step, value.y);
        break;
      case "ArrowRight":
        nextFocus = createImageFocusPoint(value.x + step, value.y);
        break;
      case "ArrowUp":
        nextFocus = createImageFocusPoint(value.x, value.y - step);
        break;
      case "ArrowDown":
        nextFocus = createImageFocusPoint(value.x, value.y + step);
        break;
      case "Home":
        nextFocus = { ...CENTER_IMAGE_FOCUS };
        break;
      default:
        return;
    }

    event.preventDefault();
    onChange(nextFocus);
  }

  const isCentered = imageFocusPointsEqual(value, CENTER_IMAGE_FOCUS);
  const cropSliderStyle = {
    "--du-crop-progress": `${cropProgress}%`,
  } as CSSProperties;

  return (
    <section className="du-image-focus-picker">
      <div className="du-image-focus-copy">
        <div>
          <p className="du-field-label">Choose image focus</p>
          <p className="du-caption">
            Click or drag the marker onto the most important part of the photo.
          </p>
        </div>

        <div className="du-image-focus-actions">
          <button
            type="button"
            className="du-button du-button-small du-button-rect"
            disabled={disabled || isCentered}
            onClick={() => onChange({ ...CENTER_IMAGE_FOCUS })}
          >
            Center Focus
          </button>

          {cropEnabled && (
            <button
              type="button"
              className="du-button du-button-small du-button-rect"
              disabled={disabled || normalizedCrop === 0}
              onClick={() => onCropPercentChange?.(0)}
            >
              Reset Crop
            </button>
          )}
        </div>
      </div>

      <div className="du-image-focus-workspace">
        <div className="du-image-focus-editor">
          {cropEnabled && (
            <label className="du-image-crop-control">
              <span className="du-field-label">Crop depth</span>
              <span className="du-image-crop-range-wrap">
                <input
                  type="range"
                  className="du-image-crop-range"
                  min={0}
                  max={MAX_IMAGE_CROP_PERCENT}
                  step={5}
                  value={normalizedCrop}
                  style={cropSliderStyle}
                  disabled={disabled}
                  aria-label="Crop depth"
                  aria-valuetext={`${normalizedCrop} percent crop`}
                  onChange={(event) =>
                    onCropPercentChange?.(Number(event.currentTarget.value))
                  }
                />
                <span className="du-image-crop-ticks" aria-hidden="true">
                  {IMAGE_CROP_PERCENT_OPTIONS.map((option) => (
                    <span key={option} />
                  ))}
                </span>
              </span>
            </label>
          )}

          <button
            type="button"
            className="du-image-focus-stage"
            aria-label={`Image focus at ${value.x} percent horizontally and ${value.y} percent vertically`}
            disabled={disabled}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
          >
            <FocalImage
              src={imageUrl}
              alt={`Choose ${imageAlt.toLowerCase()} focus`}
              focusX={value.x}
              focusY={value.y}
              fit="contain"
              fill={false}
              className="du-image-focus-source"
            />
            {cropEnabled && normalizedCrop > 0 && (
              <span
                className="du-image-focus-crop-frame"
                style={{
                  left: `${cropFrame.left}%`,
                  top: `${cropFrame.top}%`,
                  width: `${cropFrame.width}%`,
                  height: `${cropFrame.height}%`,
                }}
                aria-hidden="true"
              />
            )}
            <span
              className="du-image-focus-marker"
              style={{ left: `${value.x}%`, top: `${value.y}%` }}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="du-image-focus-result">
          <span className="du-caption">Crop previews</span>
          <div className="du-image-focus-preview-list">
            {previewVariants.map((variant) => (
              <span
                key={variant}
                className="du-image-focus-preview-item"
              >
                <span className="du-caption">
                  {PREVIEW_LABELS[variant]}
                </span>
                <span
                  className={`du-image-focus-preview du-image-focus-preview-${variant}`}
                >
                  <FocalImage
                    src={imageUrl}
                    alt={`${imageAlt} ${PREVIEW_LABELS[variant].toLowerCase()} preview`}
                    focusX={value.x}
                    focusY={value.y}
                    cropPercent={normalizedCrop}
                  />
                </span>
              </span>
            ))}
          </div>
          <span className="du-image-focus-value">
            {value.x}% · {value.y}%
          </span>
        </div>
      </div>
    </section>
  );
}

export default ImageFocusPicker;
