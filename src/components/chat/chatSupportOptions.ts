import type { ChatSupportTopic } from "../../types/chat";
import type { DesertLiveFilterOption } from "../desert-live/DesertLiveMenuFilter";

export const supportTopicOptions: readonly DesertLiveFilterOption<ChatSupportTopic>[] = [
  { value: "GENERAL", icon: "✉", label: "General question" },
  { value: "TECHNICAL_PROBLEM", icon: "⚙", label: "Something doesn't work" },
  { value: "IMPROVEMENT_IDEA", icon: "✦", label: "Improve the site" },
  { value: "MARKETPLACE", icon: "⚑", label: "Marketplace complaint" },
  { value: "DESERT_LIVE", icon: "☀", label: "Desert Live event" },
  { value: "ACCOUNT_ACCESS", icon: "♧", label: "Account and access" },
];

export function supportTopicLabel(topic: ChatSupportTopic | null): string {
  return supportTopicOptions.find((option) => option.value === topic)?.label ?? "General question";
}
