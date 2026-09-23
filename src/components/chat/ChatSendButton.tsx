type ChatSendButtonProps = {
  disabled: boolean;
  sending: boolean;
  flashed: boolean;
};

function ChatSendButton({
  disabled,
  sending,
  flashed,
}: ChatSendButtonProps) {
  const classes = [
    "du-chat-send-button",
    flashed ? "du-chat-send-button-flashed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="submit"
      className={classes}
      disabled={disabled}
      aria-label={sending ? "Sending message" : "Send message"}
      title={sending ? "Sending..." : "Send"}
    >
      <span className="du-chat-send-triangle" aria-hidden="true" />
    </button>
  );
}

export default ChatSendButton;
