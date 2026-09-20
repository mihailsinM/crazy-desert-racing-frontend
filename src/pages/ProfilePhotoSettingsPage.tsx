import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import ImageFocusPicker from "../components/images/ImageFocusPicker";
import DesertLiveMenuFilter from "../components/desert-live/DesertLiveMenuFilter";
import PhotoVisibilitySelect from "../components/users/PhotoVisibilitySelect";
import { useAuth } from "../context/authContext";
import {
  getMyRaceCars,
  assignGalleryPhotoToRaceCar,
} from "../services/raceCarService";
import {
  deleteCurrentUserPhoto,
  getCurrentUserPhotos,
  setCurrentUserCardPhoto,
  setCurrentUserProfilePhoto,
  updateCurrentUserPhoto,
  updateCurrentUserPhotoFraming,
} from "../services/userPhotoService";
import type { UserPhoto, UserPhotoVisibility } from "../types/driver";
import type { RaceCar } from "../types/raceCar";
import type { ImageFramingProfiles } from "../utils/imageFocus";
import { getUserImageFraming } from "../utils/userImageFraming";

type PhotoRouteState = { from?: string };

function ProfilePhotoSettingsPage() {
  const { photoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshCurrentUser } = useAuth();
  const [photo, setPhoto] = useState<UserPhoto | null>(null);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] =
    useState<UserPhotoVisibility>("MEMBERS_ONLY");
  const [framing, setFraming] = useState<ImageFramingProfiles | null>(null);
  const [cars, setCars] = useState<RaceCar[]>([]);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const parsedPhotoId = Number(photoId);
  const validPhotoId = Number.isInteger(parsedPhotoId);
  const routeState = location.state as PhotoRouteState | null;
  const backTarget = routeState?.from || "/profile/photos";
  const backLabel =
    backTarget === "/profile/photos" ? "Back to My Gallery" : "Back to Photo";

  const loadPhoto = useCallback(async () => {
    const photos = await getCurrentUserPhotos();
    const selectedPhoto = photos.find((item) => item.id === parsedPhotoId);
    if (!selectedPhoto) throw new Error("Photo not found in your gallery.");

    setPhoto(selectedPhoto);
    setDescription(selectedPhoto.caption ?? "");
    setVisibility(selectedPhoto.visibility);
    setFraming(getUserImageFraming(selectedPhoto));
  }, [parsedPhotoId]);

  useEffect(() => {
    if (!validPhotoId) return;

    void getCurrentUserPhotos()
      .then((photos) => {
        const selectedPhoto = photos.find((item) => item.id === parsedPhotoId);
        if (!selectedPhoto) throw new Error("Photo not found in your gallery.");

        setPhoto(selectedPhoto);
        setDescription(selectedPhoto.caption ?? "");
        setVisibility(selectedPhoto.visibility);
        setFraming(getUserImageFraming(selectedPhoto));
      })
      .catch((caughtError) =>
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load photo settings",
        ),
      )
      .finally(() => setLoading(false));
  }, [parsedPhotoId, validPhotoId]);

  useEffect(() => {
    void getMyRaceCars()
      .then((loadedCars) => {
        setCars(loadedCars);
      })
      .catch(() => setError("Failed to load your cars."));
  }, []);

  async function runPhotoAction(
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await action();
      await loadPhoto();
      await refreshCurrentUser();
      setMessage(successMessage);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update photo",
      );
    } finally {
      setSaving(false);
    }
  }

  async function savePhoto() {
    if (!photo || !framing) return;
    await runPhotoAction(
      async () => {
        await updateCurrentUserPhoto(photo.id, {
          caption: description.trim() || null,
          visibility,
        });
        await updateCurrentUserPhotoFraming(photo.id, framing);
      },
      "Photo settings saved.",
    );
  }

  async function deletePhoto() {
    if (!photo || !window.confirm("Delete this photo permanently?")) return;
    setSaving(true);
    setError("");
    try {
      await deleteCurrentUserPhoto(photo.id);
      await refreshCurrentUser();
      navigate("/profile/photos", { replace: true });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete photo",
      );
      setSaving(false);
    }
  }

  async function assignAsCarPhoto(carId: string) {
    if (!photo || !carId) return;
    setSelectedCarId(carId);
    const selectedCar = cars.find((car) => String(car.id) === carId);
    await runPhotoAction(
      () => assignGalleryPhotoToRaceCar(Number(carId), photo.id),
      selectedCar
        ? `Photo assigned to ${selectedCar.brand} ${selectedCar.name}.`
        : "Photo assigned to your car.",
    );
  }

  if (!validPhotoId) {
    return <p className="du-error">Invalid photo address.</p>;
  }

  if (loading) return <p className="du-sand-text">Loading photo settings...</p>;

  if (!photo || !framing) {
    return (
      <section className="du-content-page">
        <p className="du-error">{error || "Photo not found."}</p>
        <button
          type="button"
          className="du-button du-button-rect"
          onClick={() => navigate(backTarget)}
        >
          ← {backLabel}
        </button>
      </section>
    );
  }

  return (
    <section className="du-content-page du-photo-settings-page">
      <div className="du-photo-settings-header">
        <h1 className="du-eyebrow">Photo Settings</h1>
        <div className="du-photo-settings-toolbar">
          <div className="du-photo-settings-primary-actions">
            <button
              type="button"
              className="du-button du-button-small du-button-rect"
              onClick={() => navigate(backTarget)}
            >
              ← {backLabel}
            </button>
            <button
              type="button"
              className="du-button du-button-small du-button-rect"
              disabled={
                saving || photo.profilePhoto || photo.visibility === "PRIVATE"
              }
              onClick={() =>
                runPhotoAction(
                  () => setCurrentUserProfilePhoto(photo.id),
                  "This photo is now your avatar.",
                )
              }
            >
              {photo.profilePhoto ? "✓ Current Avatar" : "Use as Avatar"}
            </button>
            <button
              type="button"
              className="du-button du-button-small du-button-rect"
              disabled={
                saving || photo.cardProfilePhoto || photo.visibility === "PRIVATE"
              }
              onClick={() =>
                runPhotoAction(
                  () => setCurrentUserCardPhoto(photo.id),
                  "This photo is now your profile card image.",
                )
              }
            >
              {photo.cardProfilePhoto
                ? "✓ Current Profile Card"
                : "Use as Profile Card"}
            </button>
            {cars.length > 0 ? (
              <DesertLiveMenuFilter
                buttonLabel="Use as Car Photo"
                menuLabel="Choose which car"
                value={selectedCarId}
                options={cars.map((car) => ({
                  value: String(car.id),
                  label: `${car.brand} ${car.name}`,
                  icon: "🏎",
                }))}
                onChange={(carId) => void assignAsCarPhoto(carId)}
                disabled={saving}
              />
            ) : (
              <button
                type="button"
                className="du-button du-button-small du-button-rect"
                onClick={() => navigate("/cars/new")}
              >
                Create My First Car
              </button>
            )}
          </div>
          <div className="du-photo-settings-secondary-actions">
            <PhotoVisibilitySelect value={visibility} onChange={setVisibility} />
            <button
              type="button"
              className="du-button du-button-small du-button-danger du-button-rect"
              disabled={saving}
              onClick={deletePhoto}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <label className="du-field du-photo-description-field">
        <span className="du-field-label">Description</span>
        <input
          className="du-input"
          value={description}
          maxLength={120}
          placeholder="A short description..."
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
      </label>

      {message && <p className="du-image-optimization-message">{message}</p>}
      {error && <p className="du-error">{error}</p>}

      <div className="du-photo-settings-framing">
        <div>
          <p className="du-eyebrow">Photo Framing</p>
          <h2 className="du-title-sm">Avatar and Profile Card</h2>
        </div>
        <ImageFocusPicker
          imageUrl={photo.imageUrl}
          framingProfiles={framing}
          onFramingProfilesChange={setFraming}
          imageAlt={photo.caption || "Gallery photo"}
          disabled={saving}
        />
        <button
          type="button"
          className="du-button du-button-primary du-button-rect du-save-photo-button"
          disabled={saving}
          onClick={savePhoto}
        >
          {saving ? "Saving..." : "Save Photo"}
        </button>
      </div>

      <button
        type="button"
        className="du-button du-button-rect du-photo-settings-back-bottom"
        onClick={() => navigate(backTarget)}
      >
        ← {backLabel}
      </button>
    </section>
  );
}

export default ProfilePhotoSettingsPage;
