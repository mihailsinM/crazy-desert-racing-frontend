import API_BASE_URL, { resolveApiAssetUrl } from "./api";
import { authenticatedFetch } from "./authService";
import type {
  RaceCar,
  RaceCarImageFramingProfilesRequest,
  RaceCarWriteRequest,
} from "../types/raceCar";

async function getResponseError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const body = (await response.json()) as Record<string, unknown>;
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

export function getRaceCarAssetUrl(path: string | null): string | null {
  if (!path || path.startsWith("/images/")) {
    return path;
  }

  return resolveApiAssetUrl(path);
}

export async function getAllRaceCars(): Promise<RaceCar[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/race-cars`);

  return readJson(response, "Failed to load race cars");
}

export async function getMyRaceCars(): Promise<RaceCar[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/race-cars/my`);

  return readJson(response, "Failed to load your race cars");
}

export async function createMyRaceCar(
  raceCar: RaceCarWriteRequest,
): Promise<RaceCar> {
  const response = await authenticatedFetch(`${API_BASE_URL}/race-cars/my`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(raceCar),
  });

  return readJson(response, "Failed to create race car");
}

export async function getRaceCarById(id: number): Promise<RaceCar> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/race-cars/${id}`,
  );

  return readJson(response, "Failed to load race car details");
}

export async function updateRaceCar(
  id: number,
  raceCar: RaceCarWriteRequest,
): Promise<RaceCar> {
  const response = await authenticatedFetch(`${API_BASE_URL}/race-cars/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(raceCar),
  });

  return readJson(response, "Failed to update race car");
}

export async function updateRaceCarImage(
  id: number,
  image: File,
  framing: RaceCarImageFramingProfilesRequest,
): Promise<RaceCar> {
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
    `${API_BASE_URL}/race-cars/${id}/image`,
    {
      method: "PUT",
      body: formData,
    },
  );

  return readJson(response, "Failed to upload race car image");
}

export async function updateRaceCarImageFraming(
  id: number,
  framing: RaceCarImageFramingProfilesRequest,
): Promise<RaceCar> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/race-cars/${id}/image/framing`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(framing),
    },
  );

  return readJson(response, "Failed to update race car image framing");
}

export async function deleteRaceCarImage(id: number): Promise<RaceCar> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/race-cars/${id}/image`,
    { method: "DELETE" },
  );

  return readJson(response, "Failed to remove race car image");
}

export async function deleteRaceCar(id: number): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE_URL}/race-cars/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete race car");
  }
}
