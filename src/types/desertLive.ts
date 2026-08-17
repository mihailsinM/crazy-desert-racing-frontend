export type DesertLiveCategory =
  | "RACE"
  | "FESTIVAL"
  | "MARKETPLACE"
  | "COMMUNITY"
  | "NEWS";

export type DesertLiveSource = "SYSTEM" | "USER";

export type DesertLiveModerationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type DesertLiveItem = {
  id: number;
  category: DesertLiveCategory;
  source: DesertLiveSource;
  moderationStatus: DesertLiveModerationStatus;
  title: string;
  description: string;
  targetUrl: string | null;
  authorId: number;
  authorName: string;
  authorAvatarUrl: string | null;
  moderationNote: string | null;
  activeFrom: string | null;
  activeUntil: string | null;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
};

export type DesertLivePage = {
  items: DesertLiveItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type DesertLiveWriteRequest = {
  category: DesertLiveCategory;
  title: string;
  description: string;
  targetUrl: string | null;
  activeFrom: string | null;
  activeUntil: string | null;
};

export type DesertLivePageQuery = {
  category?: DesertLiveCategory;
  status?: DesertLiveModerationStatus;
  search?: string;
  page?: number;
  size?: number;
};
