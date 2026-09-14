import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import ImageFocusPicker from "../components/images/ImageFocusPicker";
import MediaFormPage from "../components/forms/MediaFormPage";
import {
  createRace,
  updateRace,
  updateRaceImage,
} from "../services/raceService";
import type { Race } from "../types/race";
import {
  createImageFramingProfiles,
  type ImageFramingProfiles,
} from "../utils/imageFocus";
import {
  formatImageFileSize,
  IMAGE_UPLOAD_ACCEPT,
  MAX_SOURCE_IMAGE_SIZE_MB,
  prepareImageForUpload,
} from "../utils/imageUpload";

function AddRacePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageFraming, setImageFraming] = useState<ImageFramingProfiles>(
    () => createImageFramingProfiles(),
  );
  const [createdRace, setCreatedRace] = useState<Race | null>(null);
  const [imageOptimizing, setImageOptimizing] = useState(false);
  const [imageOptimizationMessage, setImageOptimizationMessage] =
    useState("");
  const [saving, setSaving] = useState(false);
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

  async function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const image = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";

    if (!image) {
      return;
    }

    setImageOptimizing(true);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedImage) {
      setError("Choose a race image before creating the race.");
      return;
    }

    setSaving(true);
    let savedRace = createdRace;

    try {
      const request = {
        name: name.trim(),
        location: location.trim(),
        startDate,
        maxParticipants,
      };

      savedRace = createdRace
        ? await updateRace(createdRace.id, {
            ...request,
            status: createdRace.status,
            adminMessage: createdRace.adminMessage,
          })
        : await createRace(request);

      setCreatedRace(savedRace);
      await updateRaceImage(savedRace.id, selectedImage, imageFraming);
      navigate(`/races/${savedRace.id}`);
    } catch (caughtError) {
      const message = caughtError instanceof Error
        ? caughtError.message
        : "Failed to create race";

      setError(
        savedRace
          ? `Race details were saved, but the image was not. ${message}. You can retry without creating a duplicate.`
          : message,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <MediaFormPage>
        <div className="du-form-header">
          <p className="du-form-eyebrow">🏁 ADD RACE</p>
          <p className="du-form-subtitle">
            Create a real racing event. Its image and Desert Live publication
            will stay connected automatically.
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
                  : selectedImage
                    ? "Change Image"
                    : "Choose Image"}
                <input
                  hidden
                  type="file"
                  accept={IMAGE_UPLOAD_ACCEPT}
                  disabled={imageOptimizing || saving}
                  onChange={selectImage}
                />
              </label>
            </div>
          </div>

          {selectedImagePreview && (
            <ImageFocusPicker
              key={selectedImagePreview}
              imageUrl={selectedImagePreview}
              framingProfiles={imageFraming}
              onFramingProfilesChange={setImageFraming}
              imageAlt="Race image"
              disabled={saving || imageOptimizing}
            />
          )}

          <button
            className="du-button du-button-primary"
            type="submit"
            disabled={saving || imageOptimizing}
          >
            {saving
              ? "Saving..."
              : createdRace
                ? "Retry Image Upload"
                : "Create Race"}
          </button>

          <button
            type="button"
            className="du-button"
            disabled={saving}
            onClick={() => navigate("/races")}
          >
            Cancel
          </button>

          {error && <p className="du-error">{error}</p>}
        </form>
    </MediaFormPage>
  );
}

export default AddRacePage;
