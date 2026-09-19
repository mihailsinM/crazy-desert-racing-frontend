import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MediaFormPage from "../components/forms/MediaFormPage";
import RaceCarImage from "../components/images/RaceCarImage";
import {
  deleteRaceCarImage,
  getRaceCarAssetUrl,
  getRaceCarById,
  updateRaceCar,
} from "../services/raceCarService";
import type { RaceCar } from "../types/raceCar";
import { getRaceCarImageFraming } from "../utils/raceCarImageFraming";

function EditCarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const carId = Number(id);
  const [existingCar, setExistingCar] = useState<RaceCar | null>(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [horsePower, setHorsePower] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(carId) || carId < 1) return;

    void getRaceCarById(carId)
      .then((car) => {
        setExistingCar(car);
        setName(car.name);
        setBrand(car.brand);
        setHorsePower(String(car.horsePower));
      })
      .catch((caughtError) =>
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load car",
        ),
      )
      .finally(() => setLoading(false));
  }, [carId]);

  async function removeCarPhoto() {
    if (!existingCar?.imageUrl || !window.confirm("Remove this car photo?")) {
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updatedCar = await deleteRaceCarImage(carId);
      setExistingCar(updatedCar);
      setMessage("Car photo removed.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to remove car photo",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateCar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateRaceCar(carId, {
        name: name.trim(),
        brand: brand.trim(),
        horsePower: Number(horsePower),
      });
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

  if (!Number.isInteger(carId) || carId < 1) {
    return <p className="du-error">Invalid race car.</p>;
  }

  if (loading) return <p>Loading car...</p>;
  if (!existingCar) return <p className="du-error">{error || "Car not found."}</p>;

  const imageUrl = getRaceCarAssetUrl(existingCar.imageUrl);
  const card = getRaceCarImageFraming(existingCar).card;

  return (
    <MediaFormPage>
      <div className="du-form-header">
        <p className="du-form-eyebrow">Edit Car</p>
        <p className="du-form-subtitle">Update your vehicle details.</p>
      </div>

      <form className="du-form" onSubmit={handleUpdateCar}>
        <input
          className="du-input"
          type="text"
          placeholder="Car name"
          required
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <input
          className="du-input"
          type="text"
          placeholder="Brand"
          required
          value={brand}
          onChange={(event) => setBrand(event.currentTarget.value)}
        />
        <input
          className="du-input"
          type="number"
          min={1}
          placeholder="Horse power"
          required
          value={horsePower}
          onChange={(event) => setHorsePower(event.currentTarget.value)}
        />

        <div className="du-car-gallery-photo-panel">
          {imageUrl && (
            <RaceCarImage
              src={imageUrl}
              alt={`${existingCar.brand} ${existingCar.name}`}
              focusX={card.focusX}
              focusY={card.focusY}
              cropPercent={card.cropPercent}
            />
          )}
          <div>
            <span className="du-field-label">Car Photo</span>
            <p className="du-text-soft">
              Choose one of the photos already stored in My Gallery.
            </p>
            <div className="du-inline du-inline-sm du-inline-wrap">
              <button
                type="button"
                className="du-button du-button-primary du-button-small du-button-rect"
                onClick={() => navigate("/profile/photos")}
              >
                Choose from My Gallery
              </button>
              {imageUrl && (
                <button
                  type="button"
                  className="du-button du-button-small du-button-danger du-button-rect"
                  disabled={saving}
                  onClick={removeCarPhoto}
                >
                  Remove Car Photo
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          className="du-button du-button-primary"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          className="du-button"
          type="button"
          disabled={saving}
          onClick={() => navigate(`/cars/${carId}`)}
        >
          Cancel
        </button>
        {message && <p className="du-image-optimization-message">{message}</p>}
        {error && <p className="du-error">{error}</p>}
      </form>
    </MediaFormPage>
  );
}

export default EditCarPage;
