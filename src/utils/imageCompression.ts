export type ImageCompressionOptions = {
  maxBytes: number;
  maxDimension?: number;
  maxSourceBytes?: number;
  outputType?: "image/jpeg" | "image/webp";
};

const DEFAULT_MAX_DIMENSION = 1600;
export const DEFAULT_MAX_SOURCE_IMAGE_BYTES = 50 * 1024 * 1024;
const DEFAULT_OUTPUT_TYPE = "image/webp";
const MIN_DIMENSION = 640;
const INITIAL_QUALITY = 0.86;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.08;
const DIMENSION_STEP = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The selected image could not be opened."));
    };

    image.src = objectUrl;
  });
}

function renderImage(
  image: HTMLImageElement,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image optimization is unavailable in this browser.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvas;
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  outputType: "image/jpeg" | "image/webp",
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("The selected image could not be optimized."));
        }
      },
      outputType,
      quality,
    );
  });
}

function createOutputName(
  originalName: string,
  outputType: "image/jpeg" | "image/webp",
): string {
  const extension = outputType === "image/webp" ? "webp" : "jpg";
  const lastDotIndex = originalName.lastIndexOf(".");
  const baseName = lastDotIndex > 0
    ? originalName.slice(0, lastDotIndex)
    : originalName;

  return `${baseName}.${extension}`;
}

function toFile(
  blob: Blob,
  originalName: string,
  outputType: "image/jpeg" | "image/webp",
): File {
  return new File([blob], createOutputName(originalName, outputType), {
    type: outputType,
    lastModified: Date.now(),
  });
}

export async function compressImageForUpload(
  file: File,
  options: ImageCompressionOptions,
): Promise<File> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const maxSourceBytes =
    options.maxSourceBytes ?? DEFAULT_MAX_SOURCE_IMAGE_BYTES;
  const outputType = options.outputType ?? DEFAULT_OUTPUT_TYPE;

  if (file.size > maxSourceBytes) {
    throw new Error(
      `Choose an image smaller than ${Math.round(maxSourceBytes / 1024 / 1024)} MB.`,
    );
  }

  if (file.size <= options.maxBytes) {
    return file;
  }

  const image = await loadImage(file);
  const initialScale = Math.min(
    1,
    maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
  );
  let width = Math.max(1, Math.round(image.naturalWidth * initialScale));
  let height = Math.max(1, Math.round(image.naturalHeight * initialScale));
  let smallestBlob: Blob | null = null;

  while (true) {
    const canvas = renderImage(image, width, height);

    for (
      let quality = INITIAL_QUALITY;
      quality >= MIN_QUALITY;
      quality -= QUALITY_STEP
    ) {
      const blob = await encodeCanvas(canvas, outputType, quality);

      if (!smallestBlob || blob.size < smallestBlob.size) {
        smallestBlob = blob;
      }

      if (blob.size <= options.maxBytes) {
        return toFile(blob, file.name, outputType);
      }
    }

    if (Math.min(width, height) <= MIN_DIMENSION) {
      break;
    }

    width = Math.max(1, Math.round(width * DIMENSION_STEP));
    height = Math.max(1, Math.round(height * DIMENSION_STEP));
  }

  if (smallestBlob && smallestBlob.size <= options.maxBytes) {
    return toFile(smallestBlob, file.name, outputType);
  }

  throw new Error("The image is still too large after optimization.");
}
