import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import raceBackground from "../assets/race.png";
import DetailsCard from "../components/details/DetailsCard";
import AuthenticatedFocalImage from "../components/images/AuthenticatedFocalImage";
import GalleryPhotoViewer from "../components/images/GalleryPhotoViewer";
import {
  getRaceCarAssetUrl,
  getRaceCarById,
  getRaceCarGallery,
} from "../services/raceCarService";
import type { UserPhoto } from "../types/driver";
import type { RaceCar } from "../types/raceCar";
import { getRaceCarImageFraming } from "../utils/raceCarImageFraming";
import { getUserImageFraming } from "../utils/userImageFraming";

function CarGalleryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<RaceCar | null>(null);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [viewedPhoto, setViewedPhoto] = useState<UserPhoto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const carId = Number(id);
    void Promise.all([getRaceCarById(carId), getRaceCarGallery(carId)])
      .then(([loadedCar, loadedPhotos]) => {
        setCar(loadedCar);
        setPhotos(loadedPhotos);
      })
      .catch((caughtError) =>
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load the car gallery",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="du-sand-text">Loading car gallery...</p>;
  if (error || !car) {
    return <p className="du-error">{error || "Car not found."}</p>;
  }

  const carImageUrl = getRaceCarAssetUrl(car.imageUrl);
  const carFraming = getRaceCarImageFraming(car).card;

  if (viewedPhoto) {
    return (
      <GalleryPhotoViewer
        photos={photos}
        activePhotoId={viewedPhoto.id}
        backLabel="Back to Car Gallery"
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
        className="du-car-details"
        eyebrow="Car Gallery"
        title={<>{car.brand} {car.name}</>}
        image={{
          src: carImageUrl ?? raceBackground,
          alt: `${car.brand} ${car.name}`,
          focusX: carImageUrl ? carFraming.focusX : 50,
          focusY: carImageUrl ? carFraming.focusY : 50,
          cropPercent: carImageUrl ? carFraming.cropPercent : 0,
          authenticated: Boolean(car.imageUrl?.includes("/driver-photos/")),
        }}
        scrollable
        actions={
          <button
            type="button"
            className="du-button du-button-secondary du-sand-text"
            onClick={() => navigate(`/cars/${car.id}`)}
          >
            ← Back to Car
          </button>
        }
      >
        {photos.length === 0 ? (
          <p className="du-text-soft">No photos have been added to this car yet.</p>
        ) : (
          <div className="du-media-grid du-driver-photo-grid">
            {photos.map((photo) => {
              const framing = getUserImageFraming(photo).card;

              return (
                <article key={photo.id} className="du-photo-card">
                  <button
                    type="button"
                    className="du-photo-card-media du-photo-open-button"
                    aria-label={`View ${photo.caption || `${car.brand} ${car.name}`}`}
                    onClick={() => setViewedPhoto(photo)}
                  >
                    <AuthenticatedFocalImage
                      src={photo.imageUrl}
                      alt={photo.caption || `${car.brand} ${car.name}`}
                      focusX={framing.focusX}
                      focusY={framing.focusY}
                      cropPercent={framing.cropPercent}
                    />
                  </button>
                  <div className="du-photo-card-copy">
                    <p>{photo.caption || `${car.brand} ${car.name}`}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </DetailsCard>

    </section>
  );
}

export default CarGalleryPage;
