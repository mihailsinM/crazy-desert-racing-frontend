import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RaceCarImage from "../components/images/RaceCarImage";
import raceBackground from "../assets/race.png";
import { getMyMarketplaceListings } from "../services/marketplaceService";
import {
  getMyRaceCars,
  getRaceCarAssetUrl,
} from "../services/raceCarService";
import type { RaceCar } from "../types/raceCar";
import type { MarketplaceListing } from "../types/marketplace";
import { getRaceCarImageFraming } from "../utils/raceCarImageFraming";


function MyCarsPage() {
  const [cars, setCars] = useState<RaceCar[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadCars() {
      try {
        const [data, myListings] = await Promise.all([
          getMyRaceCars(), getMyMarketplaceListings(),
        ]);
        setCars(data);
        setListings(myListings);
      } catch {
        setError("Failed to load race cars");
      } finally {
        setLoading(false);
      }
    }

    loadCars();
  }, []);

  if (loading) {
    return <p>Loading cars...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="du-page du-viewport-page du-collection-page">
      <header className="du-page-header">
        <h1 className="du-eyebrow du-my-cars-title">My Cars</h1>
        <button type="button" className="du-button du-button-small du-button-rect du-button-inline"
          onClick={() => navigate("/marketplace?mine=1")}>My sale listings</button>
      </header>

      <div className="du-collection-scroll du-soft-scroll">
      <div className="du-showcase-grid">
        {cars.length === 0 && (
          <article className="du-card">
            <h2>No cars yet</h2>
            <p>
              Your garage is empty. Soon you will be able to add your first
              racing car.
            </p>
            <span className="du-badge">Empty garage</span>
          </article>
        )}

        {cars.map((car) => {
          const cardFraming = getRaceCarImageFraming(car).card;
          const listing = listings.find((item) => item.car.id === car.id
            && (item.expired || !["SOLD", "WITHDRAWN"].includes(item.status)));

          return (
            <article
              key={car.id}
              className="du-card du-showcase-card"
              onClick={() => navigate(`/cars/${car.id}`)}
            >
              <RaceCarImage
                src={getRaceCarAssetUrl(car.imageUrl) ?? raceBackground}
                alt={`${car.brand} ${car.name}`}
                focusX={cardFraming.focusX}
                focusY={cardFraming.focusY}
                cropPercent={car.imageUrl ? cardFraming.cropPercent : 0}
                className="du-showcase-media"
              />
              <div className="du-showcase-content">
                <p className="du-eyebrow du-showcase-eyebrow">{car.brand}</p>

                <h2 className="du-showcase-title">{car.name}</h2>

                <div className="du-showcase-meta">
                  <span className="du-badge">{car.horsePower} HP</span>
                </div>
              </div>
              <div className="du-showcase-actions">
                <button
                  className="du-button du-button-primary du-showcase-action"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/cars/${car.id}`);
                  }}
                >
                  View Details →
                </button>
                <button
                  className="du-button du-showcase-secondary-action"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(listing ? `/marketplace/${listing.id}` : `/cars/${car.id}/sell`);
                  }}
                >
                  {listing ? "View Sale Details" : "Sell this car"}
                </button>
              </div>
            </article>
          );
        })}
        <article className="du-card" onClick={() => navigate("/cars/new")}>
          <h2>+ Add New Car</h2>
          <p>Connect your next racing vehicle to your driver profile.</p>
          <span className="du-badge">Open form</span>
        </article>
      </div>
      </div>
    </section>
  );
}

export default MyCarsPage;
