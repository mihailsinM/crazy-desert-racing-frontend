import { useEffect, useState } from "react";
import { getAllRaces } from "../services/raceService";
import type { Race } from "../types/race";
import "../styles/upcoming-races-section.css";

function UpcomingRacesSection() {
  const [races, setRaces] = useState<Race[]>([]);

  useEffect(() => {
    async function loadRaces() {
      const data = await getAllRaces();
      setRaces(data.slice(0, 3));
    }

    loadRaces();
  }, []);

  return (
    <section className="upcoming-races-section">
      <div className="upcoming-races-header">
        <p>Race Calendar</p>
        <h2>Upcoming Races</h2>
      </div>

      <div className="upcoming-races-grid">
        {races.map((race) => (
          <article key={race.id} className="upcoming-race-card">
            <h3>{race.name}</h3>
            <p>📍 {race.location}</p>
            <p>📅 {race.startDate}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export default UpcomingRacesSection;
