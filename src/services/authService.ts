import API_BASE_URL from "./api";
import type {
  AuthenticationRequest,
  AuthenticationResponse,
} from "../types/auth";

export async function login(
  request: AuthenticationRequest,
): Promise<AuthenticationResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}
