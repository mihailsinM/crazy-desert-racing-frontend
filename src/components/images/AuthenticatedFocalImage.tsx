import { useEffect, useState, type ReactNode } from "react";

import { resolveApiAssetUrl } from "../../services/api";
import { authenticatedFetch } from "../../services/authService";
import FocalImage, { type FocalImageProps } from "./FocalImage";

type AuthenticatedFocalImageProps = FocalImageProps & {
  fallback?: ReactNode;
};

function requiresAuthentication(source: string): boolean {
  try {
    const path = new URL(source, window.location.origin).pathname;
    return path.startsWith("/driver-photos/")
      || path.startsWith("/chat/messages/");
  } catch {
    return false;
  }
}

function AuthenticatedFocalImage({
  src,
  fallback = null,
  ...imageProps
}: AuthenticatedFocalImageProps) {
  const directSource = resolveApiAssetUrl(src) ?? src;

  if (!requiresAuthentication(src)) {
    return <FocalImage {...imageProps} src={directSource} />;
  }

  return (
    <ProtectedFocalImage
      key={directSource}
      {...imageProps}
      src={directSource}
      fallback={fallback}
    />
  );
}

function ProtectedFocalImage({
  src,
  fallback = null,
  ...imageProps
}: AuthenticatedFocalImageProps) {
  const [resolvedSource, setResolvedSource] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    void authenticatedFetch(src)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load protected image");
        }

        return response.blob();
      })
      .then((blob) => {
        if (!active) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setResolvedSource(objectUrl);
      })
      .catch(() => {
        if (active) {
          setFailed(true);
        }
      });

    return () => {
      active = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (!resolvedSource || failed) {
    return <>{fallback}</>;
  }

  return <FocalImage {...imageProps} src={resolvedSource} />;
}

export default AuthenticatedFocalImage;
