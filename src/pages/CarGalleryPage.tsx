import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import raceBackground from "../assets/race.png";
import DetailsCard from "../components/details/DetailsCard";
import AuthenticatedFocalImage from "../components/images/AuthenticatedFocalImage";
import GalleryPhotoViewer from "../components/images/GalleryPhotoViewer";
import { useAuth } from "../context/authContext";
import {
  addRaceCarGalleryPhoto,
  assignGalleryPhotoToRaceCar,
  getRaceCarAssetUrl,
  getRaceCarById,
  getRaceCarGallery,
  removeRaceCarGalleryPhoto,
} from "../services/raceCarService";
import { getCurrentUserPhotos } from "../services/userPhotoService";
import type { UserPhoto } from "../types/driver";
import type { RaceCar } from "../types/raceCar";
import { getRaceCarImageFraming } from "../utils/raceCarImageFraming";
import { getUserImageFraming } from "../utils/userImageFraming";

function CarGalleryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [car, setCar] = useState<RaceCar | null>(null);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [myPhotos, setMyPhotos] = useState<UserPhoto[]>([]);
  const [viewedPhoto, setViewedPhoto] = useState<UserPhoto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [openPhotoMenuId, setOpenPhotoMenuId] = useState<number | null>(null);
  const photoMenuRef = useRef<HTMLDivElement>(null);
  const photoMenuTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (openPhotoMenuId === null) return;

    function dismissMenu(event: PointerEvent) {
      if (!photoMenuRef.current?.contains(event.target as Node)) {
        setOpenPhotoMenuId(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPhotoMenuId(null);
        photoMenuTriggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", dismissMenu);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissMenu);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openPhotoMenuId]);

  useEffect(() => {
    if (!id) return;

    const carId = Number(id);
    void Promise.all([getRaceCarById(carId), getRaceCarGallery(carId)])
      .then(([loadedCar, loadedPhotos]) => {
        setCar(loadedCar);
        setPhotos(loadedPhotos);
        if (loadedCar.ownerId === currentUser?.id) {
          void getCurrentUserPhotos().then(setMyPhotos).catch(() => {
            setError("Failed to load My Gallery photos");
          });
        }
      })
      .catch((caughtError) =>
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load the car gallery",
        ),
      )
      .finally(() => setLoading(false));
  }, [id, currentUser?.id]);

  async function changeGallery(action: () => Promise<RaceCar>, success: string) {
    if (!car) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const updatedCar = await action();
      setCar(updatedCar);
      setPhotos(await getRaceCarGallery(car.id));
      setMessage(success);
      setShowPhotoPicker(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error
        ? caughtError.message : "Failed to update car gallery");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="du-sand-text">Loading car gallery...</p>;
  if (!car) {
    return <p className="du-error">{error || "Car not found."}</p>;
  }

  const carImageUrl = getRaceCarAssetUrl(car.imageUrl);
  const carFraming = getRaceCarImageFraming(car).card;
  const ownsCar = car.ownerId === currentUser?.id;
  const coverPhotoId = Number(car.imageUrl?.match(/\/driver-photos\/(\d+)\/image/)?.[1]);
  const availablePhotos = myPhotos.filter((photo) => photo.visibility !== "PRIVATE"
    && !photos.some((selected) => selected.id === photo.id));

  if (viewedPhoto) {
    return (
      <GalleryPhotoViewer
        photos={photos}
        activePhotoId={viewedPhoto.id}
        fallbackCaption={`${car.brand} ${car.name}`}
        getAlt={(photo) => photo.caption || `${car.brand} ${car.name}`}
        onActivePhotoChange={(photoId) => {
          const nextPhoto = photos.find((photo) => photo.id === photoId);
          if (nextPhoto) setViewedPhoto(nextPhoto);
        }}
        onBack={() => setViewedPhoto(null)}
      />
    );
  }

  return (
    <section className="du-page du-viewport-page">
      <DetailsCard
        className="du-car-details du-car-gallery-details"
        eyebrow="Car Gallery"
        title={<>{car.brand} {car.name}</>}
        status={
          <button
            type="button"
            className="du-button du-button-small du-button-rect du-button-back du-sand-text"
            onClick={() => navigate(`/cars/${car.id}`)}
          >
            ← Back
          </button>
        }
        image={{
          src: carImageUrl ?? raceBackground,
          alt: `${car.brand} ${car.name}`,
          focusX: carImageUrl ? carFraming.focusX : 50,
          focusY: carImageUrl ? carFraming.focusY : 50,
          cropPercent: carImageUrl ? carFraming.cropPercent : 0,
          mobileFraming: carImageUrl ? car.mobileImageFraming ?? carFraming : undefined,
          authenticated: Boolean(car.imageUrl?.includes("/driver-photos/")),
        }}
        scrollable
      >
        {ownsCar && (
          <div className="du-inline du-inline-sm du-inline-wrap du-car-gallery-actions">
            {availablePhotos.length > 0 && (
              <button type="button" className="du-button du-button-small du-button-rect"
                aria-expanded={showPhotoPicker} aria-controls="car-gallery-photo-picker"
                disabled={busy} onClick={() => setShowPhotoPicker((visible) => !visible)}>
                Add from My Gallery
              </button>
            )}
            <button type="button" className="du-button du-button-small du-button-rect"
              onClick={() => navigate("/profile/photos")}>Upload to My Gallery</button>
          </div>
        )}
        <div className="du-car-gallery-photos-scroll du-scroll-large">
          {ownsCar && showPhotoPicker && availablePhotos.length > 0 && (
            <div className="du-car-gallery-photo-picker" id="car-gallery-photo-picker">
              <p className="du-caption">Which photo do you want to add?</p>
              <div className="du-car-gallery-photo-options du-soft-scroll">
                {availablePhotos.map((photo) => {
                  const framing = getUserImageFraming(photo).card;
                  return (
                    <button key={photo.id} type="button"
                      className="du-photo-card du-driver-gallery-car"
                      aria-label={`Add ${photo.caption || "this photo"} to ${car.brand} ${car.name}`}
                      disabled={busy}
                      onClick={() => void changeGallery(
                        () => addRaceCarGalleryPhoto(car.id, photo.id),
                        "Photo added to this car.",
                      )}>
                      <span className="du-photo-card-media">
                        <AuthenticatedFocalImage src={photo.imageUrl}
                          alt={photo.caption || "Gallery photo"}
                          focusX={framing.focusX} focusY={framing.focusY}
                          cropPercent={framing.cropPercent} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {message && <p className="du-image-optimization-message">{message}</p>}
          {error && <p className="du-error">{error}</p>}
          {photos.length === 0 ? (
            <p className="du-text-soft">No photos have been added to this car yet.</p>
          ) : (
            <div className="du-media-grid du-driver-photo-grid">
              {photos.map((photo) => {
                const framing = getUserImageFraming(photo).card;

                return (
                  <article key={photo.id} className="du-photo-card du-car-gallery-photo-card">
                    <button
                      type="button"
                      className="du-photo-card-media du-photo-open-button"
                      aria-label={`View ${photo.caption || `${car.brand} ${car.name}`}`}
                      onClick={() => {
                        setOpenPhotoMenuId(null);
                        setViewedPhoto(photo);
                      }}
                    >
                      <AuthenticatedFocalImage
                        src={photo.imageUrl}
                        alt={photo.caption || `${car.brand} ${car.name}`}
                        focusX={framing.focusX}
                        focusY={framing.focusY}
                        cropPercent={framing.cropPercent}
                      />
                    </button>
                    <div className="du-car-gallery-photo-overlay"
                      ref={openPhotoMenuId === photo.id ? photoMenuRef : undefined}>
                      <span className="du-details-eyebrow du-car-gallery-photo-label">
                        {car.brand} {car.name}
                      </span>
                      {ownsCar && (
                        <button type="button" className="du-button du-button-options"
                          ref={openPhotoMenuId === photo.id ? photoMenuTriggerRef : undefined}
                          aria-label={`Options for ${car.brand} ${car.name} photo`}
                          aria-haspopup="menu"
                          aria-expanded={openPhotoMenuId === photo.id}
                          aria-controls={`car-photo-menu-${photo.id}`}
                          disabled={busy}
                          onClick={() => setOpenPhotoMenuId((current) =>
                            current === photo.id ? null : photo.id)}>
                          <span aria-hidden="true">•••</span>
                        </button>
                      )}
                      {ownsCar && openPhotoMenuId === photo.id && (
                        <div className="du-filter-menu du-car-gallery-photo-menu"
                          id={`car-photo-menu-${photo.id}`} role="menu" aria-label="Photo options">
                          <button type="button" className="du-filter-option" role="menuitem"
                            disabled={busy || coverPhotoId === photo.id}
                            onClick={() => {
                              setOpenPhotoMenuId(null);
                              void changeGallery(
                                () => assignGalleryPhotoToRaceCar(car.id, photo.id),
                                "Car cover updated.",
                              );
                            }}>
                            <span className="du-filter-option-icon" aria-hidden="true">▣</span>
                            <span>{coverPhotoId === photo.id ? "Current car cover" : "Set as car cover"}</span>
                          </button>
                          <button type="button" className="du-filter-option" role="menuitem"
                            onClick={() => navigate(`/profile/photos/${photo.id}/settings`, {
                              state: { from: `/cars/${car.id}/gallery`, initialProfile: "card" },
                            })}>
                            <span className="du-filter-option-icon" aria-hidden="true">⚙</span>
                            <span>Settings</span>
                          </button>
                          <button type="button" className="du-filter-option" role="menuitem"
                            disabled={busy}
                            onClick={() => {
                              setOpenPhotoMenuId(null);
                              if (window.confirm("Remove from this car? The photo stays in My Gallery.")) {
                                void changeGallery(
                                  () => removeRaceCarGalleryPhoto(car.id, photo.id),
                                  "Photo removed from this car.",
                                );
                              }
                            }}>
                            <span className="du-filter-option-icon" aria-hidden="true">×</span>
                            <span>Remove from gallery</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </DetailsCard>

    </section>
  );
}

export default CarGalleryPage;
