import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/authContext";
import { getUserImageFraming } from "../../utils/userImageFraming";
import AuthenticatedFocalImage from "../images/AuthenticatedFocalImage";
import { formatUserRole } from "../../utils/userRole";

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
  myCarsPath?: string;
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
  myCarsPath = "/cars",
}: DashboardHeroProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return null;
  }

  const avatarFraming = getUserImageFraming(currentUser).avatar;

  return (
    <section className="du-hero">
      <div className="dashboard-hero-main">
        <div
          className="dashboard-hero-avatar"
          aria-label={`${currentUser.name} profile photo`}
        >
          {currentUser.avatarUrl ? (
            <AuthenticatedFocalImage
              src={currentUser.avatarUrl}
              alt=""
              focusX={avatarFraming.focusX}
              focusY={avatarFraming.focusY}
              cropPercent={avatarFraming.cropPercent}
              className="dashboard-hero-avatar-image"
              fallback={
                <span aria-hidden="true">
                  {getInitials(currentUser.name) || "CD"}
                </span>
              }
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

              <button
                type="button"
                className="du-button du-button-small"
                onClick={() => navigate(myCarsPath)}
              >
                My Cars
              </button>

              <button
                type="button"
                className="du-button du-button-small"
                onClick={() => navigate("/profile/photos")}
              >
                My Gallery
              </button>

              <button
                type="button"
                className="du-button du-button-small"
                onClick={() =>
                  navigate(`/drivers/${currentUser.id}`, {
                    state: { from: "/dashboard" },
                  })
                }
              >
                My Card
              </button>

              <span className="du-caption">
                {formatUserRole(currentUser.role)}
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
