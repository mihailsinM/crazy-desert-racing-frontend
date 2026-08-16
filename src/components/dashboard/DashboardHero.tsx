import { useState } from "react";

import { useAuth } from "../../context/authContext";
import { getUserAvatarImageUrl } from "../../services/userService";

type DashboardHeroStat = {
  label: string;
  value: string;
};

type DashboardHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats: DashboardHeroStat[];
  onOpenProfile?: () => void;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join("");
}

function DashboardHero({
  eyebrow,
  title,
  description,
  stats,
  onOpenProfile,
}: DashboardHeroProps) {
  const { currentUser } = useAuth();
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  if (!currentUser) {
    return null;
  }

  const avatarImageUrl = getUserAvatarImageUrl(currentUser.avatarUrl);
  const showAvatarImage =
    avatarImageUrl !== null && failedAvatarUrl !== avatarImageUrl;

  return (
    <section className="du-hero">
      <div className="dashboard-hero-main">
        <div
          className="dashboard-hero-avatar"
          aria-label={`${currentUser.name} profile photo`}
        >
          {showAvatarImage ? (
            <img
              className="dashboard-hero-avatar-image"
              src={avatarImageUrl}
              alt=""
              onError={() => setFailedAvatarUrl(avatarImageUrl)}
            />
          ) : (
            <span aria-hidden="true">
              {getInitials(currentUser.name) || "CD"}
            </span>
          )}
        </div>

        <div className="dashboard-hero-copy">
          <p className="du-eyebrow">{eyebrow}</p>

          <h1 className="du-title-xl">{title}</h1>

          <p className="du-text-soft du-text-readable">{description}</p>

          {onOpenProfile && (
            <div className="dashboard-hero-actions du-inline du-inline-sm du-inline-wrap">
              <button
                type="button"
                className="du-button du-button-primary du-button-small"
                onClick={onOpenProfile}
              >
                My Profile
              </button>

              <span className="du-caption">
                {currentUser.role === "ADMIN"
                  ? "Administrator"
                  : "Club member"}
                {" · "}
                {currentUser.email}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="du-hero-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="du-hero-stat">
            <span className="du-hero-stat-label">{stat.label}</span>
            <strong className="du-stat-value">{stat.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DashboardHero;
