import AuthenticatedFocalImage from "../images/AuthenticatedFocalImage";
import type { ImageFramingProfiles } from "../../utils/imageFocus";
import { getUserImageFraming } from "../../utils/userImageFraming";

type UserAvatarProps = {
  name: string;
  avatarUrl: string | null;
  imageFraming?: ImageFramingProfiles | null;
  className?: string;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join("");
}

function UserAvatar({
  name,
  avatarUrl,
  imageFraming,
  className,
}: UserAvatarProps) {
  const avatar = getUserImageFraming({ imageFraming }).avatar;
  const classes = ["du-row-media", "du-user-avatar", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="img" aria-label={`${name} profile photo`}>
      {avatarUrl ? (
        <AuthenticatedFocalImage
          src={avatarUrl}
          alt=""
          focusX={avatar.focusX}
          focusY={avatar.focusY}
          cropPercent={avatar.cropPercent}
          fallback={
            <span aria-hidden="true">{getInitials(name) || "CD"}</span>
          }
        />
      ) : (
        <span aria-hidden="true">{getInitials(name) || "CD"}</span>
      )}
    </div>
  );
}

export default UserAvatar;
