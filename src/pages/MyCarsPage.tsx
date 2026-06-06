import { useEffect, useState } from "react";
import { getMyRaceCars, createMyRaceCar } from "../services/raceCarService";
import type { RaceCar } from "../types/raceCar";

import "../styles/mock-pages.css";
import "../styles/animations.css";

function MyCarsPage() {
  const [cars, setCars] = useState<RaceCar[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [horsePower, setHorsePower] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function handleCreateCar(event: React.FormEvent) {
    event.preventDefault();

    try {
      const newCar = await createMyRaceCar({
        name,
        brand,
        horsePower: Number(horsePower),
        imageUrl,
      });

      setCars((currentCars) => [...currentCars, newCar]);

      setName("");
      setBrand("");
      setHorsePower("");
      setImageUrl("");

      alert("Car created successfully");
    } catch {
      alert("Failed to create car");
    }
  }

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

  if (showForm) {
    return (
      <section className="mock-page">
        <section className="car-form-panel">
          <header className="page-header">
            <p>🏎 Add New Car</p>
          </header>
          <p className="form-subtitle">
            Connect a new racing vehicle to your driver profile.
          </p>

          <form className="car-form" onSubmit={handleCreateCar}>
            <input
              type="text"
              placeholder="Car name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <input
              type="text"
              placeholder="Brand"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            />

            <input
              type="number"
              placeholder="Horse power"
              value={horsePower}
              onChange={(event) => setHorsePower(event.target.value)}
            />

            <input
              type="text"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />

            <button type="submit">Create Car</button>

            <button type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        </section>
      </section>
    );
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
          <article key={car.id} className="mock-card">
            <h2>{car.name}</h2>
            <p>{car.brand}</p>
            <span>{car.horsePower} HP</span>
          </article>
        ))}

        <article
          className="mock-card add-card"
          onClick={() => setShowForm(true)}
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
