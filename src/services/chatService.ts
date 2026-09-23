import API_BASE_URL from "./api";
import { authenticatedFetch } from "./authService";
import type {
  ChatConversation,
  ChatMessage,
  ChatReport,
  ChatReportReason,
  ChatReportStatus,
  ChatSupportTopic,
  ChatUnread,
} from "../types/chat";

export const CHAT_UNREAD_CHANGED_EVENT = "chat-unread-changed";

function notifyUnreadChanged(): void {
  window.dispatchEvent(new Event(CHAT_UNREAD_CHANGED_EVENT));
}

async function readJson<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    const message = body
      ? Object.values(body).find(
        (value): value is string => typeof value === "string",
      )
      : null;

    throw new Error(message ?? fallbackMessage);
  }

  return response.json() as Promise<T>;
}

async function requireOk(
  response: Response,
  fallbackMessage: string,
): Promise<void> {
  if (!response.ok) {
    await readJson(response, fallbackMessage);
  }
}

export async function getChatConversations(): Promise<ChatConversation[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/chat/conversations`,
  );
  return readJson(response, "Failed to load chats");
}

export async function openDirectChat(
  recipientId: number,
): Promise<ChatConversation> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/chat/direct/${recipientId}`,
    { method: "POST" },
  );
  return readJson(response, "Failed to open chat");
}

export async function openSupportChat(): Promise<ChatConversation> {
  const response = await authenticatedFetch(`${API_BASE_URL}/chat/support`, {
    method: "POST",
  });
  return readJson(response, "Failed to open the Administration chat");
}

export async function updateSupportChatTopic(topic: ChatSupportTopic): Promise<ChatConversation> {
  const response = await authenticatedFetch(`${API_BASE_URL}/chat/support/topic`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  return readJson(response, "Failed to set a topic for Administration");
}

export async function getChatMessages(
  conversationId: number,
  afterId?: number,
): Promise<ChatMessage[]> {
  const query = afterId === undefined ? "" : `?afterId=${afterId}`;
  const response = await authenticatedFetch(
    `${API_BASE_URL}/chat/conversations/${conversationId}/messages${query}`,
  );
  return readJson(response, "Failed to load messages");
}

export async function sendChatMessage(
  conversationId: number,
  body: string,
  image: File | null,
): Promise<ChatMessage> {
  const formData = new FormData();

  if (body.trim()) {
    formData.append("body", body.trim());
  }

  if (image) {
    formData.append("image", image);
  }

  const response = await authenticatedFetch(
    `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: formData,
    },
  );
  const message = await readJson<ChatMessage>(
    response,
    "Failed to send message",
  );
  notifyUnreadChanged();
  return message;
}

export async function markChatRead(conversationId: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/chat/conversations/${conversationId}/read`,
    { method: "POST" },
  );
  await requireOk(response, "Failed to mark chat as read");
  notifyUnreadChanged();
}

export async function getChatUnreadCount(): Promise<number> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/chat/unread-count`,
  );
  const result = await readJson<ChatUnread>(
    response,
    "Failed to load unread messages",
  );
  return result.unreadCount;
}

export async function blockChatUser(userId: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/chat/users/${userId}/block`,
    { method: "POST" },
  );
  await requireOk(response, "Failed to block user");
}

export async function unblockChatUser(userId: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/chat/users/${userId}/block`,
    { method: "DELETE" },
  );
  await requireOk(response, "Failed to unblock user");
}

export async function reportChatMessage(
  messageId: number,
  reason: ChatReportReason,
  details: string | null,
): Promise<ChatReport> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/chat/messages/${messageId}/reports`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, details }),
    },
  );
  return readJson(response, "Failed to report message");
}

export async function getOpenChatReports(): Promise<ChatReport[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/chat/admin/reports`,
  );
  return readJson(response, "Failed to load message reports");
}

export async function reviewChatReport(
  reportId: number,
  status: Exclude<ChatReportStatus, "OPEN">,
): Promise<ChatReport> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/chat/admin/reports/${reportId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  return readJson(response, "Failed to review message report");
}
