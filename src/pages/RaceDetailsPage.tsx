import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRaceById } from "../services/raceService";
import type { Race } from "../types/race";
import { getMyRaceCars } from "../services/raceCarService";
import type { RaceCar } from "../types/raceCar";
import {
  getRaceParticipants,
  registerMyCarForRace,
  type RaceParticipant,
} from "../services/raceRegistrationService";

import "../styles/animations.css";

function RaceDetailsPage() {
  const { id } = useParams();
  const [race, setRace] = useState<Race | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [myCars, setMyCars] = useState<RaceCar[]>([]);
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    async function loadRace() {
      try {
        if (!id) {
          return;
        }

        const data = await getRaceById(Number(id));
        setRace(data);

        const cars = await getMyRaceCars();
        setMyCars(cars);

        const raceParticipants = await getRaceParticipants(Number(id));
        setParticipants(raceParticipants);
      } catch {
        setError("Failed to load race details");
      } finally {
        setLoading(false);
      }
    }

    loadRace();
  }, [id]);

  if (loading) {
    return <p>Loading race details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!race) {
    return <p>Race not found</p>;
  }

  async function handleRegister() {
    try {
      if (!race) return;

      if (myCars.length === 0) {
        alert("You need at least one car");
        return;
      }

      await registerMyCarForRace({
        raceCarId: myCars[0].id,
        raceId: race.id,
      });

      alert("Successfully registered for race");

      const updatedParticipants = await getRaceParticipants(race.id);
      setParticipants(updatedParticipants);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  if (showParticipants) {
    return (
      <section className="du-page">
        <article
          className="du-details-card"
          style={{
            backgroundImage: `url("/src/assets/race.png")`,
          }}
        >
          <div className="du-details-overlay du-details-overlay-top">
            <div>
              <p className="du-details-eyebrow">Race Participants</p>

              <h1 className="du-details-title">👥 Registered Drivers</h1>

              <p className="du-details-message-title du-sand-text">
                Registered Drivers: {participants.length} /{" "}
                {race.maxParticipants}
              </p>

              <div className="du-scroll-area">
                {participants.map((participant) => (
                  <p key={participant.registrationId}>
                    👤 {participant.userName} 🚗 {participant.carBrand}{" "}
                    {participant.carName}
                  </p>
                ))}
              </div>
            </div>

            <div className="du-details-actions du-push-bottom">
              <button
                className="du-button du-sand-text"
                onClick={() => setShowParticipants(false)}
              >
                Back to Race Details
              </button>
            </div>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="du-page">
      <article
        className="du-details-card"
        style={{
          backgroundImage: `url("/src/assets/race.png")`,
        }}
      >
        <div className="du-details-overlay">
          <p className="du-details-eyebrow">Race Details</p>

          <h1 className="du-details-title">🏁 {race.name}</h1>

          <div className="du-details-info">
            <p>📍 {race.location}</p>
            <p>📅 {race.startDate}</p>
            <p>👥 Max Participants: {race.maxParticipants}</p>
          </div>

          {race.adminMessage ? (
            <div className="du-panel du-details-message">
              <p className="du-details-message-title">Organizer Message</p>
              <p>{race.adminMessage}</p>
            </div>
          ) : (
            <p className="du-details-description">
              A premium desert racing experience with powerful cars, open roads,
              community energy and festival atmosphere under the Negev sky.
            </p>
          )}

          <button
            className="du-button"
            onClick={() => setShowParticipants(true)}
          >
            <span className="du-sand-text">
              👥 Registered Drivers: {participants.length} /{" "}
              {race.maxParticipants}
            </span>

            <span className="du-warm-text"> · View Details</span>
          </button>

          <div className="du-details-actions">
            <button
              className="du-button du-button-primary"
              onClick={handleRegister}
            >
              🏁 Register For Race
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
export default RaceDetailsPage;
