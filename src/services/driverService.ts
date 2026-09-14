import API_BASE_URL from "./api";
import { authenticatedFetch } from "./authService";
import type {
  DriverProfile,
  DriverSummary,
  PublicProfileUpdateRequest,
} from "../types/driver";

async function readJson<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    const message = body
      ? Object.values(body).find(
        (value): value is string => typeof value === "string",
      )
      : null;

    throw new Error(message ?? fallbackMessage);
  }

  return response.json() as Promise<T>;
}

export async function getDrivers(): Promise<DriverSummary[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/drivers`);
  return readJson(response, "Failed to load drivers");
}

export async function getDriver(id: number): Promise<DriverProfile> {
  const response = await authenticatedFetch(`${API_BASE_URL}/drivers/${id}`);
  return readJson(response, "Failed to load driver profile");
}

export async function getCurrentDriver(): Promise<DriverProfile> {
  const response = await authenticatedFetch(`${API_BASE_URL}/drivers/me`);
  return readJson(response, "Failed to load your public profile");
}

export async function updateCurrentDriver(
  request: PublicProfileUpdateRequest,
): Promise<DriverProfile> {
  const response = await authenticatedFetch(`${API_BASE_URL}/drivers/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  return readJson(response, "Failed to update your public profile");
}
