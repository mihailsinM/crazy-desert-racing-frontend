import type { RaceCar } from "./raceCar";

export type MarketplaceStatus =
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "RESERVED"
  | "SOLD"
  | "WITHDRAWN"
  | "REJECTED";

export type MarketplaceListing = {
  id: number;
  car: RaceCar;
  sellerId: number;
  sellerName: string;
  price: number;
  currency: "ILS" | "USD" | "EUR";
  description: string;
  status: MarketplaceStatus;
  expired: boolean;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  endDate: string | null;
};

export type MarketplaceListingRequest = {
  carId: number;
  price: number;
  currency: MarketplaceListing["currency"];
  description: string;
  endDate: string;
};
