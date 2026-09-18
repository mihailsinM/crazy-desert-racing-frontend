import type { ImageFramingProfiles } from "../utils/imageFocus";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type MembershipTier = "STANDARD" | "SILVER" | "GOLD" | "PLATINUM";

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  age: number;
  licenseCategory: string;
  licenseVerified: boolean;
  role: UserRole;
  avatarUrl: string | null;
  imageFraming: ImageFramingProfiles | null;
  membershipTier: MembershipTier;
  membershipExpiresAt: string | null;
  profileBio: string | null;
  profileLocation: string | null;
  showCars: boolean;
  showRaceHistory: boolean;
  showPhotos: boolean;
}

export interface UserProfileUpdateRequest {
  name: string;
  age: number;
  email: string;
  licenseCategory: string;
}
