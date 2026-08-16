import API_BASE_URL from "./api";
import { authenticatedFetch } from "./authService";
import type {
  UserProfileUpdateRequest,
  UserResponse,
} from "../types/user";

async function getResponseError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const responseBody = (await response.json()) as Record<string, unknown>;
    const message = Object.values(responseBody).find(
      (value): value is string => typeof value === "string",
    );

    return message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/me`);

  if (!response.ok) {
    throw new Error("Failed to load current user");
  }

  return response.json();
}

export async function updateCurrentUser(
  request: UserProfileUpdateRequest,
): Promise<UserResponse> {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      await getResponseError(response, "Failed to update profile"),
    );
  }

  return response.json();
}

export async function updateCurrentUserAvatar(
  avatar: File,
): Promise<UserResponse> {
  const formData = new FormData();
  formData.append("file", avatar);

  const response = await authenticatedFetch(
    `${API_BASE_URL}/users/me/avatar`,
    {
      method: "PUT",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(
      await getResponseError(response, "Failed to update profile photo"),
    );
  }

  return response.json();
}

export async function deleteCurrentUserAvatar(): Promise<UserResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/users/me/avatar`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getResponseError(response, "Failed to remove profile photo"),
    );
  }

  return response.json();
}

export function getUserAvatarImageUrl(
  avatarUrl: string | null,
): string | null {
  if (!avatarUrl) {
    return null;
  }

  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }

  return `${API_BASE_URL}${avatarUrl}`;
}

export async function getAllUsers(): Promise<UserResponse[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/users`);

  if (!response.ok) {
    throw new Error("Failed to load users");
  }

  return response.json();
}

export async function verifyUserLicense(userId: number): Promise<UserResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/users/${userId}/verify-license`,
    {
      method: "PUT",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to verify license");
  }

  return response.json();
}

export async function makeUserAdmin(userId: number): Promise<UserResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/users/${userId}/make-admin`,
    {
      method: "PUT",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to make admin");
  }

  return response.json();
}
