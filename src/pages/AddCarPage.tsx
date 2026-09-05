import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import ImageFocusPicker from "../components/images/ImageFocusPicker";
import {
  createMyRaceCar,
  updateRaceCar,
  updateRaceCarImage,
} from "../services/raceCarService";
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

function AddCarPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [horsePower, setHorsePower] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageFraming, setImageFraming] = useState<ImageFramingProfiles>(
    () => createImageFramingProfiles(),
  );
  const [createdCarId, setCreatedCarId] = useState<number | null>(null);
  const [imageOptimizing, setImageOptimizing] = useState(false);
  const [imageOptimizationMessage, setImageOptimizationMessage] = useState("");
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

  async function handleCreateCar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedImage) {
      setError("Choose a race car image before creating the car.");
      return;
    }

    setSaving(true);
    let savedCarId = createdCarId;

    try {
      const request = {
        name: name.trim(),
        brand: brand.trim(),
        horsePower: Number(horsePower),
      };
      const savedCar = savedCarId === null
        ? await createMyRaceCar(request)
        : await updateRaceCar(savedCarId, request);

      savedCarId = savedCar.id;
      setCreatedCarId(savedCar.id);

      await updateRaceCarImage(savedCar.id, selectedImage, imageFraming);

      navigate(`/cars/${savedCar.id}`);
    } catch (caughtError) {
      const message = caughtError instanceof Error
        ? caughtError.message
        : "Failed to create car";

      setError(
        savedCarId === null
          ? message
          : `Car details were saved, but the image was not. ${message}. You can retry without creating a duplicate.`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="du-page">
      <section className="du-form-panel du-panel">
        <div className="du-form-header">
          <p className="du-form-eyebrow">🏎 ADD CAR</p>
          <p className="du-form-subtitle">
            Connect a new racing vehicle to your driver profile.
          </p>
        </div>

        <form className="du-form" onSubmit={handleCreateCar}>
          <input
            className="du-input"
            type="text"
            placeholder="Car name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <input
            className="du-input"
            type="text"
            placeholder="Brand"
            required
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          />

          <input
            className="du-input"
            type="number"
            min={1}
            placeholder="Horse power"
            required
            value={horsePower}
            onChange={(event) => setHorsePower(event.target.value)}
          />

          <div className="du-field">
            <span className="du-field-label">Race car image</span>
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
              imageAlt="Race car image"
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
              : createdCarId === null
                ? "Create Car"
                : "Retry Image Upload"}
          </button>

          <button
            className="du-button"
            type="button"
            disabled={saving}
            onClick={() => navigate("/cars")}
          >
            Cancel
          </button>

          {error && <p className="du-error">{error}</p>}
        </form>
      </section>
    </section>
  );
}

export default AddCarPage;
