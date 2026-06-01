import { useEffect, useState } from "react";
import { getAllRaces } from "../services/raceService";
import type { Race } from "../types/race";

import "../styles/mock-pages.css";
import "../styles/animations.css";

function RacesPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
        {races.map((race) => (
          <article key={race.id} className="mock-card">
            <h2>{race.name}</h2>
            <p>{race.location}</p>
            <span>{race.startDate}</span>
            <span>{race.maxParticipants} participants</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RacesPage;