import type { UserResponse } from "../../types/user";

type DashboardProfileProps = {
  title: string;
  user: UserResponse;
  onBack?: () => void;
};

function DashboardProfile({ title, user, onBack }: DashboardProfileProps) {
  return (
    <article className="du-dashboard-card">
      <div className="du-hub-header">
        <h2 className="du-eyebrow">{title}</h2>

        {onBack && (
          <button
            type="button"
            className="du-button du-button-small"
            onClick={onBack}
          >
            Back to Hub
          </button>
        )}
      </div>

      <div className="du-info">
        <div className="du-info-row">
          <span className="du-info-label">Name</span>
          <span className="du-info-value">{user.name}</span>
        </div>

        <div className="du-info-row">
          <span className="du-info-label">Email</span>
          <span className="du-info-value">{user.email}</span>
        </div>

        <div className="du-info-row">
          <span className="du-info-label">Role</span>
          <span className="du-info-value">{user.role}</span>
        </div>

        <div className="du-info-row">
          <span className="du-info-label">License category</span>
          <span className="du-info-value">{user.licenseCategory}</span>
        </div>

        <div className="du-info-row">
          <span className="du-info-label">License status</span>

          <span
            className={
              user.licenseVerified
                ? "du-status du-status-small du-status-verified"
                : "du-status du-status-small du-status-not-verified"
            }
          >
            {user.licenseVerified ? "Verified" : "Not verified"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default DashboardProfile;
