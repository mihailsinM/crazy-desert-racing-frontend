import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/userService";
import type { UserResponse } from "../types/user";
import "../styles/dashboard-page.css";

function DashboardPage() {
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

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">

  <div className="header-top">

    <p>Member Dashboard</p>

    <button
      className="logout-button"
      onClick={handleLogout}
    >
      Logout
    </button>

  </div>

  <h1>Welcome back, {user.name}</h1>

</header>

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
            <h2>Next Steps</h2>

            <div className="quick-actions">
              <div className="action-card">
                <h3>🏎 My Cars</h3>
                <p>Add and manage your desert racing vehicles.</p>
              </div>

              <div className="action-card">
                <h3>🏁 Upcoming Race</h3>
                <p>View your next race and registration status.</p>
              </div>

              <div className="action-card">
                <h3>⭐ VIP Club</h3>
                <p>Unlock premium festival and racing experiences.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
