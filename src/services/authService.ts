import API_BASE_URL from "./api";
import type {
  AuthenticationRequest,
  AuthenticationResponse,
} from "../types/auth";

const TOKEN_STORAGE_KEY = "token";
const AUTH_STATE_CHANGED_EVENT = "auth-state-changed";

function notifyAuthStateChanged(): void {
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  notifyAuthStateChanged();
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  notifyAuthStateChanged();
}

export function hasToken(): boolean {
  return Boolean(getToken());
}

export function subscribeToAuthChanges(listener: () => void): () => void {
  window.addEventListener(AUTH_STATE_CHANGED_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(AUTH_STATE_CHANGED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    removeToken();

    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }

  return response;
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
