import API_BASE_URL from "./api";
import type {
  AuthenticationRequest,
  AuthenticationResponse,
} from "../types/auth";

const TOKEN_STORAGE_KEY = "token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function hasToken(): boolean {
  return Boolean(getToken());
}

export function getAuthorizationHeaders(): Record<string, string> {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

  const authentication = (await response.json()) as AuthenticationResponse;

  setToken(authentication.token);

  return authentication;
}
