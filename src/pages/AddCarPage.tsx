import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMyRaceCar } from "../services/raceCarService";

import "../styles/mock-pages.css";
import "../styles/form-page.css";

function AddCarPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [horsePower, setHorsePower] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  async function handleCreateCar(event: React.FormEvent) {
    event.preventDefault();

    try {
      await createMyRaceCar({
        name,
        brand,
        horsePower: Number(horsePower),
        imageUrl,
      });

      navigate("/cars");
    } catch {
      setError("Failed to create car");
    }
  }

  return (
    <section className="mock-page">
      <section className="form-panel du-panel">
        <header className="page-header">
          <p>🏎 Add New Car</p>
        </header>

        <p className="form-subtitle">
          Connect a new racing vehicle to your driver profile.
        </p>

        <form className="form" onSubmit={handleCreateCar}>
          <input
            className="du-input"
            type="text"
            placeholder="Car name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <input
            className="du-input"
            type="text"
            placeholder="Brand"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          />

          <input
            className="du-input"
            type="number"
            placeholder="Horse power"
            value={horsePower}
            onChange={(event) => setHorsePower(event.target.value)}
          />

          <input
            className="du-input"
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />

          <button className="du-button du-button-primary"
          type="submit">Create Car</button>

          <button className="du-button" type="button" onClick={() => navigate("/cars")}>
            Cancel
          </button>

          {error && <p className="form-error">{error}</p>}
        </form>
      </section>
    </section>
  );
}

export default AddCarPage;
