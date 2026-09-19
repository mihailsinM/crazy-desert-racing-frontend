import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import raceBackground from "../assets/race.png";
import FocalImage from "./images/FocalImage";
import { getAllRaces, getRaceAssetUrl } from "../services/raceService";
import type { Race } from "../types/race";
import { getRaceImageFraming } from "../utils/raceImageFraming";
import "../styles/upcoming-races-section.css";

function UpcomingRacesSection() {
  const navigate = useNavigate();
  const [races, setRaces] = useState<Race[]>([]);

  useEffect(() => {
    async function loadRaces() {
      const data = await getAllRaces();
      setRaces(data.slice(0, 3));
    }

    loadRaces();
  }, []);

  return (
    <section id="races" className="upcoming-races-section">
      <div className="upcoming-races-header">
        <p>Race Calendar</p>
        <h2>Upcoming Races</h2>
      </div>

      <div className="upcoming-races-grid">
        {races.map((race) => {
          const imageUrl = getRaceAssetUrl(race.imageUrl);
          const cardFraming = getRaceImageFraming(race).card;

          return (
            <article
              key={race.id}
              className="upcoming-race-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/races/${race.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/races/${race.id}`);
                }
              }}
            >
              <FocalImage
                src={imageUrl ?? raceBackground}
                alt={`${race.name} card`}
                focusX={imageUrl ? cardFraming.focusX : 50}
                focusY={imageUrl ? cardFraming.focusY : 50}
                cropPercent={imageUrl ? cardFraming.cropPercent : 0}
                className="upcoming-race-media"
              />
              <div className="upcoming-race-content">
                <h3>{race.name}</h3>
                <p>📍 {race.location}</p>
                <p>📅 {race.startDate}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
export default UpcomingRacesSection;
