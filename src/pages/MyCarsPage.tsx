import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRaceCars } from "../services/raceCarService";
import type { RaceCar } from "../types/raceCar";


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
    <section className="du-page">
      <header className="du-page-header">
        <p className="du-eyebrow">Garage</p>
        <h1 className="du-title-xl">🏎 My Cars</h1>
      </header>

      <div className="du-showcase-grid">
        {cars.length === 0 && (
          <article className="du-card">
            <h2>No cars yet</h2>
            <p>
              Your garage is empty. Soon you will be able to add your first
              racing car.
            </p>
            <span className="du-badge">Empty garage</span>
          </article>
        )}

        {cars.map((car) => (
          <article
            key={car.id}
            className="du-card du-showcase-card"
            
            onClick={() => navigate(`/cars/${car.id}`)}
            style={{
              backgroundImage: `url(${car.imageUrl})`,
            }}
          >
            <div className="du-showcase-content">
              <p className="du-eyebrow du-showcase-eyebrow">{car.brand}</p>

              <h2 className="du-showcase-title">{car.name}</h2>

              <div className="du-showcase-meta">
                <span className="du-badge">{car.horsePower} HP</span>
              </div>

              <button
                className="du-button du-button-primary du-showcase-action"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`/cars/${car.id}`);
                }}
              >
                View Details →
              </button>
            </div>
          </article>
        ))}
        <article className="du-card" onClick={() => navigate("/cars/new")}>
          <h2>+ Add New Car</h2>
          <p>Connect your next racing vehicle to your driver profile.</p>
          <span className="du-badge">Open form</span>
        </article>
      </div>
    </section>
  );
}

export default MyCarsPage;
