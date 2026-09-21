import { useEffect, useRef, useState } from "react";

type ChatSafetyMenuProps = {
  blocked: boolean;
  busy: boolean;
  reportDisabled: boolean;
  onReport: () => void;
  onToggleBlock: () => void;
};

function ChatSafetyIcon() {
  return (
    <svg
      className="du-chat-safety-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m6 18 12-12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M9.2 13.4c.7-.8 1.7-1.2 2.8-1.2s2.1.4 2.8 1.2M12 8.2a2 2 0 0 1 2 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatSafetyMenu({
  blocked,
  busy,
  reportDisabled,
  onReport,
  onToggleBlock,
}: ChatSafetyMenuProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current
        && !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function chooseAction(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div
      ref={containerRef}
      className="du-dashboard-filter du-chat-safety-menu"
    >
      <button
        type="button"
        className="du-button du-button-small du-button-rect du-filter-trigger du-chat-safety-trigger"
        aria-label="Conversation safety options"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Safety options"
        disabled={busy}
        onClick={() => setOpen((current) => !current)}
      >
        <ChatSafetyIcon />
      </button>

      {open && (
        <div
          className="du-filter-menu du-chat-safety-options"
          role="menu"
          aria-label="Conversation safety"
        >
          <div className="du-filter-menu-header">
            <span>Conversation safety</span>
            <strong>Choose an action</strong>
          </div>

          <button
            type="button"
            role="menuitem"
            className="du-filter-option"
            disabled={reportDisabled}
            onClick={() => chooseAction(onReport)}
          >
            <span className="du-filter-option-icon" aria-hidden="true">
              ⚑
            </span>
            <span>Report to administrators</span>
            <span />
          </button>

          <button
            type="button"
            role="menuitem"
            className="du-filter-option"
            onClick={() => chooseAction(onToggleBlock)}
          >
            <span className="du-filter-option-icon" aria-hidden="true">
              ⊘
            </span>
            <span>{blocked ? "Unblock this member" : "Block this member"}</span>
            <span />
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatSafetyMenu;
