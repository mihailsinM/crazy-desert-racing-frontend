import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRace } from "../services/raceService";
import "../styles/add-form.css";

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
    <section className="add-form-panel">
      <header className="add-form-header">
        <p>🏁 Add New Race</p>
      </header>

      <p className="add-form-subtitle">
        Create a new desert racing event for the Crazy Desert Racing calendar.
      </p>

      <form className="add-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Race name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
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

        {error && <p className="add-form-error">{error}</p>}
      </form>
    </section>
  </section>
);
}

export default AddRacePage;
