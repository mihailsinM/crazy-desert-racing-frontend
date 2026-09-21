import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import raceBackground from "../assets/race.png";
import ChatAttachmentImage from "../components/chat/ChatAttachmentImage";
import DesertLiveMenuFilter from "../components/desert-live/DesertLiveMenuFilter";
import type { DesertLiveFilterOption } from "../components/desert-live/DesertLiveMenuFilter";
import { supportTopicLabel } from "../components/chat/chatSupportOptions";
import DetailsCard from "../components/details/DetailsCard";
import CatalogPage from "../components/lists/CatalogPage";
import { getChatConversations, getOpenChatReports, reviewChatReport } from "../services/chatService";
import { getOpenPhotoReports, hideUserPhotoAsAdmin, reviewPhotoReport } from "../services/userPhotoService";
import type { ChatConversation, ChatReport } from "../types/chat";
import type { UserPhotoReport } from "../types/driver";

type InboxFilter = "ALL" | "ADMINISTRATION" | "TECHNICAL" | "MARKETPLACE" | "DESERT_LIVE" | "SPAM" | "SAFETY" | "PHOTOS";
type InboxItem =
  | { kind: "support"; id: string; date: string; conversation: ChatConversation }
  | { kind: "message"; id: string; date: string; report: ChatReport }
  | { kind: "photo"; id: string; date: string; report: UserPhotoReport };

const filters: readonly DesertLiveFilterOption<InboxFilter>[] = [
  { value: "ALL", label: "View all", icon: "◈" },
  { value: "ADMINISTRATION", label: "Administration chats", icon: "✉" },
  { value: "TECHNICAL", label: "Bugs and ideas", icon: "⚙" },
  { value: "MARKETPLACE", label: "Marketplace complaints", icon: "⚑" },
  { value: "DESERT_LIVE", label: "Desert Live", icon: "☀" },
  { value: "SPAM", label: "Spam", icon: "⊘" },
  { value: "SAFETY", label: "Member safety", icon: "♢" },
  { value: "PHOTOS", label: "Photo reports", icon: "▧" },
];

function matches(item: InboxItem, filter: InboxFilter): boolean {
  if (filter === "ALL") return true;
  if (item.kind === "photo") return filter === "PHOTOS" || filter === "SAFETY";
  if (item.kind === "support") {
    const topic = item.conversation.supportTopic;
    return filter === "ADMINISTRATION"
      || (filter === "TECHNICAL" && (topic === "TECHNICAL_PROBLEM" || topic === "IMPROVEMENT_IDEA"))
      || (filter === "MARKETPLACE" && topic === "MARKETPLACE")
      || (filter === "DESERT_LIVE" && topic === "DESERT_LIVE");
  }
  const reason = item.report.reason;
  return (filter === "SPAM" && reason === "SPAM")
    || (filter === "MARKETPLACE" && reason === "MARKETPLACE_SCAM")
    || (filter === "SAFETY" && reason !== "SPAM" && reason !== "MARKETPLACE_SCAM");
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminInboxPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messageReports, setMessageReports] = useState<ChatReport[]>([]);
  const [photoReports, setPhotoReports] = useState<UserPhotoReport[]>([]);
  const [filter, setFilter] = useState<InboxFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadInbox() {
    const [chats, messages, photos] = await Promise.all([
      getChatConversations(), getOpenChatReports(), getOpenPhotoReports(),
    ]);
    setConversations(chats.filter((chat) => chat.type === "SUPPORT"));
    setMessageReports(messages);
    setPhotoReports(photos);
  }

  async function refreshInbox() {
    setRefreshing(true);
    setError("");
    try {
      await loadInbox();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to refresh inbox");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([getChatConversations(), getOpenChatReports(), getOpenPhotoReports()])
      .then(([chats, messages, photos]) => {
        if (!active) return;
        setConversations(chats.filter((chat) => chat.type === "SUPPORT"));
        setMessageReports(messages);
        setPhotoReports(photos);
      })
      .catch((caughtError: unknown) => {
        if (active) setError(caughtError instanceof Error ? caughtError.message : "Failed to load the admin inbox");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const items = useMemo(() => {
    const all: InboxItem[] = [
      ...conversations.map((conversation): InboxItem => ({ kind: "support", id: `support-${conversation.id}`, date: conversation.lastMessageAt, conversation })),
      ...messageReports.map((report): InboxItem => ({ kind: "message", id: `message-${report.id}`, date: report.createdAt, report })),
      ...photoReports.map((report): InboxItem => ({ kind: "photo", id: `photo-${report.id}`, date: report.createdAt, report })),
    ];
    return all.filter((item) => matches(item, filter))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [conversations, messageReports, photoReports, filter]);

  async function handleMessageReport(report: ChatReport, status: "RESOLVED" | "DISMISSED") {
    setBusyId(`message-${report.id}`);
    setError("");
    try {
      await reviewChatReport(report.id, status);
      await loadInbox();
      setNotice(status === "RESOLVED" ? "Message report resolved." : "Message report dismissed.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not review message report");
    } finally { setBusyId(""); }
  }

  async function handlePhotoReport(report: UserPhotoReport, action: "DISMISSED" | "HIDE") {
    setBusyId(`photo-${report.id}`);
    setError("");
    try {
      if (action === "HIDE") await hideUserPhotoAsAdmin(report.photoId);
      await reviewPhotoReport(report.id, action === "HIDE" ? "RESOLVED" : "DISMISSED");
      await loadInbox();
      setNotice(action === "HIDE" ? "Photo hidden and report resolved." : "Photo report dismissed.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not review photo report");
    } finally { setBusyId(""); }
  }

  return <CatalogPage>
    <DetailsCard image={{ src: raceBackground, alt: "Desert road" }} eyebrow="Admin Panel" title="Admin Inbox" overlayClassName="du-scroll" topAligned
      status={<button className="du-button du-button-small du-button-rect" type="button" onClick={() => navigate(-1)}>← Back</button>}>
      <div className="du-admin-inbox-toolbar">
        <p className="du-text-soft">Shared by all administrators. Private conversations are visible only to participants; reports show the selected message.</p>
        <DesertLiveMenuFilter buttonLabel="Filter" menuLabel="Show inbox" value={filter} options={filters} onChange={setFilter} />
        <button className="du-button du-button-small du-button-rect" type="button" disabled={refreshing} onClick={() => void refreshInbox()}>{refreshing ? "Refreshing..." : "Refresh"}</button>
      </div>
      {error && <p className="du-error" role="alert">{error}</p>}
      {notice && <p className="du-image-optimization-message">{notice}</p>}
      {loading ? <p className="du-text-soft">Loading inbox...</p> :
        <div className="du-admin-inbox-list">
          {items.length === 0 && <p className="du-row-panel">No items in this category.</p>}
          {items.map((item) => item.kind === "support" ? <article key={item.id} className="du-row-panel du-admin-inbox-row">
            <div className="du-row-main">
              <strong className="du-row-title">Administration · {item.conversation.title}</strong>
              <span className="du-row-subtitle">{supportTopicLabel(item.conversation.supportTopic)} · {formatDate(item.date)}</span>
              <span className="du-row-subtitle">{item.conversation.lastMessagePreview}</span>
            </div>
            <div className="du-row-actions"><button className="du-button du-button-small" type="button" onClick={() => navigate(`/chats/${item.conversation.id}`)}>Open Chat</button></div>
          </article> : item.kind === "message" ? <article key={item.id} className="du-row-panel du-admin-inbox-row">
            <div className="du-row-main">
              <strong className="du-row-title">Message report · {item.report.reason.replaceAll("_", " ")}</strong>
              <span className="du-row-subtitle">{item.report.reporterName} reported {item.report.reportedUserName} · {formatDate(item.date)}</span>
              <blockquote>{item.report.reportedMessage || "Image attachment"}</blockquote>
              {item.report.imageUrl && <ChatAttachmentImage src={item.report.imageUrl} alt="Reported chat image" />}
              <span className="du-row-subtitle">{item.report.details || "No additional details"}</span>
            </div>
            <div className="du-row-actions">
              <button className="du-button du-button-small" type="button" disabled={busyId === item.id} onClick={() => void handleMessageReport(item.report, "DISMISSED")}>Dismiss</button>
              <button className="du-button du-button-small du-button-primary" type="button" disabled={busyId === item.id} onClick={() => void handleMessageReport(item.report, "RESOLVED")}>Resolve</button>
            </div>
          </article> : <article key={item.id} className="du-row-panel du-admin-inbox-row">
            <div className="du-row-main">
              <strong className="du-row-title">Photo report · {item.report.reason}</strong>
              <span className="du-row-subtitle">Photo #{item.report.photoId} by {item.report.photoOwnerName} · reported by {item.report.reporterName}</span>
              <span className="du-row-subtitle">{item.report.details || "No additional details"} · {formatDate(item.date)}</span>
            </div>
            <div className="du-row-actions">
              <button className="du-button du-button-small" type="button" onClick={() => navigate(`/drivers/${item.report.photoOwnerId}`)}>Profile</button>
              <button className="du-button du-button-small" type="button" disabled={busyId === item.id} onClick={() => void handlePhotoReport(item.report, "DISMISSED")}>Dismiss</button>
              <button className="du-button du-button-small du-button-primary" type="button" disabled={busyId === item.id} onClick={() => void handlePhotoReport(item.report, "HIDE")}>Hide</button>
            </div>
          </article>)}
        </div>}
    </DetailsCard>
  </CatalogPage>;
}
