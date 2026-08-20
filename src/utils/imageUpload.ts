import {
  compressImageForUpload,
  DEFAULT_MAX_SOURCE_IMAGE_BYTES,
} from "./imageCompression";

export const IMAGE_UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp";
export const MAX_STORED_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_SOURCE_IMAGE_SIZE_MB = Math.round(
  DEFAULT_MAX_SOURCE_IMAGE_BYTES / 1024 / 1024,
);

const ALLOWED_IMAGE_TYPES = new Set(IMAGE_UPLOAD_ACCEPT.split(","));

export function formatImageFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export async function prepareImageForUpload(file: File): Promise<File> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image.");
  }

  if (file.size > DEFAULT_MAX_SOURCE_IMAGE_BYTES) {
    throw new Error(
      `Choose an image smaller than ${MAX_SOURCE_IMAGE_SIZE_MB} MB.`,
    );
  }

  return compressImageForUpload(file, {
    maxBytes: MAX_STORED_IMAGE_BYTES,
    maxDimension: 1600,
    maxSourceBytes: DEFAULT_MAX_SOURCE_IMAGE_BYTES,
    outputType: "image/webp",
  });
}
