type ChatBubbleIconProps = {
  className?: string;
};

function ChatBubbleIcon({ className }: ChatBubbleIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5.2 5.1h13.6c1.2 0 2.2 1 2.2 2.2v7.5c0 1.2-1 2.2-2.2 2.2h-7.3l-4.8 3.1.8-3.1H5.2A2.2 2.2 0 0 1 3 14.8V7.3c0-1.2 1-2.2 2.2-2.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 9.2h9M7.5 12.9h6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default ChatBubbleIcon;
