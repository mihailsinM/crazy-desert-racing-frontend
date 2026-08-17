import type {
  DesertLiveCategory,
  DesertLiveModerationStatus,
} from "../../types/desertLive";

export type DesertLiveCategoryFilter = "ALL" | DesertLiveCategory;
export type DesertLiveStatusFilter = "ALL" | DesertLiveModerationStatus;

export const desertLiveCategoryOptions = [
  { value: "ALL", label: "All updates", icon: "✨" },
  { value: "RACE", label: "Races", icon: "🏁" },
  { value: "FESTIVAL", label: "Festivals", icon: "🎵" },
  { value: "MARKETPLACE", label: "Marketplace", icon: "🛒" },
  { value: "COMMUNITY", label: "Community", icon: "👥" },
  { value: "NEWS", label: "News", icon: "🔥" },
] satisfies Array<{
  value: DesertLiveCategoryFilter;
  label: string;
  icon: string;
}>;

export const desertLiveStatusOptions = [
  { value: "ALL", label: "All statuses", icon: "◎" },
  { value: "PENDING", label: "Pending review", icon: "◷" },
  { value: "APPROVED", label: "Approved", icon: "✓" },
  { value: "REJECTED", label: "Rejected", icon: "×" },
] satisfies Array<{
  value: DesertLiveStatusFilter;
  label: string;
  icon: string;
}>;

export const desertLiveCategoryIcons: Record<DesertLiveCategory, string> = {
  RACE: "🏁",
  FESTIVAL: "🎵",
  MARKETPLACE: "🛒",
  COMMUNITY: "👥",
  NEWS: "🔥",
};

export const desertLiveCategoryLabels: Record<DesertLiveCategory, string> = {
  RACE: "Race",
  FESTIVAL: "Festival",
  MARKETPLACE: "Marketplace",
  COMMUNITY: "Community",
  NEWS: "News",
};
