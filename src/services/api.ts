const API_BASE_URL = "http://localhost:8080";

export function resolveApiAssetUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

export default API_BASE_URL;
