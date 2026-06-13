import { useEffect, useState } from "react";
import type { Race } from "../types/race";
import { useNavigate } from "react-router-dom";
import { getMyRaceCars } from "../services/raceCarService";
import { registerMyCarForRace } from "../services/raceRegistrationService";
import type { RaceCar } from "../types/raceCar";
import { getCurrentUser } from "../services/userService";
import type { UserResponse } from "../types/user";
import { getAllRaces, updateRace } from "../services/raceService";

import "../styles/animations.css";

function RacesPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [myCars, setMyCars] = useState<RaceCar[]>([]);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);

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
        const cars = await getMyRaceCars();
        setMyCars(cars);
        const user = await getCurrentUser();
        setCurrentUser(user);
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
  async function handleRegisterForRace(raceId: number) {
    try {
      if (myCars.length === 0) {
        alert("You need at least one car");
        return;
      }

      await registerMyCarForRace({
        raceCarId: myCars[0].id,
        raceId,
      });

      alert("Successfully registered for race");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }
  async function handleCancelRace(race: Race) {
    try {
      await updateRace(race.id, {
        name: race.name,
        location: race.location,
        startDate: race.startDate,
        maxParticipants: race.maxParticipants,
        status: "CANCELED",
        adminMessage: "Race canceled by organizer.",
      });

      const updatedRaces = races.map((currentRace) =>
        currentRace.id === race.id
          ? {
              ...currentRace,
              status: "CANCELED",
              adminMessage: "Race canceled by organizer.",
            }
          : currentRace,
      );

      setRaces(updatedRaces);

      alert("Race canceled successfully");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  async function handlePostponeRace(race: Race) {
    try {
      await updateRace(race.id, {
        name: race.name,
        location: race.location,
        startDate: race.startDate,
        maxParticipants: race.maxParticipants,
        status: "POSTPONED",
        adminMessage: "Race postponed by organizer.",
      });

      const updatedRaces = races.map((currentRace) =>
        currentRace.id === race.id
          ? {
              ...currentRace,
              status: "POSTPONED",
              adminMessage: "Race postponed by organizer.",
            }
          : currentRace,
      );

      setRaces(updatedRaces);

      alert("Race postponed successfully");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }
  return (
    <section className="du-page">
      <header className="du-page-header">
        <p className="du-page-eyebrow">Race Calendar</p>
        <h1 className="du-page-title">🏁 Races</h1>
      </header>

      {currentUser?.role === "ADMIN" && (
        <div className="du-page-actions">
          <button className="du-button" onClick={() => navigate("/races/new")}>
            Add New Race
          </button>
        </div>
      )}

      <div className="du-grid">
        {races.map((race) => {
          const status = race.status ?? "UPCOMING";
          const formattedDate = formatRaceDate(race.startDate);

          return (
            <article key={race.id} className="du-card du-entity-card">
              <h2>{race.name}</h2>

              <p>📍 {race.location}</p>

              <p>📅 {formattedDate}</p>

              {/* <p>👥 Max Participants: {race.maxParticipants}</p> */}
              <span className={`du-status du-status-${status.toLowerCase()}`}>
                {status}
              </span>

              <div className="du-entity-actions">
                {currentUser?.role === "ADMIN" && (
                  <>
                    <button
                      className="du-button"
                      onClick={() => navigate(`/races/${race.id}/edit`)}
                    >
                      Edit Race
                    </button>
                    <button
                      className="du-button"
                      onClick={() => handlePostponeRace(race)}
                    >
                      Postpone Race
                    </button>
                    <button
                      className="du-button"
                      onClick={() => handleCancelRace(race)}
                    >
                      Cancel Race
                    </button>
                  </>
                )}
                <button
                  className="du-button"
                  onClick={() => navigate(`/races/${race.id}`)}
                >
                  View Details
                </button>

                <button
                  className="du-button du-button-primary"
                  onClick={() => handleRegisterForRace(race.id)}
                >
                  Register For Race
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RacesPage;
