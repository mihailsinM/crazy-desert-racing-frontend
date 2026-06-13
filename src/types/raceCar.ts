export type ImagePosition = "CENTER" | "LEFT" | "RIGHT" | "TOP" | "BOTTOM";

export type RaceCar = {
  id: number;
  name: string;
  brand: string;
  horsePower: number;
  imageUrl: string;
  imagePosition: ImagePosition;
};
