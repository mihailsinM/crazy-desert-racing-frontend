import API_BASE_URL from "./api";
import type { UserResponse } from "../types/user";

export async function getCurrentUser(): Promise<UserResponse> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load current user");
  }

  return response.json();
}
