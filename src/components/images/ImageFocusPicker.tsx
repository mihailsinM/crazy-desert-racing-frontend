import {
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";

import {
  CENTER_IMAGE_FOCUS,
  createImageFramingProfile,
  createImageFocusPoint,
  getImageCropFrame,
  getImageCropFrameForAspectRatio,
  IMAGE_CROP_PERCENT_OPTIONS,
  imageFocusPointsEqual,
  MAX_IMAGE_CROP_PERCENT,
  normalizeImageCropPercent,
  type ImageFramingProfileName,
  type ImageFramingProfiles,
  type ImageFocusPoint,
} from "../../utils/imageFocus";
import FocalImage from "./FocalImage";

export type ImageFocusPreviewVariant = "circle" | "square" | "wide";

type SharedImageFocusPickerProps = {
  imageUrl: string;
  disabled?: boolean;
  imageAlt?: string;
  previewVariants?: readonly ImageFocusPreviewVariant[];
};

type SingleImageFocusPickerProps = {
  value: ImageFocusPoint;
  onChange: (focus: ImageFocusPoint) => void;
  cropPercent?: number;
  onCropPercentChange?: (cropPercent: number) => void;
  framingProfiles?: never;
  onFramingProfilesChange?: never;
};

type ProfileImageFocusPickerProps = {
  framingProfiles: ImageFramingProfiles;
  onFramingProfilesChange: (profiles: ImageFramingProfiles) => void;
  value?: never;
  onChange?: never;
  cropPercent?: never;
  onCropPercentChange?: never;
};

type ImageFocusPickerProps = SharedImageFocusPickerProps &
  (SingleImageFocusPickerProps | ProfileImageFocusPickerProps);

const KEYBOARD_FOCUS_STEP = 2;
const KEYBOARD_FOCUS_LARGE_STEP = 10;
const DEFAULT_PREVIEW_VARIANTS: readonly ImageFocusPreviewVariant[] = [
  "circle",
];
const FRAMING_PROFILE_PREVIEW_VARIANTS: readonly ImageFocusPreviewVariant[] = [
  "circle",
  "wide",
];
const PREVIEW_LABELS: Record<ImageFocusPreviewVariant, string> = {
  circle: "Round preview",
  square: "Square card",
  wide: "Wide card",
};
const PROFILE_BY_PREVIEW_VARIANT: Partial<
  Record<ImageFocusPreviewVariant, ImageFramingProfileName>
> = {
  circle: "avatar",
  wide: "card",
};
const PROFILE_LABELS: Record<ImageFramingProfileName, string> = {
  avatar: "Avatar",
  card: "Card",
};
const PROFILE_ASPECT_RATIOS: Record<ImageFramingProfileName, number> = {
  avatar: 1,
  card: 16 / 9,
};

function ImageFocusPicker({
  imageUrl,
  value,
  onChange,
  cropPercent,
  onCropPercentChange,
  framingProfiles,
  onFramingProfilesChange,
  disabled = false,
  imageAlt = "Image",
  previewVariants = DEFAULT_PREVIEW_VARIANTS,
}: ImageFocusPickerProps) {
  const [activeProfile, setActiveProfile] = useState<ImageFramingProfileName>(
    "avatar",
  );
  const [sourceAspectRatio, setSourceAspectRatio] = useState(1);
  const usesFramingProfiles =
    framingProfiles !== undefined &&
    onFramingProfilesChange !== undefined;
  const activeFraming = usesFramingProfiles
    ? framingProfiles[activeProfile]
    : createImageFramingProfile(value?.x, value?.y, cropPercent);
  const activeFocus = createImageFocusPoint(
    activeFraming.focusX,
    activeFraming.focusY,
  );
  const cropEnabled =
    usesFramingProfiles ||
    (
      typeof cropPercent === "number" &&
      typeof onCropPercentChange === "function"
    );
  const normalizedCrop = normalizeImageCropPercent(
    activeFraming.cropPercent,
  );
  const cropFrame = usesFramingProfiles
    ? getImageCropFrameForAspectRatio(
        activeFocus,
        normalizedCrop,
        sourceAspectRatio,
        PROFILE_ASPECT_RATIOS[activeProfile],
      )
    : getImageCropFrame(activeFocus, normalizedCrop);
  const cropProgress = (normalizedCrop / MAX_IMAGE_CROP_PERCENT) * 100;
  const renderedPreviewVariants = usesFramingProfiles
    ? FRAMING_PROFILE_PREVIEW_VARIANTS
    : previewVariants;

  function updateFocus(nextFocus: ImageFocusPoint) {
    if (usesFramingProfiles) {
      onFramingProfilesChange({
        ...framingProfiles,
        [activeProfile]: {
          ...framingProfiles[activeProfile],
          focusX: nextFocus.x,
          focusY: nextFocus.y,
        },
      });
      return;
    }

    onChange?.(nextFocus);
  }

  function updateCropPercent(nextCropPercent: number) {
    if (usesFramingProfiles) {
      onFramingProfilesChange({
        ...framingProfiles,
        [activeProfile]: {
          ...framingProfiles[activeProfile],
          cropPercent: normalizeImageCropPercent(nextCropPercent),
        },
      });
      return;
    }

    onCropPercentChange?.(nextCropPercent);
  }

  function updateFromPointer(event: PointerEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();

    if (bounds.width === 0 || bounds.height === 0) {
      return;
    }

    updateFocus(
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

  function handleSourceImageLoad(
    event: SyntheticEvent<HTMLImageElement>,
  ) {
    const { naturalWidth, naturalHeight } = event.currentTarget;

    if (naturalWidth > 0 && naturalHeight > 0) {
      setSourceAspectRatio(naturalWidth / naturalHeight);
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
        nextFocus = createImageFocusPoint(
          activeFocus.x - step,
          activeFocus.y,
        );
        break;
      case "ArrowRight":
        nextFocus = createImageFocusPoint(
          activeFocus.x + step,
          activeFocus.y,
        );
        break;
      case "ArrowUp":
        nextFocus = createImageFocusPoint(
          activeFocus.x,
          activeFocus.y - step,
        );
        break;
      case "ArrowDown":
        nextFocus = createImageFocusPoint(
          activeFocus.x,
          activeFocus.y + step,
        );
        break;
      case "Home":
        nextFocus = { ...CENTER_IMAGE_FOCUS };
        break;
      default:
        return;
    }

    event.preventDefault();
    updateFocus(nextFocus);
  }

  const isCentered = imageFocusPointsEqual(
    activeFocus,
    CENTER_IMAGE_FOCUS,
  );
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
            onClick={() => updateFocus({ ...CENTER_IMAGE_FOCUS })}
          >
            Center Focus
          </button>

          {cropEnabled && (
            <button
              type="button"
              className="du-button du-button-small du-button-rect"
              disabled={disabled || normalizedCrop === 0}
              onClick={() => updateCropPercent(0)}
            >
              Reset Crop
            </button>
          )}
        </div>
      </div>

      <div
        className={
          usesFramingProfiles
            ? "du-image-focus-workspace du-image-focus-workspace-profiles"
            : "du-image-focus-workspace"
        }
      >
        <div className="du-image-focus-editor">
          {cropEnabled && (
            <label className="du-image-crop-control">
              <span className="du-image-crop-heading">
                <span className="du-field-label">Crop depth</span>
                {usesFramingProfiles && (
                  <span
                    className="du-image-focus-editing-status"
                    role="status"
                    aria-live="polite"
                  >
                    Editing: {PROFILE_LABELS[activeProfile]}
                  </span>
                )}
              </span>
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
                    updateCropPercent(Number(event.currentTarget.value))
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
            aria-label={`Image focus at ${activeFocus.x} percent horizontally and ${activeFocus.y} percent vertically`}
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
              focusX={activeFocus.x}
              focusY={activeFocus.y}
              fit="contain"
              fill={false}
              className="du-image-focus-source"
              onLoad={handleSourceImageLoad}
            />
            {cropEnabled &&
              (usesFramingProfiles || normalizedCrop > 0) && (
                <span
                  className={
                    usesFramingProfiles
                      ? `du-image-focus-crop-frame du-image-focus-crop-frame-${activeProfile}`
                      : "du-image-focus-crop-frame"
                  }
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
              style={{
                left: `${activeFocus.x}%`,
                top: `${activeFocus.y}%`,
              }}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="du-image-focus-result">
          <span className="du-caption">
            {usesFramingProfiles ? "Framing profiles" : "Crop previews"}
          </span>
          {usesFramingProfiles && (
            <span className="du-image-focus-value">
              {activeFocus.x}% · {activeFocus.y}%
            </span>
          )}
          <div className="du-image-focus-preview-list">
            {renderedPreviewVariants.map((variant) => {
              const profileName = PROFILE_BY_PREVIEW_VARIANT[variant];
              const previewFraming =
                usesFramingProfiles && profileName
                  ? framingProfiles[profileName]
                  : activeFraming;
              const label =
                usesFramingProfiles && profileName
                  ? PROFILE_LABELS[profileName]
                  : PREVIEW_LABELS[variant];
              const preview = (
                <>
                  <span className="du-caption">{label}</span>
                  <span
                    className={`du-image-focus-preview du-image-focus-preview-${variant}`}
                  >
                    <FocalImage
                      src={imageUrl}
                      alt={`${imageAlt} ${label.toLowerCase()} preview`}
                      focusX={previewFraming.focusX}
                      focusY={previewFraming.focusY}
                      cropPercent={previewFraming.cropPercent}
                    />
                  </span>
                </>
              );

              if (usesFramingProfiles && profileName) {
                return (
                  <button
                    key={variant}
                    type="button"
                    className={
                      activeProfile === profileName
                        ? "du-image-focus-preview-item du-image-focus-profile-button du-image-focus-profile-button-active"
                        : "du-image-focus-preview-item du-image-focus-profile-button"
                    }
                    disabled={disabled}
                    aria-pressed={activeProfile === profileName}
                    aria-label={`Edit ${label} framing`}
                    onClick={() => setActiveProfile(profileName)}
                  >
                    {preview}
                  </button>
                );
              }

              return (
                <span
                  key={variant}
                  className="du-image-focus-preview-item"
                >
                  {preview}
                </span>
              );
            })}
          </div>
          {!usesFramingProfiles && (
            <span className="du-image-focus-value">
              {activeFocus.x}% · {activeFocus.y}%
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

export default ImageFocusPicker;
