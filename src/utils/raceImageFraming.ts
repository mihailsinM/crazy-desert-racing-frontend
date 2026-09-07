import type { Race } from "../types/race";
import {
  createImageFramingProfile,
  createImageFramingProfiles,
  type ImageFramingProfiles,
} from "./imageFocus";

export function getRaceImageFraming(race: Race): ImageFramingProfiles {
  const legacyCard = createImageFramingProfile(
    race.imageFocusX,
    race.imageFocusY,
    race.imageCropPercent,
  );
  const card = race.imageFraming?.card ?? legacyCard;
  const avatar = race.imageFraming?.avatar ?? card;

  return createImageFramingProfiles(avatar, card);
}
