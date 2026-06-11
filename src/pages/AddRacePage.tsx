import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRace } from "../services/raceService";

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
    <section className="du-page">
      <section className="du-form-panel du-panel">
        <div className="du-form-header">
          <p className="du-form-eyebrow">🏁 ADD RACE</p>

          <p className="du-form-subtitle">
            Create a new desert racing event for the Crazy Desert Racing
            calendar.
          </p>
        </div>

        <form className="du-form" onSubmit={handleSubmit}>
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

          <button className="du-button du-button-primary" type="submit">
            Create Race
          </button>

          <button
            type="button"
            className="du-button"
            onClick={() => navigate("/races")}
          >
            Cancel
          </button>

          {error && <p className="du-error">{error}</p>}
        </form>
      </section>
    </section>
  );
}

export default AddRacePage;
