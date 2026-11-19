import { Link } from "react-router-dom";
import FocalImage from "./images/FocalImage";
import { getDesertLiveAssetUrl } from "../services/desertLiveService";
import type { DesertLiveItem } from "../types/desertLive";
import { getDesertLiveImageFraming } from "../utils/desertLiveImageFraming";
import festivalImage from "../assets/ChatGPT Image 15 июл. 2026 г., 19_27_11.png";

export function FestivalCard({ festival }: { festival: DesertLiveItem }) {
  const image = getDesertLiveAssetUrl(festival.imageUrl);
  const framing = getDesertLiveImageFraming(festival).card;
  const date = festival.activeFrom
    ? new Date(festival.activeFrom).toLocaleDateString("en-IL", { day: "numeric", month: "short", year: "numeric" })
    : "Date to be announced";

  return (
    <Link className="du-card du-showcase-card du-festival-card" to={`/festivals/${festival.id}`}>
      <FocalImage src={image ?? festivalImage} alt="" className="du-showcase-media"
        focusX={image ? framing.focusX : 50} focusY={image ? framing.focusY : 50}
        cropPercent={image ? framing.cropPercent : 0} />
      <div className="du-showcase-content">
        <p className="du-eyebrow du-showcase-eyebrow">Festival · {date}</p>
        <h2 className="du-showcase-title">{festival.title}</h2>
        <div className="du-showcase-meta">
          {festival.festivalLocation && <span className="du-badge">📍 {festival.festivalLocation}</span>}
          <span className="du-badge">{festival.festivalTicketPrice
            ? `₪${festival.festivalTicketPrice} entry` : "Free entry"}</span>
        </div>
        <span className="du-button du-button-primary du-showcase-action">View festival →</span>
      </div>
    </Link>
  );
}
