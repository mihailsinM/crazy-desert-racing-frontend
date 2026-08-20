import type { ImgHTMLAttributes } from "react";

import {
  createImageFocusPoint,
  getImageCropScale,
  getImageObjectPosition,
  normalizeImageCropPercent,
} from "../../utils/imageFocus";

export type FocalImageFit = "cover" | "contain";

type FocalImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "alt" | "src"
> & {
  src: string;
  alt: string;
  focusX?: number;
  focusY?: number;
  cropPercent?: number;
  fit?: FocalImageFit;
  fill?: boolean;
};

function FocalImage({
  src,
  alt,
  focusX,
  focusY,
  cropPercent,
  fit = "cover",
  fill = true,
  className,
  style,
  ...imageProps
}: FocalImageProps) {
  const focus = createImageFocusPoint(focusX, focusY);
  const normalizedCrop = normalizeImageCropPercent(cropPercent);
  const cropScale = getImageCropScale(normalizedCrop);
  const classes = [
    "du-focal-image",
    fill ? "du-focal-image-fill" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      {...imageProps}
      src={src}
      alt={alt}
      className={classes}
      style={{
        ...style,
        objectFit: fit,
        objectPosition: getImageObjectPosition(focus),
        transform: normalizedCrop > 0 ? `scale(${cropScale})` : undefined,
        transformOrigin: `${focus.x}% ${focus.y}%`,
      }}
    />
  );
}

export default FocalImage;
