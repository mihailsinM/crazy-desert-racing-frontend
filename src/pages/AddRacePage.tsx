import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRace } from "../services/raceService";
import "../styles/form-page.css";

function AddRacePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await createRace({
        name,
        location,
        startDate,
        maxParticipants,
      });

      navigate("/races");
    } catch {
      setError("Failed to create race");
    }
  }

  return (
    <section className="mock-page">
      <section className="form-panel du-panel">
        <header className="form-header">
          <p>🏁 Add New Race</p>
        </header>

        <p className="form-subtitle">
          Create a new desert racing event for the Crazy Desert Racing calendar.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <input
            className="du-input"
            type="text"
            placeholder="Race name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="du-input"
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            className="du-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            className="du-input"
            type="number"
            placeholder="Max participants"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
          />

          <button type="submit">Create Race</button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/races")}
          >
            Cancel
          </button>

          {error && <p className="form-error">{error}</p>}
        </form>
      </section>
    </section>
  );
}

export default AddRacePage;
