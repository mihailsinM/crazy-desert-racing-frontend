import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthenticatedFocalImage from "../images/AuthenticatedFocalImage";
import ProfilePhotosManager from "../users/ProfilePhotosManager";
import PublicProfileForm from "../users/PublicProfileForm";
import { useAuth } from "../../context/authContext";
import { updateCurrentDriver } from "../../services/driverService";
import { updateCurrentUser } from "../../services/userService";
import type { PublicProfileUpdateRequest } from "../../types/driver";
import type { UserProfileUpdateRequest } from "../../types/user";
import { getUserImageFraming } from "../../utils/userImageFraming";
import DashboardProfileForm from "./DashboardProfileForm";

type DashboardProfileProps = {
  title: string;
  onBack?: () => void;
};

type EditorMode = "VIEW" | "ACCOUNT" | "PUBLIC";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join("");
}

function formatTier(tier: string): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

function DashboardProfile({ title, onBack }: DashboardProfileProps) {
  const navigate = useNavigate();
  const {
    currentUser,
    setCurrentUser,
    refreshCurrentUser,
    logout,
  } = useAuth();
  const [editorMode, setEditorMode] = useState<EditorMode>("VIEW");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!currentUser) {
    return null;
  }

  const user = currentUser;
  const avatarFraming = getUserImageFraming(user).avatar;

  async function handleAccountSave(request: UserProfileUpdateRequest) {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const emailChanged = request.email !== user.email;
      const updatedUser = await updateCurrentUser(request);
      setCurrentUser(updatedUser);
      setEditorMode("VIEW");

      if (emailChanged) {
        setMessage("Email updated. Sign in again with your new email address...");
        window.setTimeout(() => {
          logout();
          window.location.replace("/login");
        }, 1500);
      } else {
        setMessage("Account details updated.");
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update account",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublicProfileSave(
    request: PublicProfileUpdateRequest,
  ) {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      await updateCurrentDriver(request);
      await refreshCurrentUser();
      setEditorMode("VIEW");
      setMessage("Public profile and privacy settings updated.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update public profile",
      );
    } finally {
      setSaving(false);
    }
  }

  async function refreshProfilePhoto(): Promise<void> {
    await refreshCurrentUser();
  }

  return (
    <article className="du-dashboard-card du-profile-workspace">
      <div className="du-hub-header">
        <h2 className="du-eyebrow">{title}</h2>
        {onBack && (
          <button type="button" className="du-button du-button-small" onClick={onBack}>
            Back to Hub
          </button>
        )}
      </div>

      <div className="du-inline du-inline-sm du-inline-wrap du-mt-lg">
        <div className="dashboard-hero-avatar" aria-label={`${user.name} profile photo`}>
          {user.avatarUrl ? (
            <AuthenticatedFocalImage
              src={user.avatarUrl}
              alt=""
              focusX={avatarFraming.focusX}
              focusY={avatarFraming.focusY}
              cropPercent={avatarFraming.cropPercent}
              fallback={<span aria-hidden="true">{getInitials(user.name) || "CD"}</span>}
            />
          ) : (
            <span aria-hidden="true">{getInitials(user.name) || "CD"}</span>
          )}
        </div>

        <div>
          <h3 className="du-title-sm">{user.name}</h3>
          <p className="du-caption">
            {user.role === "ADMIN" ? "Administrator" : "Club member"}
            {" · "}
            {user.licenseVerified ? "Verified driver" : "License pending"}
            {" · "}
            {formatTier(user.membershipTier)}
          </p>
        </div>
      </div>

      {error && <p className="du-error">{error}</p>}
      {message && <p className="du-image-optimization-message">{message}</p>}

      {editorMode === "ACCOUNT" && (
        <DashboardProfileForm
          user={user}
          isSaving={saving}
          onSave={handleAccountSave}
          onCancel={() => setEditorMode("VIEW")}
        />
      )}

      {editorMode === "PUBLIC" && (
        <PublicProfileForm
          user={user}
          saving={saving}
          onSave={handlePublicProfileSave}
          onCancel={() => setEditorMode("VIEW")}
        />
      )}

      {editorMode === "VIEW" && (
        <>
          <div className="du-info du-profile-info">
            <div className="du-info-row">
              <span className="du-info-label">Email — private</span>
              <span className="du-info-value">{user.email}</span>
            </div>
            <div className="du-info-row">
              <span className="du-info-label">Age — private</span>
              <span className="du-info-value">{user.age}</span>
            </div>
            <div className="du-info-row">
              <span className="du-info-label">License — private</span>
              <span className="du-info-value">{user.licenseCategory}</span>
            </div>
            <div className="du-info-row">
              <span className="du-info-label">Public location</span>
              <span className="du-info-value">{user.profileLocation || "Not shared"}</span>
            </div>
            <div className="du-info-row">
              <span className="du-info-label">Public sections</span>
              <span className="du-info-value">
                {[user.showCars && "Cars", user.showRaceHistory && "Races", user.showPhotos && "Photos"]
                  .filter(Boolean)
                  .join(" · ") || "Private"}
              </span>
            </div>
          </div>

          <div className="du-inline du-inline-sm du-inline-wrap du-mt-lg">
            <button
              type="button"
              className="du-button du-button-primary du-button-small"
              onClick={() => setEditorMode("PUBLIC")}
            >
              Edit Public Profile
            </button>
            <button
              type="button"
              className="du-button du-button-small"
              onClick={() => setEditorMode("ACCOUNT")}
            >
              Edit Account
            </button>
            <button
              type="button"
              className="du-button du-button-small"
              onClick={() => navigate(`/drivers/${user.id}`)}
            >
              View My Public Profile
            </button>
          </div>
        </>
      )}

      <ProfilePhotosManager onProfilePhotoChanged={refreshProfilePhoto} />
    </article>
  );
}

export default DashboardProfile;
