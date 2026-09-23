import type { ImageFramingProfiles } from "../utils/imageFocus";

export type ChatConversationType = "DIRECT" | "SUPPORT";
export type ChatSupportTopic =
  | "GENERAL"
  | "TECHNICAL_PROBLEM"
  | "IMPROVEMENT_IDEA"
  | "MARKETPLACE"
  | "DESERT_LIVE"
  | "ACCOUNT_ACCESS";
export type ChatReportReason =
  | "HARASSMENT"
  | "SPAM"
  | "MARKETPLACE_SCAM"
  | "INAPPROPRIATE"
  | "OTHER";
export type ChatReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export type ChatConversation = {
  id: number;
  type: ChatConversationType;
  supportTopic: ChatSupportTopic | null;
  title: string;
  otherUserId: number | null;
  avatarUrl: string | null;
  imageFraming: ImageFramingProfiles | null;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  blockedByMe: boolean;
  blockedByOther: boolean;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  mine: boolean;
  body: string | null;
  imageUrl: string | null;
  imageOriginalName: string | null;
  createdAt: string;
};

export type ChatUnread = {
  unreadCount: number;
};

export type ChatReport = {
  id: number;
  messageId: number;
  conversationId: number;
  reporterId: number;
  reporterName: string;
  reportedUserId: number;
  reportedUserName: string;
  reason: ChatReportReason;
  details: string | null;
  reportedMessage: string | null;
  imageUrl: string | null;
  status: ChatReportStatus;
  createdAt: string;
  reviewedAt: string | null;
};
