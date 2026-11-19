import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import raceBackground from "../assets/race.png";
import RaceCarImage from "../components/images/RaceCarImage";
import { CHAT_UNREAD_CHANGED_EVENT, getChatUnreadCount } from "../services/chatService";
import {
  getMarketplaceListings,
  getMyMarketplaceListings,
} from "../services/marketplaceService";
import { getRaceCarAssetUrl } from "../services/raceCarService";
import type { MarketplaceListing } from "../types/marketplace";
import { getRaceCarImageFraming } from "../utils/raceCarImageFraming";
import { useAuth } from "../context/authContext";

function MarketplacePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const mine = searchParams.get("mine") === "1";
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inquiries, setInquiries] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    const refresh = () => {
      void getChatUnreadCount().then((counts) => {
        if (active) setInquiries(counts.marketplaceUnreadCount);
      }).catch(() => {});
    };
    refresh();
    window.addEventListener(CHAT_UNREAD_CHANGED_EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(CHAT_UNREAD_CHANGED_EVENT, refresh);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (mine && !isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent("/marketplace?mine=1")}`, { replace: true });
      return;
    }
    let active = true;

    async function loadListings() {
      try {
        const items = mine ? await getMyMarketplaceListings()
          : await getMarketplaceListings();
        if (active) setListings(items);
      } catch (caughtError) {
        if (active) setError(caughtError instanceof Error
          ? caughtError.message : "Failed to load marketplace");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadListings();
    return () => { active = false; };
  }, [mine, isAuthenticated, navigate]);

  return (
    <section className="du-page du-viewport-page du-collection-page">
      <header className="du-page-header">
        <h1 className="du-eyebrow du-my-cars-title">Marketplace</h1>
        <div className="du-inline du-inline-sm du-inline-wrap">
          {inquiries > 0 && <button type="button"
            className="du-button du-button-small du-button-rect"
            onClick={() => navigate("/chats")}>
            {inquiries} new sale {inquiries === 1 ? "message" : "messages"} · Open chats
          </button>}
          <button type="button" aria-pressed={!mine}
            className={`du-button du-button-small du-button-rect${!mine ? " du-button-primary" : ""}`}
            onClick={() => {
              if (mine) { setError(""); setLoading(true); setSearchParams({}); }
            }}>Browse cars</button>
          {isAuthenticated && <button type="button" aria-pressed={mine}
            className={`du-button du-button-small du-button-rect${mine ? " du-button-primary" : ""}`}
            onClick={() => {
              if (!mine) { setError(""); setLoading(true); setSearchParams({ mine: "1" }); }
            }}>My listings</button>}
          <button type="button" className="du-button du-button-primary du-button-small du-button-rect"
            onClick={() => navigate(isAuthenticated ? "/cars" : `/login?next=${encodeURIComponent("/cars")}`)}>Sell from My Cars</button>
        </div>
      </header>

      <div className="du-collection-scroll du-soft-scroll">
        {error && <p className="du-error">{error}</p>}
        {loading ? <p className="du-sand-text">Loading listings...</p> : (
          <div className="du-showcase-grid">
            {listings.map((listing) => {
              const originalImageUrl = getRaceCarAssetUrl(listing.car.imageUrl);
              const imageUrl = !isAuthenticated && originalImageUrl?.includes("/driver-photos/")
                ? null : originalImageUrl;
              const framing = getRaceCarImageFraming(listing.car).card;
              return (
                <article key={listing.id} className="du-card du-showcase-card"
                  onClick={() => navigate(`/marketplace/${listing.id}`)}>
                  <RaceCarImage
                    src={imageUrl ?? raceBackground}
                    alt={`${listing.car.brand} ${listing.car.name}`}
                    focusX={framing.focusX} focusY={framing.focusY}
                    cropPercent={imageUrl ? framing.cropPercent : 0}
                    className="du-showcase-media"
                  />
                  <div className="du-showcase-content">
                    <p className="du-eyebrow du-showcase-eyebrow">{listing.car.brand}</p>
                    <h2 className="du-showcase-title">{listing.car.name}</h2>
                    <div className="du-showcase-meta">
                      <span className="du-badge">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency", currency: listing.currency,
                          maximumFractionDigits: 0,
                        }).format(listing.price)}
                      </span>
                      <span className="du-badge">{listing.expired
                        ? "EXPIRED" : listing.status === "REJECTED"
                          ? "CLOSED" : listing.status.replaceAll("_", " ")}</span>
                    </div>
                    <button type="button" className="du-button du-button-primary du-showcase-action"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/marketplace/${listing.id}`);
                      }}>View listing →</button>
                  </div>
                </article>
              );
            })}
            {listings.length === 0 && !error && (
              <article className="du-card">
                <h2>{mine ? "No listings yet" : "No cars for sale yet"}</h2>
                <p>{mine
                  ? "Choose one of your existing cars to create a sale listing."
                  : "Sales appear here as soon as they are published from My Cars."}</p>
                <button type="button" className="du-button du-button-primary"
                  onClick={() => navigate("/cars")}>Open My Cars</button>
              </article>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default MarketplacePage;
