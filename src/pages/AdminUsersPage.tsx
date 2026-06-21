import { useEffect, useState } from "react";
import {
  getAllUsers,
  verifyUserLicense,
  makeUserAdmin,
} from "../services/userService";
import type { UserResponse } from "../types/user";

function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  async function handleVerifyLicense(userId: number) {
    await verifyUserLicense(userId);
    const data = await getAllUsers();
    setUsers(data);
  }

  async function handleMakeAdmin(userId: number) {
    await makeUserAdmin(userId);
    const data = await getAllUsers();
    setUsers(data);
  }

  return (
    <section className="du-page">
      <article
        className="du-details-card"
        style={{
          backgroundImage: `url("/src/assets/race.png")`,
        }}
      >
        <div className="du-details-overlay du-details-overlay-top">
          <p className="du-details-eyebrow">Admin Panel</p>

          <h1 className="du-details-title">All Users</h1>

          <div className="du-card-list du-soft-scroll du-scroll-large">
            {users.map((user) => (
              <div key={user.id} className="du-row-panel">
                <div className="du-row-main">
                  <span className="du-row-title">
                    {user.name} · {user.role}
                  </span>

                  <span className="du-row-subtitle">{user.email}</span>

                  <span className="du-row-subtitle">
                    License: {user.licenseCategory} ·{" "}
                    {user.licenseVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>

                <div className="du-row-actions">
                  {!user.licenseVerified && (
                    <button
                      className="du-button du-button-primary"
                      onClick={() => handleVerifyLicense(user.id)}
                    >
                      Verify
                    </button>
                  )}

                  {user.role !== "ADMIN" && (
                    <button
                      className="du-button"
                      onClick={() => handleMakeAdmin(user.id)}
                    >
                      Make Admin
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

export default AdminUsersPage;
