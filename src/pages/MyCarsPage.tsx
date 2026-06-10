import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRaceCars } from "../services/raceCarService";
import type { RaceCar } from "../types/raceCar";

import "../styles/mock-pages.css";
import "../styles/animations.css";

function MyCarsPage() {
  const [cars, setCars] = useState<RaceCar[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadCars() {
      try {
        const data = await getMyRaceCars();
        setCars(data);
      } catch {
        setError("Failed to load race cars");
      } finally {
        setLoading(false);
      }
    }

    loadCars();
  }, []);

  if (loading) {
    return <p>Loading cars...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="mock-page">
      <header className="page-header">
        <p>Garage</p>
        <h1>🏎 My Cars</h1>
      </header>

      <div className="mock-grid">
        {cars.length === 0 && (
          <article className="mock-card">
            <h2>No cars yet</h2>
            <p>
              Your garage is empty. Soon you will be able to add your first
              racing car.
            </p>
            <span>Empty garage</span>
          </article>
        )}

        {cars.map((car) => (
          <article key={car.id} className="du-card">
            <h2>{car.name}</h2>
            <p>{car.brand}</p>
            <span className="du-badge">{car.horsePower} HP</span>
          </article>
        ))}

        <article
          className="mock-card add-card"
          onClick={() => navigate("/cars/new")}
        >
          <h2>+ Add New Car</h2>
          <p>Connect your next racing vehicle to your driver profile.</p>
          <span>Open form</span>
        </article>
      </div>
    </section>
  );
}

export default MyCarsPage;