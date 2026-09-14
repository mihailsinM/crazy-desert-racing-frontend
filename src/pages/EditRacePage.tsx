import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";

import ImageFocusPicker from "../components/images/ImageFocusPicker";
import MediaFormPage from "../components/forms/MediaFormPage";
import {
  deleteRaceImage,
  getRaceAssetUrl,
  getRaceById,
  updateRace,
  updateRaceImage,
  updateRaceImageFraming,
} from "../services/raceService";
import type { Race, RaceStatus } from "../types/race";
import {
  createImageFramingProfiles,
  imageFramingProfilesEqual,
  type ImageFramingProfiles,
} from "../utils/imageFocus";
import {
  formatImageFileSize,
  IMAGE_UPLOAD_ACCEPT,
  MAX_SOURCE_IMAGE_SIZE_MB,
  prepareImageForUpload,
} from "../utils/imageUpload";
import { getRaceImageFraming } from "../utils/raceImageFraming";

function EditRacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const raceId = Number(id);

  const [existingRace, setExistingRace] = useState<Race | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [status, setStatus] = useState<RaceStatus>("UPCOMING");
  const [adminMessage, setAdminMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageFraming, setImageFraming] = useState<ImageFramingProfiles>(
    () => createImageFramingProfiles(),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);
  const [imageOptimizing, setImageOptimizing] = useState(false);
  const [imageOptimizationMessage, setImageOptimizationMessage] =
    useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const selectedImagePreview = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : null),
    [selectedImage],
  );

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  useEffect(() => {
    let active = true;

    async function loadRace() {
      if (!Number.isInteger(raceId) || raceId < 1) {
        setError("Invalid race");
        setLoading(false);
        return;
      }

      try {
        const race = await getRaceById(raceId);

        if (active) {
          setExistingRace(race);
          setName(race.name);
          setLocation(race.location);
          setStartDate(race.startDate);
          setMaxParticipants(race.maxParticipants);
          setStatus(race.status ?? "UPCOMING");
          setAdminMessage(race.adminMessage ?? "");
          setImageUrl(race.imageUrl);
          setImageFraming(getRaceImageFraming(race));
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load race",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRace();

    return () => {
      active = false;
    };
  }, [raceId]);

  async function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const image = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";

    if (!image) {
      return;
    }

    setImageOptimizing(true);
    setSuccessMessage("");
    setError("");

    try {
      const optimizedImage = await prepareImageForUpload(image);

      setSelectedImage(optimizedImage);
      setImageFraming(createImageFramingProfiles());
      setImageOptimizationMessage(
        optimizedImage === image
          ? `Ready to upload · ${formatImageFileSize(optimizedImage.size)}`
          : `Optimized ${formatImageFileSize(image.size)} → ${formatImageFileSize(optimizedImage.size)}`,
      );
    } catch (caughtError) {
      setSelectedImage(null);
      setImageOptimizationMessage("");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to optimize the selected image.",
      );
    } finally {
      setImageOptimizing(false);
    }
  }

  function keepCurrentImage() {
    setSelectedImage(null);
    setImageOptimizationMessage("");

    if (existingRace) {
      setImageFraming(getRaceImageFraming(existingRace));
    }
  }

  async function handleImageDelete() {
    if (!existingRace?.imageUrl) {
      return;
    }

    if (!window.confirm("Remove this race image?")) {
      return;
    }

    setImageSaving(true);
    setSuccessMessage("");
    setError("");

    try {
      const updatedRace = await deleteRaceImage(raceId);

      setExistingRace(updatedRace);
      setImageUrl(updatedRace.imageUrl);
      setSelectedImage(null);
      setImageFraming(getRaceImageFraming(updatedRace));
      setImageOptimizationMessage("");
      setSuccessMessage("Image removed from the Race and Desert Live.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to remove race image",
      );
    } finally {
      setImageSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setError("");

    try {
      let savedRace = await updateRace(raceId, {
        name: name.trim(),
        location: location.trim(),
        startDate,
        maxParticipants,
        status,
        adminMessage: adminMessage.trim() || null,
      });

      if (selectedImage) {
        savedRace = await updateRaceImage(
          raceId,
          selectedImage,
          imageFraming,
        );
      } else if (
        imageUrl &&
        existingRace &&
        !imageFramingProfilesEqual(
          imageFraming,
          getRaceImageFraming(existingRace),
        )
      ) {
        savedRace = await updateRaceImageFraming(raceId, imageFraming);
      }

      setExistingRace(savedRace);
      navigate(`/races/${raceId}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update race",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="du-sand-text">Loading race...</p>;
  }

  const currentImageUrl = getRaceAssetUrl(imageUrl);
  const previewUrl = selectedImagePreview ?? currentImageUrl;

  return (
    <MediaFormPage>
        <div className="du-form-header">
          <p className="du-form-eyebrow">🛠 EDIT RACE</p>
          <p className="du-form-subtitle">
            Update the real Race. Its connected Desert Live publication will
            follow these details and image automatically.
          </p>
        </div>

        <form className="du-form" onSubmit={handleSubmit}>
          <input
            className="du-input"
            type="text"
            maxLength={120}
            placeholder="Race name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <input
            className="du-input"
            type="text"
            maxLength={200}
            placeholder="Location"
            required
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />

          <input
            className="du-input"
            type="date"
            required
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />

          <input
            className="du-input"
            type="number"
            min={1}
            placeholder="Max participants"
            required
            value={maxParticipants}
            onChange={(event) =>
              setMaxParticipants(Number(event.target.value))
            }
          />

          <select
            className="du-select"
            value={status}
            onChange={(event) => setStatus(event.target.value as RaceStatus)}
          >
            <option value="UPCOMING">UPCOMING</option>
            <option value="POSTPONED">POSTPONED</option>
            <option value="CANCELED">CANCELED</option>
            <option value="PAST">PAST</option>
          </select>

          <textarea
            className="du-textarea"
            maxLength={1000}
            placeholder="Organizer message"
            value={adminMessage}
            onChange={(event) => setAdminMessage(event.target.value)}
          />

          <div className="du-field">
            <span className="du-field-label">Race image</span>
            <span className="du-caption">
              JPG, PNG, or WebP · photos up to {MAX_SOURCE_IMAGE_SIZE_MB} MB
              are optimized automatically
            </span>
            {imageOptimizationMessage && (
              <p className="du-image-optimization-message">
                {imageOptimizationMessage}
              </p>
            )}
            <div className="du-inline du-inline-sm du-inline-wrap">
              <label
                className={
                  imageOptimizing
                    ? "du-button du-button-small du-button-rect du-button-inline du-file-button du-file-button-disabled"
                    : "du-button du-button-small du-button-rect du-button-inline du-file-button"
                }
                aria-disabled={imageOptimizing}
              >
                {imageOptimizing
                  ? "Optimizing..."
                  : previewUrl
                    ? "Change Image"
                    : "Add Image"}
                <input
                  hidden
                  type="file"
                  accept={IMAGE_UPLOAD_ACCEPT}
                  disabled={imageOptimizing || saving || imageSaving}
                  onChange={selectImage}
                />
              </label>

              {selectedImage && (
                <button
                  type="button"
                  className="du-button du-button-small du-button-rect"
                  disabled={saving || imageSaving}
                  onClick={keepCurrentImage}
                >
                  {existingRace?.imageUrl
                    ? "Keep Current Image"
                    : "Remove Image"}
                </button>
              )}

              {existingRace?.imageUrl && !selectedImage && (
                <button
                  type="button"
                  className="du-button du-button-small du-button-rect du-button-danger"
                  disabled={saving || imageSaving}
                  onClick={handleImageDelete}
                >
                  {imageSaving ? "Removing..." : "Remove Image"}
                </button>
              )}
            </div>
          </div>

          {previewUrl && (
            <ImageFocusPicker
              key={previewUrl}
              imageUrl={previewUrl}
              framingProfiles={imageFraming}
              onFramingProfilesChange={setImageFraming}
              imageAlt="Race image"
              disabled={saving || imageSaving || imageOptimizing}
            />
          )}

          <button
            className="du-button du-button-primary"
            type="submit"
            disabled={saving || imageSaving || imageOptimizing}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            className="du-button"
            type="button"
            disabled={saving || imageSaving}
            onClick={() => navigate(`/races/${raceId}`)}
          >
            Cancel
          </button>

          {successMessage && (
            <p className="du-image-optimization-message">
              {successMessage}
            </p>
          )}
          {error && <p className="du-error">{error}</p>}
        </form>
    </MediaFormPage>
  );
}

export default EditRacePage;
