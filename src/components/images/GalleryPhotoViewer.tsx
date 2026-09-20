import { useEffect } from "react";

import type { ImageFramingProfiles } from "../../utils/imageFocus";
import { getUserImageFraming } from "../../utils/userImageFraming";
import AuthenticatedFocalImage from "./AuthenticatedFocalImage";

export type GalleryPhotoViewerItem = {
  id: number;
  imageUrl: string;
  caption?: string | null;
  imageFraming?: ImageFramingProfiles | null;
};

type GalleryPhotoViewerProps = {
  photos: GalleryPhotoViewerItem[];
  activePhotoId: number;
  backLabel: string;
  fallbackCaption: string;
  getAlt: (photo: GalleryPhotoViewerItem) => string;
  onActivePhotoChange: (photoId: number) => void;
  onBack: () => void;
  onSettings?: (photoId: number) => void;
};

function GalleryPhotoViewer({
  photos,
  activePhotoId,
  backLabel,
  fallbackCaption,
  getAlt,
  onActivePhotoChange,
  onBack,
  onSettings,
}: GalleryPhotoViewerProps) {
  const activeIndex = photos.findIndex((photo) => photo.id === activePhotoId);
  const activePhoto = photos[activeIndex];
  const previousPhoto = activeIndex > 0 ? photos[activeIndex - 1] : null;
  const nextPhoto = activeIndex >= 0 && activeIndex < photos.length - 1
    ? photos[activeIndex + 1]
    : null;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" && previousPhoto) {
        onActivePhotoChange(previousPhoto.id);
      }

      if (event.key === "ArrowRight" && nextPhoto) {
        onActivePhotoChange(nextPhoto.id);
      }

      if (event.key === "Escape") {
        onBack();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPhoto, onActivePhotoChange, onBack, previousPhoto]);

  if (!activePhoto) {
    return <p className="du-error">Photo not found.</p>;
  }

  const framing = getUserImageFraming(activePhoto).card;

  return (
    <section className="du-photo-viewer-page">
      <div className="du-photo-viewer-media">
        <AuthenticatedFocalImage
          src={activePhoto.imageUrl}
          alt={getAlt(activePhoto)}
          focusX={framing.focusX}
          focusY={framing.focusY}
          cropPercent={framing.cropPercent}
        />

        <div className="du-photo-viewer-overlay-actions">
          <button
            type="button"
            className="du-button du-button-small du-button-rect"
            onClick={onBack}
          >
            ← {backLabel}
          </button>
          {onSettings && (
            <button
              type="button"
              className="du-button du-button-small du-button-rect"
              onClick={() => onSettings(activePhoto.id)}
            >
              <span aria-hidden="true">⚙</span> Settings
            </button>
          )}
        </div>

        <div className="du-photo-viewer-navigation" aria-label="Gallery navigation">
          {previousPhoto ? (
            <button
              type="button"
              className="du-photo-viewer-arrow du-photo-viewer-arrow-left"
              aria-label="Previous photo"
              onClick={() => onActivePhotoChange(previousPhoto.id)}
            >
              ‹
            </button>
          ) : <span />}
          {nextPhoto && (
            <button
              type="button"
              className="du-photo-viewer-arrow du-photo-viewer-arrow-right"
              aria-label="Next photo"
              onClick={() => onActivePhotoChange(nextPhoto.id)}
            >
              ›
            </button>
          )}
        </div>
      </div>

      <div className="du-photo-viewer-caption">
        <h1 className="du-title-sm">
          {activePhoto.caption || fallbackCaption}
        </h1>
      </div>
    </section>
  );
}

export default GalleryPhotoViewer;
