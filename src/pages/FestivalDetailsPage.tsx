import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DetailsCard from "../components/details/DetailsCard";
import ChatBubbleIcon from "../components/chat/ChatBubbleIcon";
import { useAuth } from "../context/authContext";
import { openDirectChat } from "../services/chatService";
import { getDesertLiveAssetUrl, getPublicDesertLiveItem } from "../services/desertLiveService";
import { getDesertLiveImageFraming } from "../utils/desertLiveImageFraming";
import type { DesertLiveItem } from "../types/desertLive";
import festivalImage from "../assets/ChatGPT Image 15 июл. 2026 г., 19_27_11.png";

export default function FestivalDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [item, setItem] = useState<DesertLiveItem | null>(null);
  const [error, setError] = useState("");
  const [openingChat, setOpeningChat] = useState(false);

  useEffect(() => {
    let mounted = true;
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1) return;
    void getPublicDesertLiveItem(numericId).then((result) => {
      if (mounted) {
        if (result.category !== "FESTIVAL") setError("Festival not found");
        else setItem(result);
      }
    }).catch((cause) => {
      if (mounted) setError(cause instanceof Error ? cause.message : "Festival not found");
    });
    return () => { mounted = false; };
  }, [id]);

  if (error && !item) return <p className="du-error">{error}</p>;
  if (!item) return <p className="du-sand-text">Loading festival...</p>;

  const image = getDesertLiveAssetUrl(item.imageUrl);
  const framing = getDesertLiveImageFraming(item).card;
  const date = (value: string | null) => value
    ? new Date(value).toLocaleString("en-IL", { dateStyle: "medium", timeStyle: "short" })
    : "To be announced";

  async function contactOrganizer() {
    if (!item) return;
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(`/festivals/${item.id}`)}&chatUser=${item.authorId}`);
      return;
    }
    setOpeningChat(true);
    setError("");
    try {
      const conversation = await openDirectChat(item.authorId);
      navigate(`/chats/${conversation.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not open chat");
    } finally {
      setOpeningChat(false);
    }
  }

  const destination = `${item.festivalAddress ?? ""}, Israel`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

  return <section className="du-page du-viewport-page">
    <DetailsCard image={{ src: image ?? festivalImage, alt: item.title,
      focusX: image ? framing.focusX : 50, focusY: image ? framing.focusY : 50,
      cropPercent: image ? framing.cropPercent : 0 }}
      className="du-marketplace-details du-festival-details"
      eyebrow="Festival Experience" title={item.title} topAligned scrollable
      status={currentUser?.id === item.authorId
        ? <button className="du-button du-button-small du-button-back" type="button"
            onClick={() => navigate(`/activity/my/${item.id}/edit`)}>Edit</button>
        : <button className="du-button du-button-small du-driver-chat-button du-driver-profile-chat-button"
            type="button" disabled={openingChat} onClick={() => { void contactOrganizer(); }}>
            <ChatBubbleIcon className="du-driver-chat-icon" />
            <span>{isAuthenticated ? "Chat" : "Log in to chat"}</span>
          </button>}
      actions={<button className="du-button du-button-small du-button-back" type="button"
        onClick={() => navigate("/festivals")}>← Back</button>}>
      <div className="du-festival-details-content">
        <div className="du-details-info">
          <p>📅 {date(item.activeFrom)} – {date(item.activeUntil)}</p>
          {item.festivalLocation && <p>Location: {item.festivalLocation}</p>}
          {item.festivalAddress && <a
            className="du-button du-button-small du-button-back du-inline"
            href={directionsUrl} target="_blank" rel="noopener noreferrer"
            title="Open directions to this festival">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.5" /></svg>
            <span>{item.festivalAddress}</span>
          </a>}
          <p>{item.festivalTicketPrice ? `Tickets: ₪${item.festivalTicketPrice}` : "Free entry"}</p>
          <p>Organized by {item.authorName}</p>
        </div>
        {error && <p className="du-error">{error}</p>}
        <p className="du-details-description">{item.description}</p>
      </div>
    </DetailsCard>
  </section>;
}
