import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/userService";
import type { UserResponse } from "../types/user";
import DashboardNavbar from "../components/DashboardNavbar";
import MyCarsPage from "./MyCarsPage";
import RacesPage from "./RacesPage";
import VipClubPage from "./VipClubPage";
import "../styles/dashboard-page.css";
import "../styles/dashboard-page.css";
import "../styles/dashboard-hero.css";
import "../styles/mock-pages.css";
import "../styles/animations.css";

function DashboardPage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

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

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  if (error) {
    localStorage.removeItem("token");
    window.location.reload();

    return null;
  }

  if (!user) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-container">
        <DashboardNavbar
          activePage={activePage}
          onNavigate={setActivePage}
          onLogout={handleLogout}
        />

        {activePage === "dashboard" && (
          <>
            <section className="dashboard-hero">
              <div>
                <p className="dashboard-hero-eyebrow">
                  🏜 Crazy Desert Racing Club
                </p>
                <h1>Welcome back, {user.name}</h1>
                <p className="dashboard-hero-text">
                  Your racing profile, upcoming events, cars and VIP access are
                  ready.
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
                <h2>🏁 Upcoming Race</h2>

                <div className="quick-actions">
                  <div className="action-card featured-action">
                    <h3>Negev Desert Challenge</h3>
                    <p>
                      Three-day desert race across dunes, rocks and open tracks.
                    </p>
                    <span>April 15, 2027</span>
                  </div>

                  <div className="action-card">
                    <h3>🏎 My Cars</h3>
                    <p>Add and manage your desert racing vehicles.</p>
                  </div>

                  <div className="action-card">
                    <h3>⭐ VIP Club</h3>
                    <p>Unlock premium festival and racing experiences.</p>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}

        {activePage === "cars" && <MyCarsPage />}
        {activePage === "races" && <RacesPage />}
        {activePage === "vip" && <VipClubPage />}
      </div>
    </section>
  );
}

export default DashboardPage;
