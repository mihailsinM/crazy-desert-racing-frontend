import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import raceBackground from "../assets/race.png";
import {
  getAllUsers,
  verifyUserLicense,
  makeUserAdmin,
} from "../services/userService";
import { getDrivers } from "../services/driverService";
import UserAvatar from "../components/users/UserAvatar";
import AdaptiveCardList from "../components/lists/AdaptiveCardList";
import CatalogPage from "../components/lists/CatalogPage";
import type { UserResponse } from "../types/user";
import { hasAdminAccess } from "../utils/userRole";

function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  async function loadUsersWithPublicAvatars() {
    const [allUsers, drivers] = await Promise.all([
      getAllUsers(),
      getDrivers(),
    ]);
    const driversById = new Map(drivers.map((driver) => [driver.id, driver]));

    return allUsers.map((user) => {
      const driver = driversById.get(user.id);

      return driver
        ? {
            ...user,
            avatarUrl: driver.avatarUrl,
            imageFraming: driver.imageFraming,
            membershipTier: driver.membershipTier,
          }
        : user;
    });
  }

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await loadUsersWithPublicAvatars();
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
    const data = await loadUsersWithPublicAvatars();
    setUsers(data);
  }

  async function handleMakeAdmin(userId: number) {
    await makeUserAdmin(userId);
    const data = await loadUsersWithPublicAvatars();
    setUsers(data);
  }

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase().trim();

    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search) ||
      user.licenseCategory.toLowerCase().includes(search)
    );
  });

  return (
    <CatalogPage>
      <article
        className="du-details-card"
        style={{
          backgroundImage: `url(${raceBackground})`,
        }}
      >
        <div className="du-details-overlay du-scroll du-details-overlay-top">
          <div className="du-page-header">
            <div>
              <p className="du-details-eyebrow">Admin Panel</p>
              <h1 className="du-details-title">All Users</h1>
            </div>

            <div className="du-search-box">
              {!searchTerm && (
                <span className="du-search-icon" aria-hidden="true">
                  ⌕
                </span>
              )}

              <input
                className="du-search-input"
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <AdaptiveCardList className="du-list-row-large">
            {filteredUsers.length === 0 ? (
              <div className="du-row-panel">
                <div className="du-row-main">
                  <span className="du-row-title">No users found</span>
                  <span className="du-row-subtitle">Try another name or email.</span>
                </div>
              </div>
            ) : filteredUsers.map((user) => (
              <div key={user.id} className="du-row-panel du-user-row">
                <UserAvatar
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  imageFraming={user.imageFraming}
                />

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
                  <button
                    className="du-button"
                    type="button"
                    onClick={() => navigate(`/drivers/${user.id}`)}
                  >
                    View Profile
                  </button>

                  {!user.licenseVerified && (
                    <button
                      className="du-button du-button-primary"
                      type="button"
                      onClick={() => handleVerifyLicense(user.id)}
                    >
                      Verify
                    </button>
                  )}

                  {!hasAdminAccess(user.role) && (
                    <button
                      className="du-button"
                      type="button"
                      onClick={() => handleMakeAdmin(user.id)}
                    >
                      Make Admin
                    </button>
                  )}
                </div>
              </div>
            ))}
          </AdaptiveCardList>
        </div>
      </article>
    </CatalogPage>
  );
}

export default AdminUsersPage;
