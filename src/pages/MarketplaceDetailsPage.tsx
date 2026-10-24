import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import raceBackground from "../assets/race.png";
import ChatBubbleIcon from "../components/chat/ChatBubbleIcon";
import DetailsCard from "../components/details/DetailsCard";
import DetailsOptionsMenu from "../components/details/DetailsOptionsMenu";
import { useAuth } from "../context/authContext";
import { openDirectChat, openSupportChat, updateSupportChatTopic } from "../services/chatService";
import {
  changeMarketplaceStatus,
  closeReportedMarketplaceListing,
  deleteClosedMarketplaceListing,
  getMarketplaceListing,
} from "../services/marketplaceService";
import { getRaceCarAssetUrl } from "../services/raceCarService";
import type { MarketplaceListing, MarketplaceStatus } from "../types/marketplace";
import { getRaceCarImageFraming } from "../utils/raceCarImageFraming";
import { hasAdminAccess } from "../utils/userRole";

function MarketplaceDetailsPage() {
  const { id } = useParams();
  const listingId = Number(id);
  const invalidId = !Number.isInteger(listingId) || listingId < 1;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (invalidId) return;
    void getMarketplaceListing(listingId)
      .then((value) => { if (active) setListing(value); })
      .catch((caughtError) => {
        if (active) setError(caughtError instanceof Error
          ? caughtError.message : "Failed to load listing");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [invalidId, listingId]);

  async function changeStatus(status: MarketplaceStatus) {
    if (!listing) return;
    if ((status === "SOLD" || status === "WITHDRAWN") &&
        !window.confirm(`Mark this listing as ${status.toLowerCase()}?`)) return;
    setBusy(true);
    setError("");
    try {
      setListing(await changeMarketplaceStatus(listing.id, status));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteListing() {
    if (!listing || !window.confirm("Delete this closed listing?")) return;
    setBusy(true);
    setError("");
    try {
      await deleteClosedMarketplaceListing(listing.id);
      navigate("/marketplace?mine=1");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Delete failed");
      setBusy(false);
    }
  }

  async function contactSeller() {
    if (!listing) return;
    setBusy(true);
    setError("");
    try {
      const chat = await openDirectChat(listing.sellerId);
      navigate(`/chats/${chat.id}?listing=${listing.id}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to open chat");
      setBusy(false);
    }
  }

  async function contactAdministration() {
    if (!listing) return;
    setBusy(true);
    setError("");
    try {
      const chat = await openSupportChat();
      await updateSupportChatTopic("MARKETPLACE");
      navigate(`/chats/${chat.id}?reportListing=${listing.id}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to open Administration");
      setBusy(false);
    }
  }

  async function closeReportedSale() {
    if (!listing) return;
    const reason = window.prompt("Reason for closing this reported sale:");
    if (reason === null) return;
    if (!reason.trim() || reason.trim().length > 500) {
      setError("Enter a reason of up to 500 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      setListing(await closeReportedMarketplaceListing(listing.id, reason.trim()));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to close sale");
    } finally {
      setBusy(false);
    }
  }

  if (invalidId) return <p className="du-error">Invalid listing</p>;
  if (loading) return <p className="du-sand-text">Loading listing...</p>;
  if (!listing) return <p className="du-error">{error || "Listing not found"}</p>;

  const car = listing.car;
  const ownListing = currentUser?.id === listing.sellerId;
  const imageUrl = getRaceCarAssetUrl(car.imageUrl);
  const framing = getRaceCarImageFraming(car).card;
  const price = new Intl.NumberFormat("en-US", {
    style: "currency", currency: listing.currency,
  }).format(listing.price);
  const closed = listing.status === "SOLD" || listing.status === "WITHDRAWN";
  const available = !listing.expired
    && (listing.status === "ACTIVE" || listing.status === "RESERVED");
  const saleActions = [
    { label: "Back to Marketplace", icon: "←", onClick: () => navigate(
      ownListing ? "/marketplace?mine=1" : "/marketplace") },
    { label: "Car Gallery", icon: "▣", onClick: () => navigate(`/cars/${car.id}/gallery`) },
    ...(ownListing ? [
      { label: "My Desert Live", icon: "✦", onClick: () => navigate(
        "/activity/my?category=MARKETPLACE") },
      ...(!closed && listing.status !== "REJECTED" ? [{
        label: listing.expired ? "Renew sale" : "Edit sale details",
        icon: "⚙",
        onClick: () => navigate(`/marketplace/${listing.id}/edit`),
      }] : []),
      ...(available && listing.status === "ACTIVE" ? [{
        label: "Mark reserved", icon: "◷", disabled: busy,
        onClick: () => { void changeStatus("RESERVED"); },
      }] : []),
      ...(available && listing.status === "RESERVED" ? [{
        label: "Make available", icon: "✓", disabled: busy,
        onClick: () => { void changeStatus("ACTIVE"); },
      }] : []),
      ...(available ? [{
        label: "Mark sold", icon: "✓", disabled: busy,
        onClick: () => { void changeStatus("SOLD"); },
      }] : []),
      ...(!closed && !listing.expired ? [{
        label: "Withdraw", icon: "×", disabled: busy,
        onClick: () => { void changeStatus("WITHDRAWN"); },
      }] : []),
      ...(closed || listing.expired ? [{
        label: "Delete closed listing", icon: "×", disabled: busy,
        onClick: () => { void deleteListing(); },
      }] : []),
    ] : [
      ...(available && !hasAdminAccess(currentUser?.role) ? [{
        label: "Report sale to Administration", icon: "⚑", disabled: busy,
        onClick: () => { void contactAdministration(); },
      }] : []),
      ...(available && hasAdminAccess(currentUser?.role)
        && searchParams.get("reported") === "1" ? [{
        label: "Close reported sale", icon: "×", disabled: busy,
        onClick: () => { void closeReportedSale(); },
      }] : []),
    ]),
  ];

  return (
    <section className="du-page du-viewport-page">
      <DetailsCard
        className="du-car-details du-car-photo-details du-marketplace-details" scrollable
        eyebrow="Marketplace"
        title={car.name}
        image={{
          src: imageUrl ?? raceBackground,
          alt: `${car.brand} ${car.name}`,
          focusX: framing.focusX, focusY: framing.focusY,
          cropPercent: imageUrl ? framing.cropPercent : 0,
          mobileFraming: imageUrl ? car.mobileImageFraming ?? framing : undefined,
          authenticated: Boolean(car.imageUrl?.includes("/driver-photos/")),
        }}
        status={
          <div className="du-marketplace-heading-actions">
            {(listing.expired || listing.status !== "ACTIVE") && (
              <span className="du-badge">{listing.expired
                ? "EXPIRED" : listing.status === "REJECTED"
                  ? "CLOSED" : listing.status.replaceAll("_", " ")}</span>
            )}
            {!ownListing && available && (
              <button
                type="button"
                className="du-button du-button-small du-driver-chat-button du-driver-profile-chat-button"
                disabled={busy}
                onClick={() => { void contactSeller(); }}
              >
                <ChatBubbleIcon className="du-driver-chat-icon" />
                <span>Chat</span>
              </button>
            )}
            <DetailsOptionsMenu label="Sale options" actions={saleActions} />
          </div>
        }
      >
        <div className="du-car-gallery-photos-scroll du-scroll-large du-car-photo-details-content-scroll">
          <div className="du-details-info">
            <p>Price: {price}</p>
            <p>Horse power: {car.horsePower} HP</p>
            <p>Seller: {listing.sellerName}</p>
            <p>Sale starts: {listing.publishedAt
              ? new Date(listing.publishedAt).toLocaleDateString() : "Not published"}</p>
            <p>Sale ends: {listing.endDate
              ? new Date(`${listing.endDate}T12:00:00`).toLocaleDateString()
              : "Not set"}</p>
          </div>
          {listing.expired && <p className="du-text-soft">The sale has ended. Renew it to publish it again.</p>}
          {listing.reviewNote && <p className="du-error">Administration note: {listing.reviewNote}</p>}
          {error && <p className="du-error">{error}</p>}
          <p className="du-details-description">{listing.description}</p>
        </div>
      </DetailsCard>
    </section>
  );
}

export default MarketplaceDetailsPage;
