import type { DesertLiveItem } from "../types/desertLive";
import {
  createImageFramingProfile,
  createImageFramingProfiles,
  type ImageFramingProfiles,
} from "./imageFocus";

export function getDesertLiveImageFraming(
  item: DesertLiveItem,
): ImageFramingProfiles {
  const legacyCard = createImageFramingProfile(
    item.imageFocusX,
    item.imageFocusY,
    item.imageCropPercent,
  );
  const card = item.imageFraming?.card ?? legacyCard;
  const avatar = item.imageFraming?.avatar ?? card;

  return createImageFramingProfiles(avatar, card);
}
