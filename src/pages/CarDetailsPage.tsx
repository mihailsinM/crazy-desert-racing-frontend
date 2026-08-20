import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FocalImage from "../components/images/FocalImage";
import raceBackground from "../assets/race.png";
import {
  deleteRaceCar,
  getRaceCarAssetUrl,
  getRaceCarById,
} from "../services/raceCarService";
import type { RaceCar } from "../types/raceCar";


function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState<RaceCar | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCar() {
      try {
        if (!id) return;

        const data = await getRaceCarById(Number(id));
        setCar(data);
      } catch {
        setError("Failed to load car details");
      } finally {
        setLoading(false);
      }
    }

    loadCar();
  }, [id]);

  if (loading) {
    return <p>Loading car details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!car) {
    return <p>Car not found</p>;
  }

  async function handleDeleteCar() {
    if (!car) return;

    const confirmDelete = window.confirm(
      `Delete ${car.name}? This action cannot be undone.`,
    );

    if (!confirmDelete) return;

    try {
      await deleteRaceCar(car.id);
      navigate("/cars");
    } catch {
      setError("Failed to delete car");
    }
  }
  return (
    <section className="du-page">
      <article className="du-details-card du-car-details">
        <FocalImage
          src={getRaceCarAssetUrl(car.imageUrl) ?? raceBackground}
          alt={`${car.brand} ${car.name}`}
          focusX={car.imageFocusX}
          focusY={car.imageFocusY}
          cropPercent={car.imageUrl ? car.imageCropPercent : 0}
          className="du-details-media"
        />
        <div className="du-details-overlay">
          <p className="du-details-eyebrow">Car Details</p>

          <h1 className="du-details-title">🏎 {car.name}</h1>

          <div className="du-details-info">
            <p>🏷 Brand: {car.brand}</p>
            <p>⚡ Horse Power: {car.horsePower} HP</p>
          </div>

          <p className="du-details-description">
            This vehicle is connected to your Crazy Desert Racing profile and
            can be used for future race registrations.
          </p>
          <div className="du-details-actions">
            <button
              className="du-button du-button-secondary du-sand-text"
              onClick={() => navigate("/cars")}
            >
              ← Back To My Cars
            </button>
            <button
              className="du-button du-button-secondary du-sand-text"
              onClick={handleDeleteCar}
            >
              Delete Car
            </button>
            <button
              className="du-button du-button-primary"
              onClick={() => navigate(`/cars/${car.id}/edit`)}
            >
              🛠 Edit Car
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}

export default CarDetailsPage;
