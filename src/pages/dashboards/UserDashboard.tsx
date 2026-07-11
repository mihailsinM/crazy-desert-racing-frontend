import { useNavigate } from "react-router-dom";
import type { UserResponse } from "../../types/user";

type UserDashboardProps = {
  user: UserResponse;
};

type HubItem = {
  title: string;
  text: string;
  path: string;
};

function UserDashboard({ user }: UserDashboardProps) {
  const navigate = useNavigate();

  const hubItems: HubItem[] = [
    {
      title: "🏁 Upcoming Races",
      text: "Open upcoming desert race events.",
      path: "/races",
    },
    {
      title: "🏎 My Cars",
      text: "Add and manage your desert racing vehicles.",
      path: "/cars",
    },
    {
      title: "⭐ VIP Club",
      text: "Unlock premium festival and racing experiences.",
      path: "/vip",
    },
    {
      title: "🛒 Marketplace",
      text: "Browse racing cars, parts and desert offers.",
      path: "/marketplace",
    },
  ];

  return (
    <div>
      <section className="du-hero">
        <div>
          <p className="du-eyebrow">🏜 Crazy Desert Racing Club</p>
          <h1 className="du-title-xl">Welcome back, {user.name}</h1>
          <p className="du-text-soft">
            Your racing profile, upcoming events, cars and VIP access are ready.
          </p>
        </div>

        <div className="dashboard-hero-stats">
          <div>
            <span className="du-eyebrow">Next Event</span>
            <strong className="du-stat-value">Negev Desert Challenge</strong>
          </div>

          <div>
            <span className="du-eyebrow">VIP Status</span>
            <strong className="du-stat-value">Standard Member</strong>
          </div>
        </div>
      </section>

      <section className="du-dashboard-grid">
        <article className="du-dashboard-card">
          <h2 className="du-eyebrow">Driver Profile</h2>

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

        <aside className="du-dashboard-card du-card-scroll">
          <div className="du-hub-header">
            <h2>⚡ Desert Hub</h2>
          </div>

          <div className="du-card-list du-soft-scroll du-list-3 du-list-row-medium">
            {hubItems.map((item) => (
              <div
                key={item.title}
                className="du-hub-card"
                onClick={() => navigate(item.path)}
              >
                <h3>
                  <span className="du-sand-text">{item.title}</span>
                </h3>

                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}

export default UserDashboard;
