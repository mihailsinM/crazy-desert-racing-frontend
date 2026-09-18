import { useEffect, useState } from "react";
import type { Race } from "../types/race";
import { useNavigate } from "react-router-dom";
import raceBackground from "../assets/race.png";
import FocalImage from "../components/images/FocalImage";
import { getMyRaceCars } from "../services/raceCarService";
import { registerMyCarForRace } from "../services/raceRegistrationService";
import type { RaceCar } from "../types/raceCar";
import {
  getAllRaces,
  getRaceAssetUrl,
  synchronizeRacePublications,
  updateRace,
} from "../services/raceService";
import { useAuth } from "../context/authContext";
import { getRaceImageFraming } from "../utils/raceImageFraming";
import { hasAdminAccess } from "../utils/userRole";


function RacesPage() {
  const { currentUser } = useAuth();
  const [races, setRaces] = useState<Race[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [myCars, setMyCars] = useState<RaceCar[]>([]);
  const [synchronizingLive, setSynchronizingLive] = useState(false);

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
      const updatedRace = await updateRace(race.id, {
        name: race.name,
        location: race.location,
        startDate: race.startDate,
        maxParticipants: race.maxParticipants,
        status: "CANCELED",
        adminMessage: "Race canceled by organizer.",
      });

      const updatedRaces = races.map((currentRace) =>
        currentRace.id === race.id ? updatedRace : currentRace,
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
      const updatedRace = await updateRace(race.id, {
        name: race.name,
        location: race.location,
        startDate: race.startDate,
        maxParticipants: race.maxParticipants,
        status: "POSTPONED",
        adminMessage: "Race postponed by organizer.",
      });

      const updatedRaces = races.map((currentRace) =>
        currentRace.id === race.id ? updatedRace : currentRace,
      );

      setRaces(updatedRaces);

      alert("Race postponed successfully");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  async function handleSynchronizeLive() {
    setSynchronizingLive(true);

    try {
      const synchronizedRaces = await synchronizeRacePublications();
      alert(`Desert Live synchronized for ${synchronizedRaces} races.`);
    } catch (caughtError) {
      alert(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to synchronize Desert Live races",
      );
    } finally {
      setSynchronizingLive(false);
    }
  }

  return (
    <section className="du-page du-viewport-page du-collection-page">
      <header className="du-page-header">
        <p className="du-eyebrow">Race Calendar</p>
        <h1 className="du-title-xl">🏁 Races</h1>
      </header>

      {hasAdminAccess(currentUser?.role) && (
        <div className="du-page-actions du-inline du-inline-sm du-inline-wrap">
          <button
            type="button"
            className="du-button du-button-small du-button-rect"
            disabled={synchronizingLive}
            onClick={handleSynchronizeLive}
          >
            {synchronizingLive ? "Synchronizing..." : "Sync Desert Live"}
          </button>
          <button
            type="button"
            className="du-button du-button-primary du-button-small du-button-rect"
            onClick={() => navigate("/races/new")}
          >
            Add New Race
          </button>
        </div>
      )}

      <div className="du-collection-scroll du-soft-scroll">
      <div className="du-grid">
        {races.map((race) => {
          const status = race.status ?? "UPCOMING";
          const formattedDate = formatRaceDate(race.startDate);
          const avatarFraming = getRaceImageFraming(race).avatar;
          const imageUrl = getRaceAssetUrl(race.imageUrl);

          return (
            <article
              key={race.id}
              className="du-card du-entity-card du-race-card"
            >
              <div className="du-race-card-heading">
                <div className="du-race-card-title-group">
                  <h2>{race.name}</h2>
                  <span
                    className={`du-status du-status-${status.toLowerCase()}`}
                  >
                    {status}
                  </span>
                </div>
                <span className="du-row-media du-race-card-avatar">
                  <FocalImage
                    src={imageUrl ?? raceBackground}
                    alt={`${race.name} avatar`}
                    focusX={imageUrl ? avatarFraming.focusX : 50}
                    focusY={imageUrl ? avatarFraming.focusY : 50}
                    cropPercent={imageUrl ? avatarFraming.cropPercent : 0}
                  />
                </span>
              </div>

              <p>📍 {race.location}</p>

              <p>📅 {formattedDate}</p>
              <p>👥 Up to {race.maxParticipants} drivers</p>

              <div className="du-entity-actions">
                {hasAdminAccess(currentUser?.role) && (
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
      </div>
    </section>
  );
}

export default RacesPage;
