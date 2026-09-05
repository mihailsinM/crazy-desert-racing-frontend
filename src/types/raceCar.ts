import type { ImageFramingProfiles } from "../utils/imageFocus";

export type ImagePosition = "CENTER" | "LEFT" | "RIGHT" | "TOP" | "BOTTOM";

export type RaceCar = {
  id: number;
  name: string;
  brand: string;
  horsePower: number;
  imageUrl: string | null;
  imagePosition?: ImagePosition;
  imageFocusX: number;
  imageFocusY: number;
  imageCropPercent: number;
  imageFraming?: ImageFramingProfiles | null;
};

export type RaceCarWriteRequest = {
  name: string;
  brand: string;
  horsePower: number;
  imageUrl?: string | null;
  imageFocusX?: number;
  imageFocusY?: number;
  imageCropPercent?: number;
};

export type RaceCarImageFramingProfilesRequest = ImageFramingProfiles;
