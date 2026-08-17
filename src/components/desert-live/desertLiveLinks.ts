export function isDesertLiveTargetUrlAllowed(value: string): boolean {
  const targetUrl = value.trim();

  if (!targetUrl) {
    return true;
  }

  if (targetUrl.startsWith("/") && !targetUrl.startsWith("//")) {
    return true;
  }

  try {
    const parsedUrl = new URL(targetUrl);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}
