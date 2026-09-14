import API_BASE_URL from "./api";
import { authenticatedFetch } from "./authService";
import type {
  UserPhoto,
  UserPhotoReport,
  UserPhotoReportReason,
  UserPhotoReportStatus,
  UserPhotoUpdateRequest,
  UserPhotoUploadRequest,
} from "../types/driver";
import type { ImageFramingProfiles } from "../utils/imageFocus";

async function getResponseError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const body = (await response.json()) as Record<string, unknown>;
    return (
      Object.values(body).find(
        (value): value is string => typeof value === "string",
      ) ?? fallbackMessage
    );
  } catch {
    return fallbackMessage;
  }
}

async function readJson<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  if (!response.ok) {
    throw new Error(await getResponseError(response, fallbackMessage));
  }

  return response.json() as Promise<T>;
}

function appendFraming(
  formData: FormData,
  imageFraming: ImageFramingProfiles,
): void {
  formData.append("avatarFocusX", String(imageFraming.avatar.focusX));
  formData.append("avatarFocusY", String(imageFraming.avatar.focusY));
  formData.append(
    "avatarCropPercent",
    String(imageFraming.avatar.cropPercent),
  );
  formData.append("cardFocusX", String(imageFraming.card.focusX));
  formData.append("cardFocusY", String(imageFraming.card.focusY));
  formData.append("cardCropPercent", String(imageFraming.card.cropPercent));
}

export async function getCurrentUserPhotos(): Promise<UserPhoto[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/me/photos`);
  return readJson(response, "Failed to load your photos");
}

export async function uploadCurrentUserPhoto(
  request: UserPhotoUploadRequest,
): Promise<UserPhoto> {
  const formData = new FormData();
  formData.append("file", request.file);
  formData.append("rightsConfirmed", String(request.rightsConfirmed));
  formData.append("caption", request.caption ?? "");
  formData.append("visibility", request.visibility);
  appendFraming(formData, request.imageFraming);

  const response = await authenticatedFetch(`${API_BASE_URL}/users/me/photos`, {
    method: "POST",
    body: formData,
  });

  return readJson(response, "Failed to upload photo");
}

export async function updateCurrentUserPhoto(
  photoId: number,
  request: UserPhotoUpdateRequest,
): Promise<UserPhoto> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/users/me/photos/${photoId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    },
  );

  return readJson(response, "Failed to update photo");
}

export async function updateCurrentUserPhotoFraming(
  photoId: number,
  imageFraming: ImageFramingProfiles,
): Promise<UserPhoto> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/users/me/photos/${photoId}/framing`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(imageFraming),
    },
  );

  return readJson(response, "Failed to update photo framing");
}

export async function setCurrentUserProfilePhoto(
  photoId: number,
): Promise<UserPhoto> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/users/me/photos/${photoId}/profile`,
    { method: "PUT" },
  );

  return readJson(response, "Failed to set profile photo");
}

export async function deleteCurrentUserPhoto(photoId: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/users/me/photos/${photoId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Failed to delete photo"));
  }
}

export async function reportUserPhoto(
  photoId: number,
  reason: UserPhotoReportReason,
  details: string | null,
): Promise<UserPhotoReport> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/driver-photos/${photoId}/reports`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, details }),
    },
  );

  return readJson(response, "Failed to report photo");
}

export async function getOpenPhotoReports(): Promise<UserPhotoReport[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/admin/photo-reports`,
  );
  return readJson(response, "Failed to load photo reports");
}

export async function reviewPhotoReport(
  reportId: number,
  status: Exclude<UserPhotoReportStatus, "OPEN">,
): Promise<UserPhotoReport> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/admin/photo-reports/${reportId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );

  return readJson(response, "Failed to review photo report");
}

export async function hideUserPhotoAsAdmin(photoId: number): Promise<UserPhoto> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/admin/user-photos/${photoId}/hide`,
    { method: "PUT" },
  );
  return readJson(response, "Failed to hide photo");
}

export async function deleteUserPhotoAsAdmin(photoId: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/admin/user-photos/${photoId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Failed to delete photo"));
  }
}
