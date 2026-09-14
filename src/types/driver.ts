import type { RaceStatus } from "./race";
import type { MembershipTier, UserRole } from "./user";
import type { ImageFramingProfiles } from "../utils/imageFocus";

export type UserPhotoVisibility = "PRIVATE" | "MEMBERS_ONLY" | "PUBLIC";
export type UserPhotoReportReason =
  | "PRIVACY"
  | "COPYRIGHT"
  | "INAPPROPRIATE"
  | "OTHER";
export type UserPhotoReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export type DriverSummary = {
  id: number;
  name: string;
  avatarUrl: string | null;
  imageFraming: ImageFramingProfiles | null;
  role: UserRole;
  verifiedDriver: boolean;
  membershipTier: MembershipTier;
  carCount: number;
  raceCount: number;
  photoCount: number;
};

export type DriverCar = {
  id: number;
  name: string;
  brand: string;
  horsePower: number;
  imageUrl: string | null;
  imageFraming: ImageFramingProfiles | null;
};

export type DriverRace = {
  registrationId: number;
  raceId: number;
  raceName: string;
  location: string;
  startDate: string;
  status: RaceStatus;
  imageUrl: string | null;
  imageFraming: ImageFramingProfiles | null;
  raceCarId: number;
  raceCarName: string;
};

export type UserPhoto = {
  id: number;
  imageUrl: string;
  caption: string | null;
  visibility: UserPhotoVisibility;
  createdAt: string;
  profilePhoto: boolean;
  imageFraming: ImageFramingProfiles | null;
};

export type DriverProfile = {
  id: number;
  name: string;
  avatarUrl: string | null;
  imageFraming: ImageFramingProfiles | null;
  role: UserRole;
  verifiedDriver: boolean;
  membershipTier: MembershipTier;
  bio: string | null;
  location: string | null;
  carsVisible: boolean;
  raceHistoryVisible: boolean;
  photosVisible: boolean;
  cars: DriverCar[];
  races: DriverRace[];
  photos: UserPhoto[];
};

export type PublicProfileUpdateRequest = {
  bio: string | null;
  location: string | null;
  showCars: boolean;
  showRaceHistory: boolean;
  showPhotos: boolean;
};

export type UserPhotoUpdateRequest = {
  caption: string | null;
  visibility: UserPhotoVisibility;
};

export type UserPhotoUploadRequest = UserPhotoUpdateRequest & {
  file: File;
  rightsConfirmed: boolean;
  imageFraming: ImageFramingProfiles;
};

export type UserPhotoReport = {
  id: number;
  photoId: number;
  photoOwnerId: number;
  photoOwnerName: string;
  reporterId: number;
  reporterName: string;
  reason: UserPhotoReportReason;
  details: string | null;
  status: UserPhotoReportStatus;
  createdAt: string;
  reviewedAt: string | null;
};
