import { useEffect, useState } from "react";
import { getAllRaces } from "../services/raceService";
import type { Race } from "../types/race";

import "../styles/mock-pages.css";
import "../styles/animations.css";

function RacesPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function getRaceStatus(startDate: string) {
    const today = new Date();
    const raceDate = new Date(startDate);

    if (raceDate < today) {
      return "PAST";
    }

    return "UPCOMING";
  }

  function formatRaceDate(startDate: string) {
    const date = new Date(startDate);

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  useEffect(() => {
    async function loadRaces() {
      try {
        const data = await getAllRaces();
        setRaces(data);
      } catch {
        setError("Failed to load races");
      } finally {
        setLoading(false);
      }
    }

    loadRaces();
  }, []);

  if (loading) {
    return <p>Loading races...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="mock-page">
      <header className="page-header">
        <p>Race Calendar</p>
        <h1>🏁 Races</h1>
      </header>

      <div className="mock-grid">
        {races.map((race) => {
          const status = getRaceStatus(race.startDate);
          const formattedDate = formatRaceDate(race.startDate);

          return (
            <article key={race.id} className="mock-card race-card">
              <h2>{race.name}</h2>

              <p>📍 {race.location}</p>

              <p>📅 {formattedDate}</p>

              <p>👥 Max Participants: {race.maxParticipants}</p>

              <span className={`race-status ${status.toLowerCase()}`}>
                {status}
              </span>
              <div className="race-admin-actions">
                <button>Edit</button>
                <button>Postpone</button>
                <button>Cancel</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RacesPage;
