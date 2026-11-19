import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FestivalCard } from "./FestivalCard";
import FocalImage from "./images/FocalImage";
import { getRandomDesertLiveItems } from "../services/desertLiveService";
import { getDesertLiveAssetUrl } from "../services/desertLiveService";
import { getDesertLiveImageFraming } from "../utils/desertLiveImageFraming";
import type { DesertLiveItem } from "../types/desertLive";
import festivalImage from "../assets/ChatGPT Image 15 июл. 2026 г., 19_27_11.png";
import "../styles/festival-experience-section.css";

function FestivalExperienceSection() {
  const [festivals, setFestivals] = useState<DesertLiveItem[]>([]);
  const [featured, setFeatured] = useState<DesertLiveItem | null>(null);
  const [featuredChanging, setFeaturedChanging] = useState(false);
  const [cardsChanging, setCardsChanging] = useState(false);
  const festivalsRef = useRef<DesertLiveItem[]>([]);
  const featuredRef = useRef<DesertLiveItem | null>(null);

  useEffect(() => {
    let mounted = true;
    let refreshing = false;
    const timeouts: number[] = [];
    const frames: number[] = [];
    const reveal = (setter: (value: boolean) => void) => {
      frames.push(window.requestAnimationFrame(() => {
        frames.push(window.requestAnimationFrame(() => { if (mounted) setter(false); }));
      }));
    };
    function refresh() {
      if (document.visibilityState !== "visible" || refreshing) return;
      refreshing = true;
      void getRandomDesertLiveItems("FESTIVAL", 7)
        .then((items) => {
          if (!mounted) return;
          if (!festivalsRef.current.length) {
            festivalsRef.current = items;
            setFestivals(items);
            featuredRef.current = items[0] ?? null;
            setFeatured(items[0] ?? null);
            return;
          }
          setCardsChanging(true);
          timeouts.push(window.setTimeout(() => {
            if (!mounted) return;
            festivalsRef.current = items;
            setFestivals(items);
            reveal(setCardsChanging);
          }, 750));
        })
        .catch(() => {})
        .finally(() => { refreshing = false; });
    }
    refresh();
    const refreshInterval = window.setInterval(refresh, 15_000);
    const rotateInterval = window.setInterval(() => {
      const choices = festivalsRef.current.filter((item) => item.id !== featuredRef.current?.id);
      if (document.visibilityState !== "visible" || !choices.length) return;
      const next = choices[Math.floor(Math.random() * choices.length)];
      setFeaturedChanging(true);
      timeouts.push(window.setTimeout(() => {
        if (!mounted) return;
        featuredRef.current = next;
        setFeatured(next);
        reveal(setFeaturedChanging);
      }, 750));
    }, 5_000);
    return () => {
      mounted = false;
      window.clearInterval(refreshInterval);
      window.clearInterval(rotateInterval);
      timeouts.forEach(window.clearTimeout);
      frames.forEach(window.cancelAnimationFrame);
    };
  }, []);

  const image = featured ? getDesertLiveAssetUrl(featured.imageUrl) : null;
  const framing = featured ? getDesertLiveImageFraming(featured).card : null;

  return (
    <section id="festival" className="festival-section">
      <p>Festival Experience</p>
      <Link to={featured ? `/festivals/${featured.id}` : "/festivals"} className={`festival-content${featuredChanging ? " festival-content-changing" : ""}`}>
        <FocalImage className="festival-featured-image"
          src={image ?? festivalImage} alt="" focusX={image ? framing?.focusX : 50}
          focusY={image ? framing?.focusY : 50} cropPercent={image ? framing?.cropPercent : 0} />
        <h2>{featured?.title ?? "Race by day. Celebrate by night."}</h2>

        <p className="festival-text">{featured?.activeFrom
          ? new Date(featured.activeFrom).toLocaleDateString("en-IL", { day: "numeric", month: "short", year: "numeric" })
          : "Explore upcoming festivals across Israel."}
          {featured?.festivalLocation ? ` · ${featured.festivalLocation}` : ""}</p>
        <span className="du-button du-button-primary">{featured ? "View Festival →" : "Explore Festivals →"}</span>
      </Link>
      {festivals.length > 0 && <div className={`du-showcase-grid festival-preview-grid du-container${cardsChanging ? " festival-preview-grid-changing" : ""}`}>
        {festivals.slice(0, 6).map((festival) => <FestivalCard key={festival.id} festival={festival} />)}
      </div>}
    </section>
  );
}

export default FestivalExperienceSection;
