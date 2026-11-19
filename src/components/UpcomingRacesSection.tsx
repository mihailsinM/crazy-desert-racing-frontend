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
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    let mounted = true;
    let pool: Race[] = [];
    let current: Race[] = [];
    let timeout: number | undefined;
    let frame: number | undefined;
    let revealFrame: number | undefined;
    function pick() {
      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const next = shuffled.slice(0, 3);
      if (next.length > 1 && next.every((race, index) => race.id === current[index]?.id)) {
        next.push(next.shift()!);
      }
      return next;
    }
    async function loadRaces() {
      try {
        const data = await getAllRaces();
        if (!mounted) return;
        pool = data;
        current = pick();
        setRaces(current);
      } catch { /* Keep the page visible if races are unavailable. */ }
    }

    void loadRaces();
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible" || pool.length < 2) return;
      setChanging(true);
      timeout = window.setTimeout(() => {
        if (!mounted) return;
        current = pick();
        setRaces(current);
        frame = window.requestAnimationFrame(() => {
          revealFrame = window.requestAnimationFrame(() => { if (mounted) setChanging(false); });
        });
      }, 750);
    }, 15_000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
      if (timeout !== undefined) window.clearTimeout(timeout);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      if (revealFrame !== undefined) window.cancelAnimationFrame(revealFrame);
    };
  }, []);

  return (
    <section id="races" className="upcoming-races-section">
      <div className="upcoming-races-header du-container">
        <p>Race Calendar</p>
        <h2>Upcoming Races</h2>
      </div>

      <div className={`upcoming-races-grid du-showcase-grid du-container${changing ? " festival-preview-grid-changing" : ""}`}>
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
