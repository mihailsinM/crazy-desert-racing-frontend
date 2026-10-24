import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DesertLiveMenuFilter from "../components/desert-live/DesertLiveMenuFilter";
import { useAuth } from "../context/authContext";
import {
  getMarketplaceListing,
  getMyMarketplaceListings,
  saveMarketplaceListing,
} from "../services/marketplaceService";
import { getRaceCarById } from "../services/raceCarService";
import type { MarketplaceListingRequest } from "../types/marketplace";
import type { RaceCar } from "../types/raceCar";

function saleDate(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const currencyOptions = [
  { value: "ILS", label: "ILS · ₪", icon: "₪" },
  { value: "USD", label: "USD · $", icon: "$" },
  { value: "EUR", label: "EUR · €", icon: "€" },
] as const;

function MarketplaceEditorPage() {
  const { carId, listingId } = useParams();
  const targetId = Number(listingId ?? carId);
  const invalidId = !Number.isInteger(targetId) || targetId < 1;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [car, setCar] = useState<RaceCar | null>(null);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<MarketplaceListingRequest["currency"]>("ILS");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState(() => saleDate(30));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (invalidId) return;
    const load = listingId
      ? getMarketplaceListing(targetId)
      : Promise.all([getRaceCarById(targetId), getMyMarketplaceListings()]);
    void load.then((result) => {
      if (!active) return;
      if (Array.isArray(result)) {
        const [selectedCar, listings] = result;
        const existing = listings.find((item) => item.car.id === selectedCar.id
          && (item.expired || !["SOLD", "WITHDRAWN"].includes(item.status)));
        if (existing) {
          navigate(`/marketplace/${existing.id}`, { replace: true });
          return;
        }
        if (listings.some((item) => !item.expired
          && ["ACTIVE", "RESERVED", "PENDING_REVIEW"].includes(item.status))) {
          throw new Error("One active sale per member is available. Multiple sales are coming soon.");
        }
        setCar(selectedCar);
      } else {
        if (result.sellerId !== currentUser?.id) {
          throw new Error("You can edit only your own listing");
        }
        setCar(result.car);
        setPrice(String(result.price));
        setCurrency(result.currency);
        setDescription(result.description);
        setEndDate(result.endDate && result.endDate >= saleDate(1)
          ? result.endDate : saleDate(30));
      }
    }).catch((caughtError) => {
      if (active) setError(caughtError instanceof Error
        ? caughtError.message : "Failed to load car");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [invalidId, listingId, targetId, currentUser?.id, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!car || !(Number(price) > 0) || !description.trim()
        || endDate < saleDate(1) || endDate > saleDate(30)) return;
    setSaving(true);
    setError("");
    try {
      const listing = await saveMarketplaceListing({
        carId: car.id,
        price: Number(price),
        currency,
        description: description.trim(),
        endDate,
      }, listingId ? Number(listingId) : undefined);
      navigate(`/marketplace/${listing.id}`, { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error
        ? caughtError.message : "Failed to save listing");
    } finally {
      setSaving(false);
    }
  }

  if (invalidId) return <p className="du-error">Invalid car or listing</p>;
  if (loading) return <p className="du-sand-text">Loading car...</p>;
  if (!car) return <p className="du-error">{error || "Car not found"}</p>;

  const dateUnavailable = endDate > saleDate(30);
  return (
    <section className="du-page du-viewport-page du-collection-page">
      <header className="du-page-header">
        <h1 className="du-eyebrow du-my-cars-title">
          {listingId ? "Edit sale listing" : "Sell this car"}
        </h1>
      </header>
      <div className="du-collection-scroll du-soft-scroll">
        <form className="du-panel du-form du-form-panel" onSubmit={(event) => void handleSubmit(event)}>
          <h2>{car.brand} {car.name}</h2>
          <p className="du-text-soft">Your car and its photos stay in My Cars.</p>
          <div className="du-marketplace-price-row">
            <label className="du-field">
              <span className="du-field-label">Price</span>
              <input className="du-input" type="number" min="1" step="0.01"
                value={price} onChange={(event) => setPrice(event.target.value)} required />
            </label>
            <DesertLiveMenuFilter
              variant="SELECT" buttonLabel="Currency" menuLabel="Currency"
              value={currency} options={currencyOptions} onChange={setCurrency} />
          </div>
          <label className="du-field">
            <span className="du-field-label">Sale end date</span>
            <input className="du-input" type="date" min={saleDate(1)}
              value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
          </label>
          <p className="du-text-soft">Your sale appears immediately in Marketplace and Desert Live. Up to 30 days is free. Longer periods are coming soon.</p>
          {dateUnavailable && <p className="du-error">Longer sales are not available yet. Choose a date within 30 days.</p>}
          <label className="du-field">
            <span className="du-field-label">Sale description</span>
            <textarea className="du-input" maxLength={1000} rows={4}
              value={description} onChange={(event) => setDescription(event.target.value)}
              required />
          </label>
          {error && <p className="du-error">{error}</p>}
          {listingId && <p className="du-text-soft">Changes to this sale appear immediately.</p>}
          <div className="du-inline du-inline-sm du-inline-wrap">
            <button type="submit" className="du-button du-button-primary"
              disabled={saving || dateUnavailable}>{saving ? "Saving..."
                : listingId ? "Save sale" : "Publish sale"}</button>
            <button type="button" className="du-button"
              onClick={() => navigate(listingId ? `/marketplace/${listingId}` : `/cars/${car.id}`)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default MarketplaceEditorPage;
