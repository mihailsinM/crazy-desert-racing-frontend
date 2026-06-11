import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRaceById, updateRace } from "../services/raceService";


function EditRacePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [status, setStatus] = useState("UPCOMING");
  const [adminMessage, setAdminMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRace() {
      try {
        if (!id) {
          setError("Race id is missing");
          return;
        }

        const race = await getRaceById(Number(id));

        setName(race.name);
        setLocation(race.location);
        setStartDate(race.startDate);
        setMaxParticipants(race.maxParticipants);
        setStatus(race.status ?? "UPCOMING");
        setAdminMessage(race.adminMessage ?? "");
      } catch {
        setError("Failed to load race");
      } finally {
        setLoading(false);
      }
    }

    loadRace();
  }, [id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      if (!id) {
        setError("Race id is missing");
        return;
      }

      await updateRace(Number(id), {
        name,
        location,
        startDate,
        maxParticipants,
        status,
        adminMessage,
      });

      navigate("/races");
    } catch {
      setError("Failed to update race");
    }
  }

  if (loading) {
    return <p>Loading race...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="du-page">
      <section className="du-form-panel du-panel">
        <div className="du-form-header">
          <p className="du-form-eyebrow">🛠 EDIT RACE</p>
          <p className="du-form-subtitle">
            Update race details, status and organizer message.
          </p>
        </div>

        <form className="du-form" onSubmit={handleSubmit}>
          <input
            className="du-input"
            type="text"
            placeholder="Race name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <input
            className="du-input"
            type="text"
            placeholder="Location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />

          <input
            className="du-input"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />

          <input
            className="du-input"
            type="number"
            placeholder="Max participants"
            value={maxParticipants}
            onChange={(event) => setMaxParticipants(Number(event.target.value))}
          />

          <select
            className="du-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="UPCOMING">UPCOMING</option>
            <option value="POSTPONED">POSTPONED</option>
            <option value="CANCELED">CANCELED</option>
            <option value="PAST">PAST</option>
          </select>

          <textarea
            className="du-textarea"
            placeholder="Organizer message"
            value={adminMessage}
            onChange={(event) => setAdminMessage(event.target.value)}
          />

          <button className="du-button du-button-primary" type="submit">
            Save Changes
          </button>

          <button
            className="du-button"
            type="button"
            onClick={() => navigate("/races")}
          >
            Cancel
          </button>
        </form>
      </section>
    </section>
  );
}

export default EditRacePage;
