import type { RaceCar } from "../types/raceCar";
import {
  createImageFramingProfile,
  createImageFramingProfiles,
  type ImageFramingProfiles,
} from "./imageFocus";

export function getRaceCarImageFraming(
  raceCar: RaceCar,
): ImageFramingProfiles {
  const legacyCard = createImageFramingProfile(
    raceCar.imageFocusX,
    raceCar.imageFocusY,
    raceCar.imageCropPercent,
  );
  const card = raceCar.imageFraming?.card ?? legacyCard;
  const avatar = raceCar.imageFraming?.avatar ?? card;

  return createImageFramingProfiles(avatar, card);
}
