import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import AuthenticatedFocalImage from "../images/AuthenticatedFocalImage";
import GalleryPhotoViewer from "../images/GalleryPhotoViewer";

type ChatAttachmentImageProps = {
  src: string;
  alt: string;
};

function ChatAttachmentImage({ src, alt }: ChatAttachmentImageProps) {
  const [open, setOpen] = useState(false);
  const thumbnailRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const thumbnail = thumbnailRef.current;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLButtonElement>(".du-button-back")?.focus();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      thumbnail?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={thumbnailRef}
        type="button"
        className="du-chat-message-image-link"
        aria-label={`Enlarge ${alt}`}
        onClick={() => setOpen(true)}
      >
        <AuthenticatedFocalImage
          src={src}
          alt={alt}
          fit="contain"
          className="du-chat-message-image"
          fallback={<span className="du-text-soft">Loading image...</span>}
        />
      </button>
      {open && createPortal(
        <div
          ref={dialogRef}
          className="du-chat-photo-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Chat photo viewer"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <GalleryPhotoViewer
            photos={[{ id: 1, imageUrl: src }]}
            activePhotoId={1}
            fallbackCaption="Chat photo"
            getAlt={() => alt}
            onActivePhotoChange={() => {}}
            onBack={() => setOpen(false)}
            fit="contain"
          />
        </div>,
        document.body,
      )}
    </>
  );
}

export default ChatAttachmentImage;
