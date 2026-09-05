import { useState } from "react";

import { getUserAvatarImageUrl } from "../../services/userService";

type UserAvatarProps = {
  name: string;
  avatarUrl: string | null;
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

function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = getUserAvatarImageUrl(avatarUrl);
  const showImage = imageUrl !== null && failedImageUrl !== imageUrl;
  const classes = ["du-row-media", "du-user-avatar", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="img" aria-label={`${name} profile photo`}>
      {showImage ? (
        <img
          src={imageUrl}
          alt=""
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name) || "CD"}</span>
      )}
    </div>
  );
}

export default UserAvatar;
