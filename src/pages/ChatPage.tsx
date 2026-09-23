import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import raceBackground from "../assets/race.png";
import ChatAttachmentImage from "../components/chat/ChatAttachmentImage";
import ChatBubbleIcon from "../components/chat/ChatBubbleIcon";
import ChatComposerMenu from "../components/chat/ChatComposerMenu";
import type { ChatSticker } from "../components/chat/chatStickers";
import { supportTopicLabel, supportTopicOptions } from "../components/chat/chatSupportOptions";
import ChatSafetyMenu from "../components/chat/ChatSafetyMenu";
import ChatSendButton from "../components/chat/ChatSendButton";
import DetailsCard from "../components/details/DetailsCard";
import DesertLiveMenuFilter, {
  type DesertLiveFilterOption,
} from "../components/desert-live/DesertLiveMenuFilter";
import UserAvatar from "../components/users/UserAvatar";
import { useAuth } from "../context/authContext";
import {
  blockChatUser,
  getChatConversations,
  getChatMessages,
  markChatRead,
  openSupportChat,
  reportChatMessage,
  sendChatMessage,
  unblockChatUser,
  updateSupportChatTopic,
} from "../services/chatService";
import type {
  ChatConversation,
  ChatMessage,
  ChatReportReason,
  ChatSupportTopic,
} from "../types/chat";
import { hasAdminAccess } from "../utils/userRole";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const REPORT_REASON_OPTIONS: readonly DesertLiveFilterOption<ChatReportReason>[] = [
  {
    value: "INAPPROPRIATE",
    label: "Inappropriate communication",
    icon: "!",
  },
  { value: "HARASSMENT", label: "Harassment or insults", icon: "⚠" },
  { value: "SPAM", label: "Spam or advertising", icon: "⊘" },
  { value: "MARKETPLACE_SCAM", label: "Misleading marketplace offer", icon: "⚑" },
  { value: "OTHER", label: "Other concern", icon: "…" },
];

type ChatReportMode = "MESSAGE" | "MEMBER";

function formatChatTime(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resizeComposer(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  const lineHeight = Number.parseFloat(
    window.getComputedStyle(textarea).lineHeight,
  ) || 22;
  const maximumHeight = lineHeight * 4 + 24;
  const nextHeight = Math.min(textarea.scrollHeight, maximumHeight);
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY =
    textarea.scrollHeight > maximumHeight ? "auto" : "hidden";
}

function ChatPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { currentUser } = useAuth();
  const activeConversationId = params.conversationId
    ? Number(params.conversationId)
    : null;
  const isAdmin = hasAdminAccess(currentUser?.role);

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<ChatSticker | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadedConversationId, setLoadedConversationId] =
    useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [sendFlashed, setSendFlashed] = useState(false);
  const [safetyBusy, setSafetyBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reportingMessage, setReportingMessage] =
    useState<ChatMessage | null>(null);
  const [reportMode, setReportMode] =
    useState<ChatReportMode>("MESSAGE");
  const [reportReason, setReportReason] =
    useState<ChatReportReason>("INAPPROPRIATE");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const latestMessageIdRef = useRef(0);
  const sendFlashTimerRef = useRef<number | null>(null);

  const activeConversation = useMemo(
    () => conversations.find(
      (conversation) => conversation.id === activeConversationId,
    ) ?? null,
    [activeConversationId, conversations],
  );
  const loadingMessages = activeConversationId !== null
    && activeConversationId !== loadedConversationId;
  const visibleMessages = activeConversationId === loadedConversationId
    ? messages
    : [];
  const supportConversation = isAdmin
    ? null
    : conversations.find((conversation) =>
      conversation.type === "SUPPORT"
    ) ?? null;
  const listedConversations = supportConversation
    ? conversations.filter(
      (conversation) => conversation.id !== supportConversation.id,
    )
    : conversations;

  const loadConversations = useCallback(async () => {
    const loadedConversations = await getChatConversations();
    setConversations(loadedConversations);
    return loadedConversations;
  }, []);

  useEffect(() => {
    let active = true;

    void getChatConversations()
      .then((loadedConversations) => {
        if (active) {
          setConversations(loadedConversations);
        }
      })
      .catch((caughtError) => {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load chats",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoadingChats(false);
        }
      });

    return () => {
      active = false;
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!activeConversationId || !Number.isFinite(activeConversationId)) {
      latestMessageIdRef.current = 0;
      return;
    }

    const conversationId = activeConversationId;
    let active = true;
    let polling = false;
    latestMessageIdRef.current = 0;

    void getChatMessages(conversationId)
      .then(async (loadedMessages) => {
        if (!active) {
          return;
        }

        setMessages(loadedMessages);
        setLoadedConversationId(conversationId);
        setError("");
        latestMessageIdRef.current = loadedMessages.at(-1)?.id ?? 0;
        await markChatRead(conversationId);
        await loadConversations();
      })
      .catch((caughtError) => {
        if (active) {
          setLoadedConversationId(conversationId);
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load messages",
          );
        }
      });

    const pollTimer = window.setInterval(() => {
      if (polling || !active) {
        return;
      }

      polling = true;
      const afterId = latestMessageIdRef.current;

      void getChatMessages(conversationId, afterId)
        .then(async (newMessages) => {
          if (!active || newMessages.length === 0) {
            return;
          }

          setMessages((currentMessages) => {
            const knownIds = new Set(
              currentMessages.map((message) => message.id),
            );
            return [
              ...currentMessages,
              ...newMessages.filter((message) => !knownIds.has(message.id)),
            ];
          });
          latestMessageIdRef.current = newMessages.at(-1)!.id;
          await markChatRead(conversationId);
          await loadConversations();
        })
        .catch(() => {
          // A temporary polling failure should not replace the open chat.
        })
        .finally(() => {
          polling = false;
        });
    }, 3000);

    return () => {
      active = false;
      window.clearInterval(pollTimer);
    };
  }, [activeConversationId, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => () => {
    if (sendFlashTimerRef.current !== null) {
      window.clearTimeout(sendFlashTimerRef.current);
    }
  }, []);

  async function handleOpenSupport() {
    setError("");

    if (supportConversation) {
      navigate(`/chats/${supportConversation.id}`);
      return;
    }

    try {
      const conversation = await openSupportChat();
      await loadConversations();
      navigate(`/chats/${conversation.id}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to open the Administration chat",
      );
    }
  }

  async function handleSupportTopic(topic: ChatSupportTopic) {
    try {
      const conversation = await updateSupportChatTopic(topic);
      await loadConversations();
      if (!activeConversationId) navigate(`/chats/${conversation.id}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update topic");
    }
  }

  function handleDraftChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDraft(event.currentTarget.value);
    resizeComposer(event.currentTarget);
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.currentTarget.files?.[0] ?? null;

    if (!selectedFile) {
      setAttachment(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(selectedFile.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      event.currentTarget.value = "";
      return;
    }

    if (selectedFile.size > MAX_IMAGE_SIZE) {
      setError("Chat images must be 2 MB or smaller.");
      event.currentTarget.value = "";
      return;
    }

    setError("");
    setSelectedSticker(null);
    setAttachment(selectedFile);
  }

  async function handleSticker(sticker: ChatSticker) {
    try {
      const response = await fetch(sticker.image);
      if (!response.ok) throw new Error("Could not load sticker");
      const bytes = await response.blob();
      setAttachment(new File([bytes], `crazy-desert-${sticker.filename}.png`, { type: "image/png" }));
      setSelectedSticker(sticker);
      setError("");
    } catch {
      setError("Could not attach the sticker. Try again.");
    }
  }

  function clearAttachment() {
    setAttachment(null);
    setSelectedSticker(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeConversation || (!draft.trim() && !attachment) || sending) {
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    try {
      const sentMessage = await sendChatMessage(
        activeConversation.id,
        draft,
        attachment,
      );
      setMessages((currentMessages) => [
        ...currentMessages.filter((message) => message.id !== sentMessage.id),
        sentMessage,
      ]);
      latestMessageIdRef.current = sentMessage.id;
      setDraft("");
      clearAttachment();

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.overflowY = "hidden";
      }

      setSendFlashed(true);

      if (sendFlashTimerRef.current !== null) {
        window.clearTimeout(sendFlashTimerRef.current);
      }

      sendFlashTimerRef.current = window.setTimeout(() => {
        setSendFlashed(false);
      }, 1000);
      await loadConversations();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to send message",
      );
    } finally {
      setSending(false);
    }
  }

  async function handleBlockChange() {
    if (!activeConversation?.otherUserId) {
      return;
    }

    setError("");
    setNotice("");
    setSafetyBusy(true);

    try {
      if (activeConversation.blockedByMe) {
        await unblockChatUser(activeConversation.otherUserId);
        setNotice("This chat is unblocked.");
      } else {
        await blockChatUser(activeConversation.otherUserId);
        setNotice("User blocked. The conversation history remains visible.");
      }

      await loadConversations();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to change block status",
      );
    } finally {
      setSafetyBusy(false);
    }
  }

  function openMessageReport(message: ChatMessage) {
    setReportMode("MESSAGE");
    setReportReason("INAPPROPRIATE");
    setReportDetails("");
    setReportingMessage(message);
  }

  function openMemberReport() {
    const latestIncomingMessage = [...visibleMessages]
      .reverse()
      .find((message) => !message.mine);

    if (!latestIncomingMessage) {
      setError(
        "There is no incoming message to include with an administrator report.",
      );
      return;
    }

    setReportMode("MEMBER");
    setReportReason("INAPPROPRIATE");
    setReportDetails("");
    setReportingMessage(latestIncomingMessage);
  }

  function closeReportDialog() {
    setReportingMessage(null);
    setReportMode("MESSAGE");
    setReportReason("INAPPROPRIATE");
    setReportDetails("");
  }

  async function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reportingMessage || reporting) {
      return;
    }

    setReporting(true);
    setError("");

    try {
      await reportChatMessage(
        reportingMessage.id,
        reportReason,
        reportDetails.trim() || null,
      );
      closeReportDialog();
      setNotice(
        "Your report and one message were shared with the administrators. The rest of the conversation remains private.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to report message",
      );
    } finally {
      setReporting(false);
    }
  }

  const chatBlocked = Boolean(
    activeConversation?.blockedByMe || activeConversation?.blockedByOther,
  );

  return (
    <section className="du-page du-viewport-page du-chat-page">
      <DetailsCard
        image={{ src: raceBackground, alt: "Desert racing road" }}
        eyebrow="Crazy Desert Community"
        title="My Chats"
        className="du-chat-card"
        overlayClassName="du-chat-card-overlay"
        topAligned
        status={(
          <div className="du-chat-page-actions">
            <NavLink
              to="/privacy/chat"
              className="du-button du-button-small du-button-rect"
            >
              Privacy & Safety
            </NavLink>
            <button
              type="button"
              className="du-button du-button-small du-button-rect du-button-back"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
        )}
      >
          {error && <p className="du-error du-chat-global-message">{error}</p>}
          {notice && (
            <p className="du-image-optimization-message du-chat-global-message">
              {notice}
            </p>
          )}

          <div
            className={`du-chat-layout${activeConversationId ? " du-chat-layout-active" : ""}`}
          >
            <aside className="du-chat-sidebar" aria-label="Conversations">
              {!isAdmin && (
                <button
                  type="button"
                  className={`du-chat-admin-entry${
                    supportConversation?.id === activeConversationId
                      ? " du-chat-conversation-row-active"
                      : ""
                  }`}
                  onClick={handleOpenSupport}
                >
                  <span className="du-chat-admin-avatar" aria-hidden="true">
                    CD
                  </span>
                  <span className="du-chat-list-copy">
                    <strong>Administration</strong>
                    <span>
                      {supportConversation?.lastMessagePreview
                        ?? "Problems, ideas and club support"}
                    </span>
                  </span>
                  {supportConversation && supportConversation.unreadCount > 0 && (
                    <span className="du-chat-unread-count">
                      {supportConversation.unreadCount > 99
                        ? "99+"
                        : supportConversation.unreadCount}
                    </span>
                  )}
                  <ChatBubbleIcon className="du-chat-entry-icon" />
                </button>
              )}

              <div className="du-chat-conversation-list du-soft-scroll">
                {loadingChats ? (
                  <p className="du-text-soft">Loading chats...</p>
                ) : listedConversations.length === 0 ? (
                  <div className="du-chat-empty-list">
                    <ChatBubbleIcon className="du-chat-empty-icon" />
                    <p>No conversations yet.</p>
                    <NavLink to="/drivers" className="du-button du-button-small du-button-rect">
                      Find a driver
                    </NavLink>
                  </div>
                ) : (
                  listedConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      className={`du-chat-conversation-row${
                        conversation.id === activeConversationId
                          ? " du-chat-conversation-row-active"
                          : ""
                      }`}
                      onClick={() => navigate(`/chats/${conversation.id}`)}
                    >
                      {conversation.type === "SUPPORT"
                        && conversation.otherUserId === null ? (
                          <span className="du-chat-admin-avatar" aria-hidden="true">
                            CD
                          </span>
                        ) : (
                          <UserAvatar
                            name={conversation.title}
                            avatarUrl={conversation.avatarUrl}
                            imageFraming={conversation.imageFraming}
                            className="du-chat-list-avatar"
                          />
                        )}

                      <span className="du-chat-list-copy">
                        <span className="du-chat-list-heading">
                          <strong>{conversation.title}</strong>
                          {conversation.unreadCount > 0 && (
                            <span className="du-chat-unread-count">
                              {conversation.unreadCount > 99
                                ? "99+"
                                : conversation.unreadCount}
                            </span>
                          )}
                        </span>
                        <span>{conversation.lastMessagePreview}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className="du-chat-thread" aria-label="Open conversation">
              {!activeConversationId ? (
                <div className="du-chat-thread-empty">
                  <ChatBubbleIcon className="du-chat-thread-empty-icon" />
                  <h2>Choose a conversation</h2>
                  <p>
                    Personal chats are visible only to their participants.
                  </p>
                </div>
              ) : !activeConversation ? (
                <div className="du-chat-thread-empty">
                  <p>{loadingChats ? "Opening chat..." : "Chat not found."}</p>
                </div>
              ) : (
                <>
                  <header className="du-chat-thread-header">
                    <button
                      type="button"
                      className="du-chat-mobile-back"
                      onClick={() => navigate("/chats")}
                      aria-label="Back to chat list"
                    >
                      ←
                    </button>

                    {activeConversation.type === "SUPPORT"
                      && activeConversation.otherUserId === null ? (
                        <span className="du-chat-admin-avatar" aria-hidden="true">
                          CD
                        </span>
                      ) : (
                        <UserAvatar
                          name={activeConversation.title}
                          avatarUrl={activeConversation.avatarUrl}
                          imageFraming={activeConversation.imageFraming}
                          className="du-chat-header-avatar"
                        />
                      )}

                    <div className="du-chat-thread-heading">
                      <h2>{activeConversation.title}</h2>
                      <span>
                        {activeConversation.type === "SUPPORT"
                          ? isAdmin
                            ? `${supportTopicLabel(activeConversation.supportTopic)} · shared admin inbox`
                            : "Your conversation with the administration"
                          : "Private conversation"}
                      </span>
                    </div>

                    {activeConversation.type === "SUPPORT" && !isAdmin && (
                      <DesertLiveMenuFilter
                        buttonLabel="Topic"
                        menuLabel="How can we help?"
                        value={activeConversation.supportTopic ?? "GENERAL"}
                        options={supportTopicOptions}
                        onChange={handleSupportTopic}
                        variant="SELECT"
                      />
                    )}
                    {activeConversation.type === "DIRECT"
                      && activeConversation.otherUserId && (
                        <ChatSafetyMenu
                          blocked={activeConversation.blockedByMe}
                          busy={safetyBusy}
                          reportDisabled={!visibleMessages.some(
                            (message) => !message.mine,
                          )}
                          onReport={openMemberReport}
                          onToggleBlock={() => void handleBlockChange()}
                        />
                      )}
                  </header>

                  <div className="du-chat-messages du-soft-scroll">
                    {loadingMessages ? (
                      <p className="du-text-soft">Loading messages...</p>
                    ) : visibleMessages.length === 0 ? (
                      <div className="du-chat-first-message">
                        <p>Start the conversation.</p>
                        <span>
                          Be respectful. A report shares only the selected
                          message with administrators.
                        </span>
                      </div>
                    ) : (
                      visibleMessages.map((message) => (
                        <article
                          key={message.id}
                          className={`du-chat-message${
                            message.mine ? " du-chat-message-mine" : ""
                          }`}
                        >
                          {!message.mine && (
                            <span className="du-chat-message-sender">
                              {message.senderName}
                            </span>
                          )}

                          {message.imageUrl && (
                            <ChatAttachmentImage
                              src={message.imageUrl}
                              alt={message.imageOriginalName || "Chat attachment"}
                            />
                          )}

                          {message.body && (
                            <p className="du-chat-message-body">{message.body}</p>
                          )}

                          <footer className="du-chat-message-footer">
                            <time dateTime={message.createdAt}>
                              {formatChatTime(message.createdAt)}
                            </time>
                            {!message.mine && (
                              <button
                                type="button"
                                className="du-chat-report-button"
                                onClick={() => openMessageReport(message)}
                              >
                                Report
                              </button>
                            )}
                          </footer>
                        </article>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {chatBlocked ? (
                    <div className="du-chat-blocked-message">
                      {activeConversation.blockedByMe
                        ? "You blocked this user. Unblock the chat to continue."
                        : "This person is not accepting messages from you."}
                    </div>
                  ) : (
                    <form className="du-chat-composer" onSubmit={handleSend}>
                      {attachment && (
                        <div className="du-chat-selected-attachment">
                          <span>{selectedSticker ? <img className="du-chat-selected-sticker" src={selectedSticker.image} alt="" /> : "📷 "}{selectedSticker?.name ?? attachment.name}</span>
                          <button
                            type="button"
                            onClick={clearAttachment}
                            aria-label="Remove attachment"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <div className="du-chat-composer-row">
                        <ChatComposerMenu
                          inputRef={fileInputRef}
                          onPhoto={handleAttachmentChange}
                          onSticker={(sticker) => void handleSticker(sticker)}
                        />

                        <textarea
                          ref={textareaRef}
                          className="du-chat-input"
                          value={draft}
                          maxLength={2000}
                          rows={1}
                          placeholder="Write a message..."
                          aria-label="Message"
                          onChange={handleDraftChange}
                        />

                        <ChatSendButton
                          disabled={sending || (!draft.trim() && !attachment)}
                          sending={sending}
                          flashed={sendFlashed}
                        />
                      </div>
                    </form>
                  )}
                </>
              )}
            </section>
          </div>
      </DetailsCard>

      {reportingMessage && (
        <div className="du-chat-dialog-backdrop">
          <form
            className="du-panel du-chat-report-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-report-title"
            onSubmit={handleReportSubmit}
          >
            <h2 id="chat-report-title">
              {reportMode === "MEMBER"
                ? `Report ${activeConversation?.title ?? "member"}`
                : "Report selected message"}
            </h2>
            <p className="du-text-soft">
              {reportMode === "MEMBER"
                ? "Choose the problem below. The latest incoming message will be included as evidence; the rest of your conversation stays private."
                : "Administrators will receive this message only, not your full private conversation."}
            </p>

            <blockquote className="du-chat-report-preview">
              {reportingMessage.body || "Image attachment"}
            </blockquote>

            <div className="du-field du-chat-report-reason">
              <span className="du-field-label">Reason</span>
              <DesertLiveMenuFilter
                buttonLabel="Reason"
                menuLabel="Report reason"
                value={reportReason}
                options={REPORT_REASON_OPTIONS}
                variant="SELECT"
                disabled={reporting}
                onChange={setReportReason}
              />
            </div>

            <label className="du-field">
              <span className="du-field-label">Details (optional)</span>
              <textarea
                className="du-textarea"
                value={reportDetails}
                maxLength={500}
                onChange={(event) => setReportDetails(event.currentTarget.value)}
              />
            </label>

            <div className="du-chat-dialog-actions">
              <button
                type="button"
                className="du-button du-button-small du-button-rect"
                disabled={reporting}
                onClick={closeReportDialog}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="du-button du-button-danger du-button-small du-button-rect"
                disabled={reporting}
              >
                {reporting ? "Sending..." : "Send Report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default ChatPage;
