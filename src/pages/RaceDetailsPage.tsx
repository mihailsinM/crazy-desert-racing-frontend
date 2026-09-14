import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import raceBackground from "../assets/race.png";
import DetailsCard from "../components/details/DetailsCard";
import { useAuth } from "../context/authContext";
import { getMyRaceCars } from "../services/raceCarService";
import {
  getRaceParticipants,
  registerMyCarForRace,
  type RaceParticipant,
} from "../services/raceRegistrationService";
import {
  deleteRace,
  getRaceAssetUrl,
  getRaceById,
} from "../services/raceService";
import type { RaceCar } from "../types/raceCar";
import type { Race } from "../types/race";
import { getRaceImageFraming } from "../utils/raceImageFraming";

function formatRaceDate(startDate: string): string {
  return new Date(startDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function RaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [race, setRace] = useState<Race | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [myCars, setMyCars] = useState<RaceCar[]>([]);
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRace() {
      try {
        if (!id) {
          setError("Race id is missing");
          return;
        }

        const raceId = Number(id);
        const [loadedRace, cars, raceParticipants] = await Promise.all([
          getRaceById(raceId),
          getMyRaceCars(),
          getRaceParticipants(raceId),
        ]);

        if (active) {
          setRace(loadedRace);
          setMyCars(cars);
          setParticipants(raceParticipants);
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load race details",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRace();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <p className="du-sand-text">Loading race details...</p>;
  }

  if (error) {
    return <p className="du-error">{error}</p>;
  }

  if (!race) {
    return <p className="du-error">Race not found</p>;
  }

  async function handleRegister() {
    try {
      if (!race) {
        return;
      }

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
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        alert(caughtError.message);
      }
    }
  }

  async function handleDeleteRace() {
    if (!race) {
      return;
    }

    if (
      !window.confirm(
        `Delete ${race.name} and its Desert Live publication?`,
      )
    ) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteRace(race.id);
      navigate("/races");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete race",
      );
      setDeleting(false);
    }
  }

  const imageUrl = getRaceAssetUrl(race.imageUrl);
  const cardFraming = getRaceImageFraming(race).card;
  const detailsImage = {
    src: imageUrl ?? raceBackground,
    alt: `${race.name} card image`,
    focusX: imageUrl ? cardFraming.focusX : 50,
    focusY: imageUrl ? cardFraming.focusY : 50,
    cropPercent: imageUrl ? cardFraming.cropPercent : 0,
  };

  if (showParticipants) {
    return (
      <section className="du-page du-viewport-page">
        <DetailsCard
          className="du-race-details"
          eyebrow="Race Participants"
          title={<>👥 Registered Drivers</>}
          image={detailsImage}
          topAligned
          actionsClassName="du-push-bottom"
          scrollable
          actions={
            <button
              type="button"
              className="du-button du-sand-text"
              onClick={() => setShowParticipants(false)}
            >
              Back to Race Details
            </button>
          }
        >
          <p className="du-details-message-title du-sand-text">
            Registered Drivers: {participants.length} /{" "}
            {race.maxParticipants}
          </p>

          <div className="du-scroll-area du-soft-scroll">
            {participants.length === 0 ? (
              <p className="du-text-soft">No registered drivers yet.</p>
            ) : (
              participants.map((participant) => (
                <p key={participant.registrationId}>
                  👤 {participant.userName} 🚗 {participant.carBrand}{" "}
                  {participant.carName}
                </p>
              ))
            )}
          </div>
        </DetailsCard>
      </section>
    );
  }

  return (
    <section className="du-page du-viewport-page">
      <DetailsCard
        className="du-race-details"
        eyebrow="Race Details"
        title={<>🏁 {race.name}</>}
        image={detailsImage}
        scrollable
        status={
          <span
            className={`du-status du-status-${race.status.toLowerCase()}`}
          >
            {race.status}
          </span>
        }
        actions={
          <>
            <div className="du-details-secondary-actions">
              <button
                type="button"
                className="du-button du-button-small"
                onClick={() => setShowParticipants(true)}
              >
                <span className="du-sand-text">
                  👥 {participants.length} / {race.maxParticipants}
                </span>
                <span className="du-warm-text"> · View Drivers</span>
              </button>

              <button
                type="button"
                className="du-button du-button-small du-sand-text"
                onClick={() => navigate("/races")}
              >
                ← Back to Races
              </button>

              {currentUser?.role === "ADMIN" && (
                <button
                  type="button"
                  className="du-button du-button-small du-sand-text"
                  onClick={() => navigate(`/races/${race.id}/edit`)}
                >
                  🛠 Edit Race
                </button>
              )}

              {currentUser?.role === "ADMIN" && (
                <button
                  type="button"
                  className="du-button du-button-small du-button-danger"
                  disabled={deleting}
                  onClick={handleDeleteRace}
                >
                  {deleting ? "Deleting..." : "Delete Race"}
                </button>
              )}
            </div>

            <button
              type="button"
              className="du-button du-button-primary"
              onClick={handleRegister}
            >
              🏁 Register For Race
            </button>
          </>
        }
      >
        <div className="du-details-info">
          <p>📍 {race.location}</p>
          <p>📅 {formatRaceDate(race.startDate)}</p>
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
      </DetailsCard>
    </section>
  );
}

export default RaceDetailsPage;
