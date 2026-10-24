import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import raceBackground from "../assets/race.png";
import DetailsCard from "../components/details/DetailsCard";
import DetailsOptionsMenu from "../components/details/DetailsOptionsMenu";
import { useAuth } from "../context/authContext";
import { getMyMarketplaceListings } from "../services/marketplaceService";
import {
  deleteRaceCar,
  getRaceCarAssetUrl,
  getRaceCarById,
} from "../services/raceCarService";
import type { RaceCar } from "../types/raceCar";
import type { MarketplaceListing } from "../types/marketplace";
import { getRaceCarImageFraming } from "../utils/raceCarImageFraming";

function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [car, setCar] = useState<RaceCar | null>(null);
  const [saleListing, setSaleListing] = useState<MarketplaceListing | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadCar() {
      try {
        if (!id) return;

        const data = await getRaceCarById(Number(id));
        setCar(data);
        if (data.ownerId === currentUser?.id) {
          const listings = await getMyMarketplaceListings();
          setSaleListing(listings.find((item) => item.car.id === data.id
            && (item.expired || !["SOLD", "WITHDRAWN"].includes(item.status))) ?? null);
        }
      } catch {
        setError("Failed to load car details");
      } finally {
        setLoading(false);
      }
    }

    loadCar();
  }, [id, currentUser?.id]);

  if (loading) {
    return <p>Loading car details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!car) {
    return <p>Car not found</p>;
  }

  async function handleDeleteCar() {
    if (!car) return;

    const confirmDelete = window.confirm(
      `Delete ${car.name} and its sale, car gallery, and race registrations? `
        + "Photos shared with your profile or another car and messages in other members' chats remain. This cannot be undone.",
    );

    if (!confirmDelete) return;

    try {
      await deleteRaceCar(car.id);
      navigate("/cars");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to delete car");
    }
  }
  const cardFraming = getRaceCarImageFraming(car).card;
  const imageUrl = getRaceCarAssetUrl(car.imageUrl);
  const ownsCar = currentUser?.id === car.ownerId;

  return (
    <section className="du-page du-viewport-page">
      <DetailsCard
        className="du-car-details du-car-photo-details"
        eyebrow="Car Details"
        title={<>🏎 {car.name}</>}
        status={
          <DetailsOptionsMenu label="Car options" actions={[
            { label: "Car Gallery", icon: "▣", onClick: () => navigate(`/cars/${car.id}/gallery`) },
            { label: "Back", icon: "←", onClick: () => navigate("/cars") },
            ...(ownsCar ? [
              { label: "Edit Car", icon: "⚙", onClick: () => navigate(`/cars/${car.id}/edit`) },
              {
                label: saleListing ? "View Sale Details" : "Sell this car",
                icon: "↗",
                onClick: () => navigate(saleListing
                  ? `/marketplace/${saleListing.id}` : `/cars/${car.id}/sell`),
              },
              { label: "Delete Car", icon: "×", onClick: () => { void handleDeleteCar(); } },
            ] : []),
          ]} />
        }
        image={{
          src: imageUrl ?? raceBackground,
          alt: `${car.brand} ${car.name}`,
          focusX: cardFraming.focusX,
          focusY: cardFraming.focusY,
          cropPercent: car.imageUrl ? cardFraming.cropPercent : 0,
          mobileFraming: imageUrl ? car.mobileImageFraming ?? cardFraming : undefined,
          authenticated: Boolean(car.imageUrl?.includes("/driver-photos/")),
        }}
        scrollable
      >
        <div className="du-car-gallery-photos-scroll du-scroll-large du-car-photo-details-content-scroll">
          <div className="du-details-info">
            <p>🏷 Brand: {car.brand}</p>
            <p>⚡ Horse Power: {car.horsePower} HP</p>
          </div>

          <p className="du-details-description">
            This vehicle is connected to your Crazy Desert Racing profile and
            can be used for future race registrations.
          </p>
        </div>
      </DetailsCard>
    </section>
  );
}

export default CarDetailsPage;
