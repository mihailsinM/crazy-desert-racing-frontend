import API_BASE_URL from "./api";
import { authenticatedFetch } from "./authService";
import type {
  DesertLiveCategory,
  DesertLiveItem,
  DesertLivePage,
  DesertLivePageQuery,
  DesertLiveWriteRequest,
} from "../types/desertLive";
import type { ImageFocusPoint } from "../utils/imageFocus";

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

function buildPageQuery(query: DesertLivePageQuery): string {
  const params = new URLSearchParams();

  if (query.category) {
    params.set("category", query.category);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  params.set("page", String(query.page ?? 0));
  params.set("size", String(query.size ?? 20));

  return params.toString();
}

function writeRequestInit(
  method: "POST" | "PUT",
  request: DesertLiveWriteRequest,
): RequestInit {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  };
}

function imageRequestInit(
  method: "PUT" | "DELETE",
  image?: File,
  focus?: ImageFocusPoint,
): RequestInit {
  if (method === "DELETE") {
    return { method };
  }

  const formData = new FormData();
  formData.append("file", image as File);

  if (focus) {
    formData.append("focusX", String(focus.x));
    formData.append("focusY", String(focus.y));
  }

  return {
    method,
    body: formData,
  };
}

function imageFocusRequestInit(focus: ImageFocusPoint): RequestInit {
  return {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      focusX: focus.x,
      focusY: focus.y,
    }),
  };
}

export function getDesertLiveAssetUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

export async function getRandomDesertLiveItems(
  category: DesertLiveCategory | undefined,
  limit: number,
): Promise<DesertLiveItem[]> {
  const params = new URLSearchParams({ limit: String(limit) });

  if (category) {
    params.set("category", category);
  }

  const response = await fetch(
    `${API_BASE_URL}/desert-live/random?${params.toString()}`,
  );

  return readJson(response, "Failed to load Desert Live updates");
}

export async function getPublicDesertLiveItems(
  query: DesertLivePageQuery,
): Promise<DesertLivePage> {
  const response = await fetch(
    `${API_BASE_URL}/desert-live?${buildPageQuery(query)}`,
  );

  return readJson(response, "Failed to load Desert Live");
}

export async function getPublicDesertLiveItem(
  id: number,
): Promise<DesertLiveItem> {
  const response = await fetch(`${API_BASE_URL}/desert-live/${id}`);
  return readJson(response, "Failed to load Desert Live publication");
}

export async function getMyDesertLiveItems(
  query: DesertLivePageQuery,
): Promise<DesertLivePage> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/my?${buildPageQuery(query)}`,
  );

  return readJson(response, "Failed to load your Desert Live publications");
}

export async function getMyDesertLiveItem(
  id: number,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/my/${id}`,
  );

  return readJson(response, "Failed to load your publication");
}

export async function createMyDesertLiveItem(
  request: DesertLiveWriteRequest,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/my`,
    writeRequestInit("POST", request),
  );

  return readJson(response, "Failed to create publication");
}

export async function updateMyDesertLiveItem(
  id: number,
  request: DesertLiveWriteRequest,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/my/${id}`,
    writeRequestInit("PUT", request),
  );

  return readJson(response, "Failed to update publication");
}

export async function deleteMyDesertLiveItem(id: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/my/${id}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Failed to delete publication"));
  }
}

export async function updateMyDesertLiveImage(
  id: number,
  image: File,
  focus: ImageFocusPoint,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/my/${id}/image`,
    imageRequestInit("PUT", image, focus),
  );

  return readJson(response, "Failed to update publication image");
}

export async function updateMyDesertLiveImageFocus(
  id: number,
  focus: ImageFocusPoint,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/my/${id}/image/focus`,
    imageFocusRequestInit(focus),
  );

  return readJson(response, "Failed to update publication image focus");
}

export async function deleteMyDesertLiveImage(
  id: number,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/my/${id}/image`,
    imageRequestInit("DELETE"),
  );

  return readJson(response, "Failed to remove publication image");
}

export async function getAdminDesertLiveItems(
  query: DesertLivePageQuery,
): Promise<DesertLivePage> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/admin?${buildPageQuery(query)}`,
  );

  return readJson(response, "Failed to load Desert Live moderation queue");
}

export async function getAdminDesertLiveItem(
  id: number,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/admin/${id}`,
  );

  return readJson(response, "Failed to load Desert Live publication");
}

export async function createAdminDesertLiveItem(
  request: DesertLiveWriteRequest,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/admin`,
    writeRequestInit("POST", request),
  );

  return readJson(response, "Failed to publish Desert Live update");
}

export async function updateAdminDesertLiveItem(
  id: number,
  request: DesertLiveWriteRequest,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/admin/${id}`,
    writeRequestInit("PUT", request),
  );

  return readJson(response, "Failed to update Desert Live publication");
}

export async function approveDesertLiveItem(
  id: number,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/admin/${id}/approve`,
    { method: "PUT" },
  );

  return readJson(response, "Failed to approve publication");
}

export async function rejectDesertLiveItem(
  id: number,
  reason: string,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/admin/${id}/reject`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    },
  );

  return readJson(response, "Failed to reject publication");
}

export async function updateAdminDesertLiveImage(
  id: number,
  image: File,
  focus: ImageFocusPoint,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/admin/${id}/image`,
    imageRequestInit("PUT", image, focus),
  );

  return readJson(response, "Failed to update publication image");
}

export async function updateAdminDesertLiveImageFocus(
  id: number,
  focus: ImageFocusPoint,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/admin/${id}/image/focus`,
    imageFocusRequestInit(focus),
  );

  return readJson(response, "Failed to update publication image focus");
}

export async function deleteAdminDesertLiveImage(
  id: number,
): Promise<DesertLiveItem> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/admin/${id}/image`,
    imageRequestInit("DELETE"),
  );

  return readJson(response, "Failed to remove publication image");
}

export async function deleteAdminDesertLiveItem(id: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/desert-live/admin/${id}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Failed to delete publication"));
  }
}
