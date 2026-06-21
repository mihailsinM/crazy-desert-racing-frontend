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

export async function getAllUsers(): Promise<UserResponse[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load users");
  }

  return response.json();
}

export async function verifyUserLicense(userId: number): Promise<UserResponse> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/verify-license`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to verify license");
  }

  return response.json();
}

export async function makeUserAdmin(userId: number): Promise<UserResponse> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/users/${userId}/make-admin`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to make admin");
  }

  return response.json();
}
