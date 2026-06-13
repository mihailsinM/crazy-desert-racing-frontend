import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRaceCarById, updateRaceCar } from "../services/raceCarService";

function EditCarPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [horsePower, setHorsePower] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [imagePosition, setImagePosition] = useState("CENTER");

  useEffect(() => {
    async function loadCar() {
      try {
        if (!id) return;

        const car = await getRaceCarById(Number(id));

        setName(car.name);
        setBrand(car.brand);
        setHorsePower(String(car.horsePower));
        setImageUrl(car.imageUrl);
        setImagePosition(car.imagePosition || "CENTER");
      } catch {
        setError("Failed to load car");
      } finally {
        setLoading(false);
      }
    }

    loadCar();
  }, [id]);

  async function handleUpdateCar(event: React.FormEvent) {
    event.preventDefault();

    try {
      if (!id) return;

      await updateRaceCar(Number(id), {
        name,
        brand,
        horsePower: Number(horsePower),
        imageUrl,
        imagePosition,
      });

      navigate(`/cars/${id}`);
    } catch {
      setError("Failed to update car");
    }
  }

  if (loading) {
    return <p>Loading car...</p>;
  }

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

          <select
            className="du-input"
            value={imagePosition}
            onChange={(event) => setImagePosition(event.target.value)}
          >
            <option value="CENTER">Center</option>
            <option value="LEFT">Left</option>
            <option value="RIGHT">Right</option>
            <option value="TOP">Top</option>
            <option value="BOTTOM">Bottom</option>
          </select>

          <button className="du-button du-button-primary" type="submit">
            Save Changes
          </button>

          <button
            className="du-button"
            type="button"
            onClick={() => navigate(`/cars/${id}`)}
          >
            Cancel
          </button>

          {error && <p className="du-error">{error}</p>}
        </form>
      </section>
    </section>
  );
}

export default EditCarPage;
