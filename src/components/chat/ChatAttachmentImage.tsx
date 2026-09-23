import AuthenticatedFocalImage from "../images/AuthenticatedFocalImage";

type ChatAttachmentImageProps = {
  src: string;
  alt: string;
};

function ChatAttachmentImage({ src, alt }: ChatAttachmentImageProps) {
  return (
    <div
      className="du-chat-message-image-link"
    >
      <AuthenticatedFocalImage
        src={src}
        alt={alt}
        fit="contain"
        className="du-chat-message-image"
        fallback={<span className="du-text-soft">Loading image...</span>}
      />
    </div>
  );
}

export default ChatAttachmentImage;
