import type { ReactNode } from "react";

import FocalImage from "../images/FocalImage";

type DetailsCardImage = {
  src: string;
  alt: string;
  focusX?: number;
  focusY?: number;
  cropPercent?: number;
  ariaHidden?: boolean;
};

type DetailsCardProps = {
  image: DetailsCardImage;
  eyebrow: ReactNode;
  title: ReactNode;
  status?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  floatingLayer?: ReactNode;
  className?: string;
  overlayClassName?: string;
  actionsClassName?: string;
  topAligned?: boolean;
};

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

function DetailsCard({
  image,
  eyebrow,
  title,
  status,
  children,
  actions,
  floatingLayer,
  className,
  overlayClassName,
  actionsClassName,
  topAligned = false,
}: DetailsCardProps) {
  return (
    <article
      className={joinClassNames(
        "du-details-card",
        "du-entity-details",
        className,
      )}
    >
      <FocalImage
        src={image.src}
        alt={image.alt}
        focusX={image.focusX}
        focusY={image.focusY}
        cropPercent={image.cropPercent}
        className="du-details-media"
        aria-hidden={image.ariaHidden}
      />

      <div
        className={joinClassNames(
          "du-details-overlay",
          topAligned && "du-details-overlay-top",
          overlayClassName,
        )}
      >
        <div className="du-details-heading">
          <p className="du-details-eyebrow">{eyebrow}</p>
          {status}
        </div>

        <h1 className="du-details-title">{title}</h1>

        {children}

        {actions && (
          <div
            className={joinClassNames(
              "du-details-actions",
              actionsClassName,
            )}
          >
            {actions}
          </div>
        )}
      </div>

      {floatingLayer}
    </article>
  );
}

export default DetailsCard;
