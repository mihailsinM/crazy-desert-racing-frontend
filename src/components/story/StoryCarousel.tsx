import { useCallback, useEffect, useRef } from "react";
import type {
  KeyboardEvent,
  MouseEvent,
  TouchEvent,
  UIEvent,
} from "react";

import type { StorySlide } from "./storyContent";

type StoryCarouselProps = {
  slides: StorySlide[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  variant: "compact" | "expanded";
  onOpen?: () => void;
};

function StoryCarousel({
  slides,
  activeIndex,
  onActiveIndexChange,
  variant,
  onOpen,
}: StoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const previousIndexRef = useRef(activeIndex);
  const programmaticScrollRef = useRef(false);
  const releaseScrollTimerRef = useRef<number | null>(null);
  const wheelUnlockTimerRef = useRef<number | null>(null);
  const wheelLockedRef = useRef(false);
  const touchStartRef = useRef({ y: 0, scrollTop: 0 });
  const suppressOpenRef = useRef(false);
  const activeIndexRef = useRef(activeIndex);
  const cancelProgrammaticScroll = useCallback(() => {
    programmaticScrollRef.current = false;

    if (releaseScrollTimerRef.current !== null) {
      window.clearTimeout(releaseScrollTimerRef.current);
      releaseScrollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement || slides.length <= 1) {
      return;
    }

    const maximumScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
    const targetScroll = (maximumScroll * activeIndex) / (slides.length - 1);
    const wrapsToStart =
      previousIndexRef.current === slides.length - 1 && activeIndex === 0;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    programmaticScrollRef.current = true;
    scrollElement.scrollTo({
      top: targetScroll,
      behavior: wrapsToStart || prefersReducedMotion ? "auto" : "smooth",
    });

    if (releaseScrollTimerRef.current !== null) {
      window.clearTimeout(releaseScrollTimerRef.current);
    }

    releaseScrollTimerRef.current = window.setTimeout(
      () => {
        programmaticScrollRef.current = false;
      },
      wrapsToStart ? 100 : 700,
    );
    previousIndexRef.current = activeIndex;

    return () => {
      if (releaseScrollTimerRef.current !== null) {
        window.clearTimeout(releaseScrollTimerRef.current);
      }
    };
  }, [activeIndex, slides.length]);

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    function handleWheel(event: globalThis.WheelEvent) {
      if (Math.abs(event.deltaY) < 3 || wheelLockedRef.current) {
        return;
      }

      event.preventDefault();
      cancelProgrammaticScroll();

      const currentIndex = activeIndexRef.current;
      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.min(
        slides.length - 1,
        Math.max(0, currentIndex + direction),
      );

      if (nextIndex !== currentIndex) {
        onActiveIndexChange(nextIndex);
      }

      wheelLockedRef.current = true;

      if (wheelUnlockTimerRef.current !== null) {
        window.clearTimeout(wheelUnlockTimerRef.current);
      }

      wheelUnlockTimerRef.current = window.setTimeout(() => {
        wheelLockedRef.current = false;
      }, 420);
    }

    scrollElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollElement.removeEventListener("wheel", handleWheel);

      if (wheelUnlockTimerRef.current !== null) {
        window.clearTimeout(wheelUnlockTimerRef.current);
      }
    };
  }, [cancelProgrammaticScroll, onActiveIndexChange, slides.length]);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    if (programmaticScrollRef.current || slides.length <= 1) {
      return;
    }

    const scrollElement = event.currentTarget;
    const maximumScroll = scrollElement.scrollHeight - scrollElement.clientHeight;

    if (maximumScroll <= 0) {
      return;
    }

    const nextIndex = Math.round(
      (scrollElement.scrollTop / maximumScroll) * (slides.length - 1),
    );

    if (nextIndex !== activeIndex) {
      onActiveIndexChange(nextIndex);
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    cancelProgrammaticScroll();
    touchStartRef.current = {
      y: event.touches[0]?.clientY ?? 0,
      scrollTop: event.currentTarget.scrollTop,
    };
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const endY = event.changedTouches[0]?.clientY ?? touchStartRef.current.y;
    const movedByTouch = Math.abs(endY - touchStartRef.current.y);
    const movedByScroll = Math.abs(
      event.currentTarget.scrollTop - touchStartRef.current.scrollTop,
    );

    if (movedByTouch > 10 || movedByScroll > 4) {
      suppressOpenRef.current = true;
      window.setTimeout(() => {
        suppressOpenRef.current = false;
      }, 350);
    }
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (!onOpen) {
      return;
    }

    event.stopPropagation();

    if (suppressOpenRef.current) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const clickedScrollbar = event.clientX >= bounds.right - 14;

    if (!clickedScrollbar) {
      onOpen();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.key === "Enter" || event.key === " ") && onOpen) {
      event.preventDefault();
      onOpen();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      onActiveIndexChange((activeIndex + 1) % slides.length);
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      onActiveIndexChange(
        (activeIndex - 1 + slides.length) % slides.length,
      );
    }
  }

  return (
    <div
      ref={scrollRef}
      className={` story-slider story-slider-${variant} du-soft-scroll du-scroll-card`}
      aria-label="Crazy Desert Live Club story"
      aria-haspopup={onOpen ? "dialog" : undefined}
      role={onOpen ? "button" : "region"}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="story-slider-track">
        <div className="story-stage" aria-live="polite">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <article
                key={slide.title ?? "project-to-reality"}
                className={`story-slide${isActive ? " story-slide-active" : ""}${slide.finale ? " story-final" : ""}`}
                aria-hidden={!isActive}
              >
                {slide.finale ? (
                  <div className="story-final-copy">
                    <p className="story-final-line story-final-today">
                      Today, it is a project.
                    </p>
                    <p className="story-final-line story-final-tomorrow">
                      Tomorrow... reality.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="du-title-lg">{slide.title}</h2>
                    <p>{slide.copy}</p>
                  </>
                )}
              </article>
            );
          })}
        </div>

        {slides.slice(1).map((_, index) => (
          <div
            key={`story-scroll-marker-${index + 1}`}
            className="story-scroll-marker"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

export default StoryCarousel;
