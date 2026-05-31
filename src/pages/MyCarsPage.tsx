import { useEffect, useState } from "react";
import { getAllRaceCars } from "../services/raceCarService";
import type { RaceCar } from "../types/raceCar";

import "../styles/mock-pages.css";
import "../styles/animations.css";

function MyCarsPage() {
  const [cars, setCars] = useState<RaceCar[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCars() {
      try {
        const data = await getAllRaceCars();
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
        {cars.map((car) => (
          <article key={car.id} className="mock-card">
            <h2>{car.name}</h2>
            <p>{car.brand}</p>
            <span>{car.horsePower} HP</span>
          </article>
        ))}

        <article className="mock-card add-card">
          <h2>+ Add New Car</h2>
          <p>Connect your next racing vehicle to your driver profile.</p>
          <span>Coming soon</span>
        </article>
      </div>
    </section>
  );
}

export default MyCarsPage;
