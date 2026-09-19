import "../styles/hero-section.css";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import StoryCarousel from "./story/StoryCarousel";
import StoryDetailsDialog from "./story/StoryDetailsDialog";
import { getStoryDuration, storySlides } from "./story/storyContent";

function HeroSection() {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);
  const storyCardRef = useRef<HTMLElement | null>(null);
  const openStory = useCallback(() => setStoryOpen(true), []);
  const closeStory = useCallback(() => setStoryOpen(false), []);

  useEffect(() => {
    const duration = getStoryDuration(storySlides[activeStoryIndex]);
    const timeoutId = window.setTimeout(() => {
      setActiveStoryIndex(
        (currentIndex) => (currentIndex + 1) % storySlides.length,
      );
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [activeStoryIndex]);

  useEffect(() => {
    const storyCard = storyCardRef.current;

    if (!storyCard) {
      return;
    }

    storyCard.classList.remove("du-story-pulse");
    void storyCard.offsetWidth;
    storyCard.classList.add("du-story-pulse");

    return () => storyCard.classList.remove("du-story-pulse");
  }, [activeStoryIndex]);

  return (
    <section className="hero-section du-page-shell">
      <div className="hero-layout du-container">
        <div className="hero-content">
          <p className="du-eyebrow">Negev Desert • Israel</p>

          <h1>Crazy Desert Racing</h1>

          <p className="du-title-md du-page-actions">A dream born in the Negev Desert.</p>

          <p className="du-text-soft du-text-large du-text-readable">
            A future community for people who love desert adventures, powerful
            cars, racing culture, music, friendship and unforgettable nights
            under the open sky.
          </p>

          <div className="du-inline du-inline-sm du-inline-wrap du-mt-lg du-inline-mobile-stack">
            <Link
              to="/register"
              className="du-button du-button-primary du-button-inline du-button-pulse"
            >
              Join The Journey
            </Link>

            <a href="#races" className="du-button du-button-inline">
              Explore Races
            </a>

            <a href="#festival" className="du-button du-button-inline">
              Explore Festival
            </a>
          </div>
        </div>

        <aside
          ref={storyCardRef}
          className="hero-story-card du-panel"
          onClick={openStory}
        >
          <p className="du-eyebrow">The Story</p>

          <StoryCarousel
            slides={storySlides}
            activeIndex={activeStoryIndex}
            onActiveIndexChange={setActiveStoryIndex}
            variant="compact"
            onOpen={openStory}
          />
        </aside>
      </div>

      {storyOpen && (
        <StoryDetailsDialog
          slides={storySlides}
          activeIndex={activeStoryIndex}
          onActiveIndexChange={setActiveStoryIndex}
          onClose={closeStory}
        />
      )}
    </section>
  );
}

export default HeroSection;
