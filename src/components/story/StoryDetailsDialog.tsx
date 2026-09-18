import { useEffect } from "react";

import homePageImage from "../../assets/home_page.jpg";
import DetailsCard from "../details/DetailsCard";
import StoryCarousel from "./StoryCarousel";
import type { StorySlide } from "./storyContent";

type StoryDetailsDialogProps = {
  slides: StorySlide[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
};

function StoryDetailsDialog({
  slides,
  activeIndex,
  onActiveIndexChange,
  onClose,
}: StoryDetailsDialogProps) {
  useEffect(() => {
    const homePage = document.querySelector<HTMLElement>(".home-page");
    const previousOverflow = homePage?.style.overflow;
    const previouslyFocusedElement = document.activeElement;

    if (homePage) {
      homePage.style.overflow = "hidden";
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);

      if (homePage) {
        homePage.style.overflow = previousOverflow ?? "";
      }

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [onClose]);

  return (
    <div
      className="story-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="story-dialog-shell"
        role="dialog"
        aria-modal="true"
        aria-label="The Story"
      >
        <DetailsCard
          image={{
            src: homePageImage,
            alt: "Negev Desert road at sunset",
            ariaHidden: true,
          }}
          eyebrow="Crazy Desert Live Club"
          title="The Story"
          status={
            <button
              type="button"
              className="du-button du-button-small du-button-rect"
              onClick={onClose}
              autoFocus
            >
              Close
            </button>
          }
          className="story-details-card"
          topAligned
        >
          <StoryCarousel
            slides={slides}
            activeIndex={activeIndex}
            onActiveIndexChange={onActiveIndexChange}
            variant="expanded"
          />
        </DetailsCard>
      </div>
    </div>
  );
}

export default StoryDetailsDialog;
