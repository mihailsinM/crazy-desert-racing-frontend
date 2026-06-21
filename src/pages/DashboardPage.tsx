import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/userService";
import type { UserResponse } from "../types/user";

import "../styles/dashboard-page.css";
import "../styles/dashboard-hero.css";
import "../styles/animations.css";

type HubItem = {
  title: string;
  text: string;
  path: string;
};

function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setError("Failed to load user. Please login again.");
      }
    }

    loadUser();
  }, []);

  const hubItems = useMemo<HubItem[]>(() => {
    if (!user) return [];

    return [
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
      ...(user.role === "ADMIN"
        ? [
            {
              title: "👥 Users Management",
              text: "View users, verify licenses and manage roles.",
              path: "/admin/users",
            },
            {
              title: "🏁 Create Race",
              text: "Create new race events for the club.",
              path: "/add-race",
            },
          ]
        : []),
    ];
  }, [user]);

  if (error) {
    localStorage.removeItem("token");
    window.location.reload();
    return null;
  }

  if (!user) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>
      <section className="dashboard-hero">
        <div>
          <p className="du-details-eyebrow">🏜 Crazy Desert Racing Club</p>
          <h1>Welcome back, {user.name}</h1>
          <p className="dashboard-hero-text">
            Your racing profile, upcoming events, cars and VIP access are ready.
          </p>
        </div>

        <div className="dashboard-hero-stats">
          <div>
            <span>Next Event</span>
            <strong>Negev Desert Challenge</strong>
          </div>

          <div>
            <span>VIP Status</span>
            <strong>Standard Member</strong>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Driver Profile</h2>

          <div className="user-info">
            <div className="info-row">
              <span className="info-label">Name</span>
              <span className="info-value">{user.name}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Role</span>
              <span className="info-value">{user.role}</span>
            </div>

            <div className="info-row">
              <span className="info-label">License category</span>
              <span className="info-value">{user.licenseCategory}</span>
            </div>

            <div className="info-row">
              <span className="info-label">License status</span>
              <span className="status-badge">
                {user.licenseVerified ? "Verified" : "Not verified"}
              </span>
            </div>
          </div>
        </article>

        <aside className="dashboard-card">
          <div className="du-hub-header">
            <h2>⚡ Desert Hub</h2>

            {user.role === "ADMIN" && (
              <button
                className="du-button du-button-small"
                onClick={() => navigate("/admin/hub/new")}
              >
                + Add
              </button>
            )}
          </div>

          <div className="du-hub-list du-card-list du-soft-scroll du-scroll-3">
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
      </div>
    </div>
  );
}

export default DashboardPage;
