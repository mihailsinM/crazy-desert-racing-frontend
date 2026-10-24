import API_BASE_URL from "./api";
import { authenticatedFetch } from "./authService";
import type {
  MarketplaceListing,
  MarketplaceListingRequest,
  MarketplaceStatus,
} from "../types/marketplace";

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    const message = body && (typeof body.message === "string"
      ? body.message
      : Object.values(body).find((value) => typeof value === "string"));
    throw new Error(typeof message === "string" ? message : "Marketplace request failed");
  }
  return response.json() as Promise<T>;
}

export async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  return readJson(await authenticatedFetch(`${API_BASE_URL}/marketplace`));
}

export async function getMyMarketplaceListings(): Promise<MarketplaceListing[]> {
  return readJson(await authenticatedFetch(`${API_BASE_URL}/marketplace/my`));
}

export async function getMarketplaceListing(id: number): Promise<MarketplaceListing> {
  return readJson(await authenticatedFetch(`${API_BASE_URL}/marketplace/${id}`));
}

export async function saveMarketplaceListing(
  request: MarketplaceListingRequest,
  id?: number,
): Promise<MarketplaceListing> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/marketplace/my${id ? `/${id}` : ""}`,
    {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    },
  );
  return readJson(response);
}

export async function changeMarketplaceStatus(
  id: number,
  status: MarketplaceStatus,
): Promise<MarketplaceListing> {
  return readJson(await authenticatedFetch(
    `${API_BASE_URL}/marketplace/my/${id}/status`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  ));
}

export async function closeReportedMarketplaceListing(
  id: number,
  reason: string,
): Promise<MarketplaceListing> {
  return readJson(await authenticatedFetch(
    `${API_BASE_URL}/marketplace/admin/${id}/close`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  ));
}

export async function deleteClosedMarketplaceListing(id: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/marketplace/my/${id}`,
    { method: "DELETE" },
  );
  if (!response.ok) await readJson(response);
}
