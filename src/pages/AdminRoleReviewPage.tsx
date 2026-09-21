import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import raceBackground from "../assets/race.png";
import UserAvatar from "../components/users/UserAvatar";
import CatalogPage from "../components/lists/CatalogPage";
import { getUserById, makeUserAdmin, removeUserAdmin } from "../services/userService";
import type { UserResponse } from "../types/user";

export default function AdminRoleReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = Number(id);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isInteger(userId) || userId <= 0) return;
    let active = true;
    getUserById(userId)
      .then((result) => { if (active) setUser(result); })
      .catch((caughtError: unknown) => {
        if (active) setError(caughtError instanceof Error ? caughtError.message : "Unable to load profile");
      });
    return () => { active = false; };
  }, [userId]);

  async function changeRole() {
    if (!user || !checked || busy || user.role === "SUPER_ADMIN") return;
    setBusy(true);
    setError("");
    try {
      const freshUser = await getUserById(userId);
      if (freshUser.role !== user.role) {
        setUser(freshUser);
        setChecked(false);
        setError("The user's role changed. Review their profile again.");
        return;
      }
      if (user.role === "ADMIN") await removeUserAdmin(userId);
      else await makeUserAdmin(userId);
      navigate("/admin/users");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Role change failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <CatalogPage>
      <article className="du-details-card" style={{ backgroundImage: `url(${raceBackground})` }}>
        <div className="du-details-overlay du-scroll du-details-overlay-top du-admin-review">
          <div className="du-page-header du-page-header-split">
            <div><p className="du-details-eyebrow">Super Administrator</p><h1 className="du-details-title">Review Admin Access</h1></div>
            <Link className="du-button" to="/admin/users">← Back</Link>
          </div>
          {error && <p className="du-error" role="alert">{error}</p>}
          {!Number.isInteger(userId) || userId <= 0 ? <p className="du-error">Invalid user</p> : !user && !error ? <p>Loading profile...</p> : null}
          {user && <div className="du-admin-review-content">
            <div className="du-row-panel du-admin-review-user">
              <UserAvatar name={user.name} avatarUrl={user.avatarUrl} imageFraming={user.imageFraming} />
              <div className="du-row-main">
                <strong className="du-row-title">{user.name}</strong>
                <span className="du-row-subtitle">Account #{user.id} · {user.email}</span>
                <span className="du-row-subtitle">License: {user.licenseCategory || "None"} · {user.licenseVerified ? "Verified" : "Not verified"}</span>
                <span className="du-row-subtitle">Current role: {user.role}</span>
              </div>
              <Link className="du-button" to={`/drivers/${user.id}`} state={{ from: `/admin/users/${user.id}/admin-access` }}>View Full Profile</Link>
            </div>
            <section className="du-row-panel du-admin-review-explanation">
              <h2>{user.role === "ADMIN" ? "Remove Administrator Access" : "Grant Administrator Access"}</h2>
              <p>Administrators can view the users list, verify licenses, manage races and Desert Live, and handle the shared support inbox and reports.</p>
              <p>Private conversations stay available to their participants. Administrators see only messages explicitly reported to them.</p>
              {user.role === "SUPER_ADMIN" ? <p>This protected Super Administrator role cannot be changed here.</p> : <>
                <label className="du-admin-review-check">
                  <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
                  <span>I checked this person's profile and confirmed the account.</span>
                </label>
                <button className="du-button du-button-primary" type="button" onClick={changeRole} disabled={!checked || busy}>
                  {busy ? "Saving..." : user.role === "ADMIN" ? "Remove Administrator Access" : "Make Administrator"}
                </button>
              </>}
            </section>
          </div>}
        </div>
      </article>
    </CatalogPage>
  );
}
