import type { ImageFramingProfiles } from "../utils/imageFocus";

export type RaceStatus = "UPCOMING" | "POSTPONED" | "CANCELED" | "PAST";

export type Race = {
  id: number;
  name: string;
  location: string;
  startDate: string;
  maxParticipants: number;
  status: RaceStatus;
  adminMessage: string | null;
  imageUrl: string | null;
  imageFocusX: number;
  imageFocusY: number;
  imageCropPercent: number;
  imageFraming?: ImageFramingProfiles | null;
};

export type RaceImageFramingProfilesRequest = ImageFramingProfiles;
