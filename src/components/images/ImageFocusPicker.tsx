import type {
  KeyboardEvent,
  PointerEvent,
} from "react";

import {
  CENTER_IMAGE_FOCUS,
  createImageFocusPoint,
  getImageObjectPosition,
  imageFocusPointsEqual,
  type ImageFocusPoint,
} from "../../utils/imageFocus";

type ImageFocusPickerProps = {
  imageUrl: string;
  value: ImageFocusPoint;
  onChange: (focus: ImageFocusPoint) => void;
  disabled?: boolean;
};

const KEYBOARD_FOCUS_STEP = 2;
const KEYBOARD_FOCUS_LARGE_STEP = 10;

function ImageFocusPicker({
  imageUrl,
  value,
  onChange,
  disabled = false,
}: ImageFocusPickerProps) {
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
  const objectPosition = getImageObjectPosition(value);

  return (
    <section className="du-image-focus-picker">
      <div className="du-image-focus-copy">
        <div>
          <p className="du-field-label">Choose image focus</p>
          <p className="du-caption">
            Click or drag the marker onto the most important part of the photo.
          </p>
        </div>

        <button
          type="button"
          className="du-button du-button-small du-button-rect"
          disabled={disabled || isCentered}
          onClick={() => onChange({ ...CENTER_IMAGE_FOCUS })}
        >
          Center Focus
        </button>
      </div>

      <div className="du-image-focus-workspace">
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
          <img src={imageUrl} alt="Choose the publication image focus" />
          <span
            className="du-image-focus-marker"
            style={{ left: `${value.x}%`, top: `${value.y}%` }}
            aria-hidden="true"
          />
        </button>

        <div className="du-image-focus-result">
          <span className="du-caption">Card preview</span>
          <span className="du-image-focus-card-preview">
            <img
              src={imageUrl}
              alt="Publication card preview"
              style={{ objectPosition }}
            />
          </span>
          <span className="du-image-focus-value">
            {value.x}% · {value.y}%
          </span>
        </div>
      </div>
    </section>
  );
}

export default ImageFocusPicker;
