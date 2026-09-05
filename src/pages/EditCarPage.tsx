import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";

import ImageFocusPicker from "../components/images/ImageFocusPicker";
import {
  deleteRaceCarImage,
  getRaceCarAssetUrl,
  getRaceCarById,
  updateRaceCar,
  updateRaceCarImage,
  updateRaceCarImageFraming,
} from "../services/raceCarService";
import type { RaceCar } from "../types/raceCar";
import {
  createImageFramingProfiles,
  imageFramingProfilesEqual,
  type ImageFramingProfiles,
} from "../utils/imageFocus";
import { getRaceCarImageFraming } from "../utils/raceCarImageFraming";
import {
  formatImageFileSize,
  IMAGE_UPLOAD_ACCEPT,
  MAX_SOURCE_IMAGE_SIZE_MB,
  prepareImageForUpload,
} from "../utils/imageUpload";

function EditCarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const carId = Number(id);

  const [existingCar, setExistingCar] = useState<RaceCar | null>(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [horsePower, setHorsePower] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageFraming, setImageFraming] = useState<ImageFramingProfiles>(
    () => createImageFramingProfiles(),
  );
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);
  const [imageOptimizing, setImageOptimizing] = useState(false);
  const [imageOptimizationMessage, setImageOptimizationMessage] = useState("");

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

    async function loadCar() {
      if (!Number.isInteger(carId) || carId < 1) {
        setError("Invalid race car");
        setLoading(false);
        return;
      }

      try {
        const car = await getRaceCarById(carId);

        if (active) {
          setExistingCar(car);
          setName(car.name);
          setBrand(car.brand);
          setHorsePower(String(car.horsePower));
          setImageUrl(car.imageUrl);
          setImageFraming(getRaceCarImageFraming(car));
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load car",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCar();

    return () => {
      active = false;
    };
  }, [carId]);

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

    if (existingCar) {
      setImageFraming(getRaceCarImageFraming(existingCar));
    }
  }

  async function handleImageDelete() {
    if (!existingCar?.imageUrl) {
      return;
    }

    if (!window.confirm("Remove this race car image?")) {
      return;
    }

    setImageSaving(true);
    setSuccessMessage("");
    setError("");

    try {
      const updatedCar = await deleteRaceCarImage(carId);

      setExistingCar(updatedCar);
      setImageUrl(updatedCar.imageUrl);
      setSelectedImage(null);
      setImageFraming(getRaceCarImageFraming(updatedCar));
      setImageOptimizationMessage("");
      setSuccessMessage("Image removed.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to remove race car image",
      );
    } finally {
      setImageSaving(false);
    }
  }

  async function handleUpdateCar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setError("");

    try {
      let savedCar = await updateRaceCar(carId, {
        name: name.trim(),
        brand: brand.trim(),
        horsePower: Number(horsePower),
      });

      if (selectedImage) {
        savedCar = await updateRaceCarImage(
          carId,
          selectedImage,
          imageFraming,
        );
      } else if (
        imageUrl &&
        existingCar &&
        !imageFramingProfilesEqual(
          imageFraming,
          getRaceCarImageFraming(existingCar),
        )
      ) {
        savedCar = await updateRaceCarImageFraming(carId, imageFraming);
      }

      setExistingCar(savedCar);
      navigate(`/cars/${carId}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update car",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading car...</p>;
  }

  const currentImageUrl = getRaceCarAssetUrl(imageUrl);
  const previewUrl = selectedImagePreview ?? currentImageUrl;

  return (
    <section className="du-page">
      <section className="du-form-panel du-panel">
        <div className="du-form-header">
          <p className="du-form-eyebrow">🛠 EDIT CAR</p>
          <p className="du-form-subtitle">
            Update your racing vehicle details.
          </p>
        </div>

        <form className="du-form" onSubmit={handleUpdateCar}>
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
                  {existingCar?.imageUrl ? "Keep Current Image" : "Remove Image"}
                </button>
              )}

              {existingCar?.imageUrl && !selectedImage && (
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
              imageAlt="Race car image"
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
            onClick={() => navigate(`/cars/${carId}`)}
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
      </section>
    </section>
  );
}

export default EditCarPage;
