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

export type RaceCarImageFramingRequest = {
  focusX: number;
  focusY: number;
  cropPercent: number;
};
