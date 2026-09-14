import type { ImageFramingProfiles } from "./imageFocus";
import { createImageFramingProfiles } from "./imageFocus";

type UserImageWithFraming = {
  imageFraming?: ImageFramingProfiles | null;
};

export function getUserImageFraming(
  image: UserImageWithFraming,
): ImageFramingProfiles {
  return createImageFramingProfiles(
    image.imageFraming?.avatar,
    image.imageFraming?.card,
  );
}
