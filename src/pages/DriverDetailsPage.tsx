import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import raceBackground from "../assets/race.png";
import DetailsCard from "../components/details/DetailsCard";
import AuthenticatedFocalImage from "../components/images/AuthenticatedFocalImage";
import FocalImage from "../components/images/FocalImage";
import UserAvatar from "../components/users/UserAvatar";
import { useAuth } from "../context/authContext";
import { getDriver } from "../services/driverService";
import { getRaceCarAssetUrl } from "../services/raceCarService";
import {
  deleteUserPhotoAsAdmin,
  hideUserPhotoAsAdmin,
  reportUserPhoto,
} from "../services/userPhotoService";
import type {
  DriverProfile,
  UserPhoto,
  UserPhotoReportReason,
} from "../types/driver";
import { getUserImageFraming } from "../utils/userImageFraming";

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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const driverId = Number(id);
  const validDriverId = Number.isInteger(driverId) && driverId > 0;
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyPhotoId, setBusyPhotoId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  async function handleAdminDelete(photoId: number) {
    if (!window.confirm("Permanently delete this reported photo?")) {
      return;
    }

    setBusyPhotoId(photoId);
    setError("");

    try {
      await deleteUserPhotoAsAdmin(photoId);
      setMessage("Photo deleted.");
      await refreshDriver();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to delete photo");
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
  const profileFraming = getUserImageFraming(driver);
  const usesProtectedImage = Boolean(
    driver.avatarUrl?.includes("/driver-photos/"),
  );

  return (
    <section className="du-page du-driver-profile-page">
      <DetailsCard
        className="du-driver-details"
        image={{
          src: driver.avatarUrl ?? raceBackground,
          alt: `${driver.name} profile card`,
          focusX: driver.avatarUrl ? profileFraming.card.focusX : 50,
          focusY: driver.avatarUrl ? profileFraming.card.focusY : 50,
          cropPercent: driver.avatarUrl ? profileFraming.card.cropPercent : 0,
          authenticated: usesProtectedImage,
        }}
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
              <button className="du-button" type="button" onClick={() => navigate("/dashboard")}>
                Edit My Profile
              </button>
            )}
            <button className="du-button" type="button" onClick={() => navigate("/drivers")}>
              ← All Drivers
            </button>
          </div>
        }
      >
        <div className="du-driver-intro">
          <UserAvatar
            name={driver.name}
            avatarUrl={driver.avatarUrl}
            imageFraming={driver.imageFraming}
            className="du-driver-profile-avatar"
          />
          <div>
            <p className="du-details-description">
              {driver.bio || "This driver has not added a public bio yet."}
            </p>
            {driver.location && <p className="du-text-soft">📍 {driver.location}</p>}
          </div>
        </div>

        <div className="du-driver-profile-stats">
          <span><strong>{driver.cars.length}</strong> Cars</span>
          <span><strong>{driver.races.length}</strong> Races</span>
          <span><strong>{driver.photos.length}</strong> Photos</span>
        </div>
      </DetailsCard>

      {message && <p className="du-image-optimization-message">{message}</p>}
      {error && <p className="du-error">{error}</p>}

      <section className="du-panel du-driver-section">
        <div className="du-page-header">
          <p className="du-eyebrow">Garage</p>
          <h2 className="du-title-lg">Driver Cars</h2>
        </div>
        {!driver.carsVisible ? (
          <p className="du-text-soft">This driver keeps their garage private.</p>
        ) : driver.cars.length === 0 ? (
          <p className="du-text-soft">No cars are shared yet.</p>
        ) : (
          <div className="du-media-grid">
            {driver.cars.map((car) => {
              const card = getUserImageFraming(car).card;
              const imageUrl = getRaceCarAssetUrl(car.imageUrl);
              return (
                <button
                  key={car.id}
                  type="button"
                  className="du-driver-content-card"
                  onClick={() => navigate(`/cars/${car.id}`)}
                >
                  <FocalImage
                    src={imageUrl ?? raceBackground}
                    alt={`${car.brand} ${car.name}`}
                    focusX={imageUrl ? card.focusX : 50}
                    focusY={imageUrl ? card.focusY : 50}
                    cropPercent={imageUrl ? card.cropPercent : 0}
                  />
                  <span className="du-driver-content-copy">
                    <strong>{car.brand} {car.name}</strong>
                    <span>{car.horsePower} HP</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="du-panel du-driver-section">
        <div className="du-page-header">
          <p className="du-eyebrow">Participation</p>
          <h2 className="du-title-lg">Race History</h2>
        </div>
        {!driver.raceHistoryVisible ? (
          <p className="du-text-soft">This driver keeps race history private.</p>
        ) : driver.races.length === 0 ? (
          <p className="du-text-soft">No shared race history yet.</p>
        ) : (
          <div className="du-card-list du-soft-scroll du-scroll-large du-list-4 du-list-row-medium">
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
      </section>

      <section className="du-panel du-driver-section">
        <div className="du-page-header">
          <p className="du-eyebrow">Gallery</p>
          <h2 className="du-title-lg">Driver Photos</h2>
        </div>
        {!driver.photosVisible ? (
          <p className="du-text-soft">This driver keeps their photos private.</p>
        ) : driver.photos.length === 0 ? (
          <p className="du-text-soft">No photos are shared yet.</p>
        ) : (
          <div className="du-media-grid">
            {driver.photos.map((photo) => {
              const card = getUserImageFraming(photo).card;
              return (
                <article key={photo.id} className="du-photo-card">
                  <div className="du-photo-card-media">
                    <AuthenticatedFocalImage
                      src={photo.imageUrl}
                      alt={photo.caption || `${driver.name} photo`}
                      focusX={card.focusX}
                      focusY={card.focusY}
                      cropPercent={card.cropPercent}
                    />
                  </div>
                  <div className="du-photo-card-copy">
                    <p>{photo.caption || "Shared club photo"}</p>
                    {!ownerView && currentUser?.role !== "ADMIN" && (
                      <button
                        type="button"
                        className="du-button du-button-small du-button-rect"
                        disabled={busyPhotoId === photo.id}
                        onClick={() => handleReport(photo)}
                      >
                        Report Photo
                      </button>
                    )}
                    {currentUser?.role === "ADMIN" && !ownerView && (
                      <div className="du-inline du-inline-sm du-inline-wrap">
                        <button
                          type="button"
                          className="du-button du-button-small"
                          disabled={busyPhotoId === photo.id}
                          onClick={() => handleAdminHide(photo.id)}
                        >
                          Hide
                        </button>
                        <button
                          type="button"
                          className="du-button du-button-small du-button-danger"
                          disabled={busyPhotoId === photo.id}
                          onClick={() => handleAdminDelete(photo.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

export default DriverDetailsPage;
