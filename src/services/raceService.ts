import API_BASE_URL, { resolveApiAssetUrl } from "./api";
import { authenticatedFetch } from "./authService";
import type {
  Race,
  RaceImageFramingProfilesRequest,
  RaceStatus,
} from "../types/race";

async function getResponseError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const body = (await response.json()) as Record<string, unknown>;
    const explicitMessage = body.message;

    if (typeof explicitMessage === "string") {
      return explicitMessage;
    }

    const message = Object.values(body).find(
      (value): value is string => typeof value === "string",
    );

    return message ?? fallbackMessage;
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

export function getRaceAssetUrl(path: string | null): string | null {
  return resolveApiAssetUrl(path);
}

export async function getAllRaces(): Promise<Race[]> {
  const response = await fetch(`${API_BASE_URL}/races`);

  return readJson(response, "Failed to load races");
}

export async function getRaceById(id: number): Promise<Race> {
  const response = await fetch(`${API_BASE_URL}/races/${id}`);

  return readJson(response, "Failed to load race");
}

export type RaceCreateRequest = {
  name: string;
  location: string;
  startDate: string;
  maxParticipants: number;
};

export type RaceUpdateRequest = {
  name: string;
  location: string;
  startDate: string;
  maxParticipants: number;
  status: RaceStatus;
  adminMessage: string | null;
};

export async function createRace(request: RaceCreateRequest): Promise<Race> {
  const response = await authenticatedFetch(`${API_BASE_URL}/races`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return readJson(response, "Failed to create race");
}

export async function updateRace(
  id: number,
  request: RaceUpdateRequest,
): Promise<Race> {
  const response = await authenticatedFetch(`${API_BASE_URL}/races/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return readJson(response, "Failed to update race");
}

export async function updateRaceImage(
  id: number,
  image: File,
  framing: RaceImageFramingProfilesRequest,
): Promise<Race> {
  const formData = new FormData();
  formData.append("file", image);
  formData.append("avatarFocusX", String(framing.avatar.focusX));
  formData.append("avatarFocusY", String(framing.avatar.focusY));
  formData.append(
    "avatarCropPercent",
    String(framing.avatar.cropPercent),
  );
  formData.append("cardFocusX", String(framing.card.focusX));
  formData.append("cardFocusY", String(framing.card.focusY));
  formData.append("cardCropPercent", String(framing.card.cropPercent));

  const response = await authenticatedFetch(
    `${API_BASE_URL}/races/${id}/image`,
    {
      method: "PUT",
      body: formData,
    },
  );

  return readJson(response, "Failed to upload race image");
}

export async function updateRaceImageFraming(
  id: number,
  framing: RaceImageFramingProfilesRequest,
): Promise<Race> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/races/${id}/image/framing`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(framing),
    },
  );

  return readJson(response, "Failed to update race image framing");
}

export async function deleteRaceImage(id: number): Promise<Race> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/races/${id}/image`,
    { method: "DELETE" },
  );

  return readJson(response, "Failed to remove race image");
}

export async function deleteRace(id: number): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE_URL}/races/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Failed to delete race"));
  }
}

export async function synchronizeRacePublications(): Promise<number> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/races/publications/synchronize`,
    { method: "POST" },
  );
  const body = await readJson<{ synchronizedRaces: number }>(
    response,
    "Failed to synchronize Desert Live races",
  );

  return body.synchronizedRaces;
}
