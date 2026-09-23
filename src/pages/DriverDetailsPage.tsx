import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import raceBackground from "../assets/race.png";
import DetailsCard from "../components/details/DetailsCard";
import AuthenticatedFocalImage from "../components/images/AuthenticatedFocalImage";
import GalleryPhotoViewer from "../components/images/GalleryPhotoViewer";
import RaceCarImage from "../components/images/RaceCarImage";
import UserAvatar from "../components/users/UserAvatar";
import { useAuth } from "../context/authContext";
import { getDriver } from "../services/driverService";
import { getRaceCarAssetUrl } from "../services/raceCarService";
import {
  hideUserPhotoAsAdmin,
  reportUserPhoto,
} from "../services/userPhotoService";
import type {
  DriverProfile,
  UserPhoto,
  UserPhotoReportReason,
} from "../types/driver";
import { getUserImageFraming } from "../utils/userImageFraming";
import { hasAdminAccess } from "../utils/userRole";

type ProfileSection = "cars" | "races" | "photos";
type GalleryFilter = "all" | "photos" | "cars";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTier(tier: DriverProfile["membershipTier"]): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

function DriverDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const driverId = Number(id);
  const validDriverId = Number.isInteger(driverId) && driverId > 0;
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyPhotoId, setBusyPhotoId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedSection, setSelectedSection] = useState<{
    driverId: number;
    section: ProfileSection;
  } | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<GalleryFilter>("all");
  const [viewedPhoto, setViewedPhoto] = useState<UserPhoto | null>(null);
  const routeState = location.state as { from?: string } | null;
  const ownerBackTarget = routeState?.from || "/drivers";
  const ownerBackLabel =
    ownerBackTarget === "/dashboard" ? "Back to Dashboard" : "Back";

  useEffect(() => {
    if (!validDriverId) {
      return;
    }

    let active = true;

    void getDriver(driverId)
      .then((loadedDriver) => {
        if (active) {
          setDriver(loadedDriver);
        }
      })
      .catch((caughtError) => {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load driver profile",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [driverId, validDriverId]);

  async function refreshDriver() {
    setDriver(await getDriver(driverId));
  }

  async function handleReport(photo: UserPhoto) {
    const reason = window.prompt(
      "Report reason: PRIVACY, COPYRIGHT, INAPPROPRIATE, or OTHER",
      "PRIVACY",
    )?.trim().toUpperCase() as UserPhotoReportReason | undefined;

    if (!reason) {
      return;
    }

    if (!["PRIVACY", "COPYRIGHT", "INAPPROPRIATE", "OTHER"].includes(reason)) {
      setError("Choose a valid report reason.");
      return;
    }

    const details = window.prompt("Optional details for the administrator:")?.trim();
    setBusyPhotoId(photo.id);
    setError("");
    setMessage("");

    try {
      await reportUserPhoto(photo.id, reason, details || null);
      setMessage("The photo report was sent to an administrator.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to report photo");
    } finally {
      setBusyPhotoId(null);
    }
  }

  async function handleAdminHide(photoId: number) {
    setBusyPhotoId(photoId);
    setError("");

    try {
      await hideUserPhotoAsAdmin(photoId);
      setMessage("Photo hidden from the public profile.");
      await refreshDriver();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to hide photo");
    } finally {
      setBusyPhotoId(null);
    }
  }

  if (!validDriverId) {
    return <p className="du-error">Invalid driver profile</p>;
  }

  if (loading) {
    return <p className="du-sand-text">Loading driver profile...</p>;
  }

  if (error && !driver) {
    return <p className="du-error">{error}</p>;
  }

  if (!driver) {
    return <p className="du-error">Driver not found</p>;
  }

  const ownerView = currentUser?.id === driver.id;

  if (viewedPhoto) {
    return (
      <GalleryPhotoViewer
        photos={driver.photos}
        activePhotoId={viewedPhoto.id}
        backLabel="Back to Gallery"
        fallbackCaption="Shared club photo"
        getAlt={(photo) => photo.caption || `${driver.name} photo`}
        onActivePhotoChange={(photoId) => {
          const nextPhoto = driver.photos.find((photo) => photo.id === photoId);
          if (nextPhoto) setViewedPhoto(nextPhoto);
        }}
        onBack={() => setViewedPhoto(null)}
        onSettings={ownerView
          ? (photoId) => navigate(`/profile/photos/${photoId}/settings`, {
              state: { from: location.pathname },
            })
          : undefined}
      />
    );
  }

  const galleryCars = driver.cars.flatMap((car) => {
    const imageUrl = getRaceCarAssetUrl(car.imageUrl);
    return imageUrl ? [{ car, imageUrl }] : [];
  });
  const galleryVisible = ownerView || driver.photosVisible || driver.carsVisible;
  const galleryItemCount = driver.photos.length + galleryCars.length;
  const activeGalleryFilter =
    (galleryFilter === "photos" && !ownerView && !driver.photosVisible) ||
    (galleryFilter === "cars" && !ownerView && !driver.carsVisible)
      ? "all"
      : galleryFilter;
  const filteredGalleryItemCount =
    (activeGalleryFilter === "cars" ? 0 : driver.photos.length) +
    (activeGalleryFilter === "photos" ? 0 : galleryCars.length);
  const cardFraming = getUserImageFraming({
    imageFraming: driver.cardImageFraming ?? driver.imageFraming,
  }).card;
  const cardImageUrl = driver.cardImageUrl ?? driver.avatarUrl;
  const activeSection = selectedSection?.driverId === driver.id
    ? selectedSection.section
    : null;
  const usesProtectedImage = Boolean(
    cardImageUrl?.includes("/driver-photos/"),
  );

  const shownDriverId = driver.id;

  function selectSection(section: ProfileSection) {
    setSelectedSection(
      activeSection === section ? null : { driverId: shownDriverId, section },
    );
  }

  return (
    <section className="du-page du-viewport-page du-driver-profile-page">
      <DetailsCard
        className="du-driver-details"
        image={{
          src: cardImageUrl ?? raceBackground,
          alt: `${driver.name} profile card`,
          focusX: cardImageUrl ? cardFraming.focusX : 50,
          focusY: cardImageUrl ? cardFraming.focusY : 50,
          cropPercent: cardImageUrl ? cardFraming.cropPercent : 0,
          authenticated: usesProtectedImage,
        }}
        scrollAll
        actionsClassName="du-push-bottom"
        eyebrow="Driver Details"
        title={driver.name}
        status={
          <span className="du-driver-statuses">
            {driver.verifiedDriver && (
              <span className="du-status du-status-verified">Verified Driver</span>
            )}
            <span className="du-status du-status-approved">
              {formatTier(driver.membershipTier)} Member
            </span>
          </span>
        }
        actions={
          <div className="du-details-secondary-actions">
            {ownerView && (
              <button
                className="du-button"
                type="button"
                onClick={() =>
                  navigate("/dashboard?view=profile&edit=public")
                }
              >
                Edit My Profile
              </button>
            )}
            {ownerView && routeState?.from ? (
              <button
                className="du-button"
                type="button"
                onClick={() => navigate(ownerBackTarget)}
              >
                ← {ownerBackLabel}
              </button>
            ) : (
              <button className="du-button" type="button" onClick={() => navigate("/drivers")}>
                ← All Drivers
              </button>
            )}
          </div>
        }
      >
        <div className="du-driver-intro">
          <div className="du-driver-profile-summary">
            <UserAvatar
              name={driver.name}
              avatarUrl={driver.avatarUrl}
              imageFraming={driver.imageFraming}
              className="du-driver-profile-avatar"
            />

            <div className="du-driver-profile-stats">
              <button
                type="button"
                className="du-driver-stat"
                disabled={!ownerView && !driver.carsVisible}
                aria-pressed={activeSection === "cars"}
                onClick={() => selectSection("cars")}
              >
                <strong>{ownerView || driver.carsVisible ? driver.cars.length : "Private"}</strong> Cars
              </button>
              <button
                type="button"
                className="du-driver-stat"
                disabled={!ownerView && !driver.raceHistoryVisible}
                aria-pressed={activeSection === "races"}
                onClick={() => selectSection("races")}
              >
                <strong>{ownerView || driver.raceHistoryVisible ? driver.races.length : "Private"}</strong> Races
              </button>
              <button
                type="button"
                className="du-driver-stat"
                disabled={!galleryVisible}
                aria-pressed={activeSection === "photos"}
                onClick={() => selectSection("photos")}
              >
                <strong>{galleryVisible ? galleryItemCount : "Private"}</strong> Driver Gallery
              </button>
            </div>
          </div>

          <div className="du-driver-profile-bio">
            <p className="du-details-description">
              {driver.bio || "This driver has not added a public bio yet."}
            </p>
            {driver.location && <p className="du-text-soft">📍 {driver.location}</p>}
          </div>
        </div>

        {ownerView && (!driver.carsVisible || !driver.raceHistoryVisible || !driver.photosVisible) && (
          <p className="du-caption du-driver-privacy-note">
            Hidden sections are visible only to you. To share them with other
            drivers, enable them under Edit Public Profile in My Profile.
          </p>
        )}

        {message && <p className="du-image-optimization-message">{message}</p>}
        {error && <p className="du-error">{error}</p>}

      {activeSection === "cars" && <section className="du-driver-section">
        {!ownerView && !driver.carsVisible ? (
          <p className="du-text-soft">This driver keeps their garage private.</p>
        ) : driver.cars.length === 0 ? (
          <p className="du-text-soft">No cars are shared yet.</p>
        ) : (
          <div className="du-media-grid du-driver-photo-grid">
            {driver.cars.map((car) => {
              const card = getUserImageFraming(car).card;
              const imageUrl = getRaceCarAssetUrl(car.imageUrl);
              return (
                <button
                  key={car.id}
                  type="button"
                  className="du-photo-card du-driver-gallery-car"
                  onClick={() => navigate(`/cars/${car.id}`)}
                >
                  <div className="du-photo-card-media">
                    <RaceCarImage
                      src={imageUrl ?? raceBackground}
                      alt={`${car.brand} ${car.name}`}
                      focusX={imageUrl ? card.focusX : 50}
                      focusY={imageUrl ? card.focusY : 50}
                      cropPercent={imageUrl ? card.cropPercent : 0}
                    />
                  </div>
                  <span className="du-photo-card-copy">
                    <strong>{car.brand} {car.name}</strong>
                    <span className="du-caption">Car · {car.horsePower} HP</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>}

      {activeSection === "races" && <section className="du-driver-section">
        <div className="du-page-header">
          <p className="du-eyebrow">Participation</p>
          <h2 className="du-title-lg">Race History</h2>
        </div>
        {!ownerView && !driver.raceHistoryVisible ? (
          <p className="du-text-soft">This driver keeps race history private.</p>
        ) : driver.races.length === 0 ? (
          <p className="du-text-soft">No shared race history yet.</p>
        ) : (
          <div className="du-card-list du-driver-races du-list-row-medium">
            {driver.races.map((race) => (
              <button
                key={race.registrationId}
                type="button"
                className="du-row-panel du-driver-row"
                onClick={() => navigate(`/races/${race.raceId}`)}
              >
                <span className="du-row-main">
                  <span className="du-row-title">{race.raceName}</span>
                  <span className="du-row-subtitle">📍 {race.location} · 📅 {formatDate(race.startDate)}</span>
                  <span className="du-row-subtitle">Car: {race.raceCarName}</span>
                </span>
                <span className={`du-status du-status-small du-status-${race.status.toLowerCase()}`}>
                  {race.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>}

      {activeSection === "photos" && <section className="du-driver-section">
        {!galleryVisible ? (
          <p className="du-text-soft">This driver keeps their gallery private.</p>
        ) : galleryItemCount === 0 ? (
          <p className="du-text-soft">No gallery photos are shared yet.</p>
        ) : (
          <>
            <div className="du-driver-gallery-filter" aria-label="Gallery filter">
              <button
                type="button"
                className="du-button du-button-small"
                aria-pressed={activeGalleryFilter === "all"}
                onClick={() => setGalleryFilter("all")}
              >
                All · {galleryItemCount}
              </button>
              {(ownerView || driver.photosVisible) && (
                <button
                  type="button"
                  className="du-button du-button-small"
                  aria-pressed={activeGalleryFilter === "photos"}
                  onClick={() => setGalleryFilter("photos")}
                >
                  Driver Photos · {driver.photos.length}
                </button>
              )}
              {(ownerView || driver.carsVisible) && (
                <button
                  type="button"
                  className="du-button du-button-small"
                  aria-pressed={activeGalleryFilter === "cars"}
                  onClick={() => setGalleryFilter("cars")}
                >
                  Cars · {galleryCars.length}
                </button>
              )}
            </div>

            {filteredGalleryItemCount === 0 ? (
              <p className="du-text-soft">No photos in this category yet.</p>
            ) : (
              <div className="du-media-grid du-driver-photo-grid">
                {activeGalleryFilter !== "cars" && driver.photos.map((photo) => {
                  const card = getUserImageFraming(photo).card;
                  return (
                    <article key={`photo-${photo.id}`} className="du-photo-card">
                      <button
                        type="button"
                        className="du-photo-card-media du-photo-open-button"
                        aria-label={`Open ${photo.caption || `${driver.name} photo`}`}
                        onClick={() => setViewedPhoto(photo)}
                      >
                        <AuthenticatedFocalImage
                          src={photo.imageUrl}
                          alt={photo.caption || `${driver.name} photo`}
                          focusX={card.focusX}
                          focusY={card.focusY}
                          cropPercent={card.cropPercent}
                        />
                      </button>
                      <div className="du-photo-card-copy">
                        <p>{photo.caption || "Shared club photo"}</p>
                        {!ownerView && !hasAdminAccess(currentUser?.role) && (
                          <button
                            type="button"
                            className="du-button du-button-small du-button-rect"
                            disabled={busyPhotoId === photo.id}
                            onClick={() => handleReport(photo)}
                          >
                            Report Photo
                          </button>
                        )}
                        {hasAdminAccess(currentUser?.role) && !ownerView && (
                          <button
                            type="button"
                            className="du-button du-button-small"
                            disabled={busyPhotoId === photo.id}
                            onClick={() => handleAdminHide(photo.id)}
                          >
                            Hide
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}

                {activeGalleryFilter !== "photos" && galleryCars.map(({ car, imageUrl }) => {
                  const card = getUserImageFraming(car).card;
                  return (
                    <button
                      key={`car-${car.id}`}
                      type="button"
                      className="du-photo-card du-driver-gallery-car"
                      onClick={() => navigate(`/cars/${car.id}`)}
                    >
                      <div className="du-photo-card-media">
                        <RaceCarImage
                          src={imageUrl}
                          alt={`${car.brand} ${car.name}`}
                          focusX={card.focusX}
                          focusY={card.focusY}
                          cropPercent={card.cropPercent}
                        />
                      </div>
                      <span className="du-photo-card-copy">
                        <strong>{car.brand} {car.name}</strong>
                        <span className="du-caption">Car · {car.horsePower} HP</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>}
      </DetailsCard>

    </section>
  );
}

export default DriverDetailsPage;
