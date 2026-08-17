import type {
  DesertLiveCategory,
  DesertLiveModerationStatus,
} from "../../types/desertLive";

export type DesertLiveCategoryFilter = "ALL" | DesertLiveCategory;
export type DesertLiveStatusFilter = "ALL" | DesertLiveModerationStatus;

export const desertLiveCategorySelectOptions = [
  { value: "RACE", label: "Race", icon: "🏁" },
  { value: "FESTIVAL", label: "Festival", icon: "🎵" },
  { value: "MARKETPLACE", label: "Marketplace", icon: "🛒" },
  { value: "COMMUNITY", label: "Community", icon: "👥" },
  { value: "NEWS", label: "News", icon: "🔥" },
] satisfies Array<{
  value: DesertLiveCategory;
  label: string;
  icon: string;
}>;

export const desertLiveCategoryOptions = [
  { value: "ALL", label: "All updates", icon: "✨" },
  ...desertLiveCategorySelectOptions.map((option) => ({
    ...option,
    label: option.value === "RACE" || option.value === "FESTIVAL"
      ? `${option.label}s`
      : option.label,
  })),
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

export const desertLiveCategoryIcons = Object.fromEntries(
  desertLiveCategorySelectOptions.map((option) => [option.value, option.icon]),
) as Record<DesertLiveCategory, string>;

export const desertLiveCategoryLabels = Object.fromEntries(
  desertLiveCategorySelectOptions.map((option) => [option.value, option.label]),
) as Record<DesertLiveCategory, string>;
