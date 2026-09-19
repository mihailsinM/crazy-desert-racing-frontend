import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import GalleryPhotoViewer from "../components/images/GalleryPhotoViewer";
import { getCurrentUserPhotos } from "../services/userPhotoService";
import type { UserPhoto } from "../types/driver";

type PhotoRouteState = { from?: string };

function ProfilePhotoViewerPage() {
  const { photoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<UserPhoto[] | null>(null);
  const [error, setError] = useState("");
  const parsedPhotoId = Number(photoId);
  const routeState = location.state as PhotoRouteState | null;
  const backTarget = routeState?.from || "/profile/photos";

  useEffect(() => {
    void getCurrentUserPhotos()
      .then(setPhotos)
      .catch((caughtError) =>
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load photo",
        ),
      );
  }, []);

  if (error) return <p className="du-error">{error}</p>;
  if (!photos) return <p className="du-sand-text">Loading photo...</p>;
  if (!photos.some((photo) => photo.id === parsedPhotoId)) {
    return <p className="du-error">Photo not found in your gallery.</p>;
  }

  return (
    <GalleryPhotoViewer
      photos={photos}
      activePhotoId={parsedPhotoId}
      backLabel="Back to My Gallery"
      fallbackCaption="No description"
      getAlt={(photo) => photo.caption || "Gallery photo"}
      onActivePhotoChange={(photoId) => navigate(`/profile/photos/${photoId}`, {
        replace: true,
        state: location.state,
      })}
      onBack={() => navigate(backTarget)}
      onSettings={(photoId) =>
        navigate(`/profile/photos/${photoId}/settings`, {
          state: { from: location.pathname },
        })
      }
    />
  );
}

export default ProfilePhotoViewerPage;
