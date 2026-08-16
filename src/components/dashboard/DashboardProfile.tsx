import { useRef, useState } from "react";

import { useAuth } from "../../context/authContext";
import {
  deleteCurrentUserAvatar,
  getUserAvatarImageUrl,
  updateCurrentUser,
  updateCurrentUserAvatar,
} from "../../services/userService";
import type { UserProfileUpdateRequest } from "../../types/user";
import DashboardProfileForm from "./DashboardProfileForm";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

type DashboardProfileProps = {
  title: string;
  onBack?: () => void;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join("");
}

function DashboardProfile({ title, onBack }: DashboardProfileProps) {
  const { currentUser, setCurrentUser, logout } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!currentUser) {
    return null;
  }

  const user = currentUser;
  const avatarImageUrl = getUserAvatarImageUrl(user.avatarUrl);
  const showAvatarImage =
    avatarImageUrl !== null && failedAvatarUrl !== avatarImageUrl;

  function startEditing() {
    setError("");
    setMessage("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setError("");
    setIsEditing(false);
  }

  async function handleProfileSave(request: UserProfileUpdateRequest) {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const emailChanged = request.email !== user.email;
      const updatedUser = await updateCurrentUser(request);

      setCurrentUser(updatedUser);
      setIsEditing(false);

      if (emailChanged) {
        setMessage(
          "Email updated. Sign in again with your new email address...",
        );

        window.setTimeout(() => {
          logout();
          window.location.replace("/login");
        }, 1500);
      } else {
        setMessage("Profile updated successfully.");
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update profile",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const avatar = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!avatar) {
      return;
    }

    setError("");
    setMessage("");

    if (!ALLOWED_AVATAR_TYPES.includes(avatar.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }

    if (avatar.size > MAX_AVATAR_SIZE_BYTES) {
      setError("Profile photo must be 2 MB or smaller.");
      return;
    }

    setIsAvatarSaving(true);

    try {
      const updatedUser = await updateCurrentUserAvatar(avatar);
      setCurrentUser(updatedUser);
      setMessage("Profile photo updated successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update profile photo",
      );
    } finally {
      setIsAvatarSaving(false);
    }
  }

  async function handleAvatarDelete() {
    setError("");
    setMessage("");
    setIsAvatarSaving(true);

    try {
      const updatedUser = await deleteCurrentUserAvatar();
      setCurrentUser(updatedUser);
      setMessage("Profile photo removed.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to remove profile photo",
      );
    } finally {
      setIsAvatarSaving(false);
    }
  }

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

      <div className="du-inline du-inline-sm du-inline-wrap du-mt-lg">
        <div
          className="dashboard-hero-avatar"
          aria-label={`${currentUser.name} profile photo`}
        >
          {showAvatarImage ? (
            <img
              className="dashboard-hero-avatar-image"
              src={avatarImageUrl}
              alt=""
              onError={() => setFailedAvatarUrl(avatarImageUrl)}
            />
          ) : (
            <span aria-hidden="true">
              {getInitials(currentUser.name) || "CD"}
            </span>
          )}
        </div>

        <div>
          <h3 className="du-title-sm">{currentUser.name}</h3>
          <p className="du-caption">
            {currentUser.role === "ADMIN" ? "Administrator" : "Club member"}
            {" · "}
            {currentUser.licenseVerified
              ? "License verified"
              : "License pending"}
          </p>

          {isEditing && (
            <div className="du-inline du-inline-sm du-inline-wrap">
              <input
                ref={avatarInputRef}
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={isAvatarSaving}
              />

              <button
                type="button"
                className="du-button du-button-small"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isAvatarSaving}
              >
                {isAvatarSaving
                  ? "Updating..."
                  : currentUser.avatarUrl
                    ? "Change Photo"
                    : "Add Photo"}
              </button>

              {currentUser.avatarUrl && (
                <button
                  type="button"
                  className="du-button du-button-small"
                  onClick={handleAvatarDelete}
                  disabled={isAvatarSaving}
                >
                  Remove Photo
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <p className="du-error">{error}</p>}
      {message && <p className="du-sand-text">{message}</p>}

      {isEditing ? (
        <DashboardProfileForm
          user={currentUser}
          isSaving={isSaving}
          onSave={handleProfileSave}
          onCancel={cancelEditing}
        />
      ) : (
        <>
          <div className="du-info">
            <div className="du-info-row">
              <span className="du-info-label">Name</span>
              <span className="du-info-value">{currentUser.name}</span>
            </div>

            <div className="du-info-row">
              <span className="du-info-label">Age</span>
              <span className="du-info-value">{currentUser.age}</span>
            </div>

            <div className="du-info-row">
              <span className="du-info-label">Email</span>
              <span className="du-info-value">{currentUser.email}</span>
            </div>

            <div className="du-info-row">
              <span className="du-info-label">Role</span>
              <span className="du-info-value">{currentUser.role}</span>
            </div>

            <div className="du-info-row">
              <span className="du-info-label">License category</span>
              <span className="du-info-value">
                {currentUser.licenseCategory}
              </span>
            </div>

            <div className="du-info-row">
              <span className="du-info-label">License status</span>

              <span
                className={
                  currentUser.licenseVerified
                    ? "du-status du-status-small du-status-verified"
                    : "du-status du-status-small du-status-not-verified"
                }
              >
                {currentUser.licenseVerified ? "Verified" : "Not verified"}
              </span>
            </div>
          </div>

          <div className="du-inline du-inline-sm du-inline-wrap du-mt-lg">
            <button
              type="button"
              className="du-button du-button-primary du-button-small"
              onClick={startEditing}
            >
              Edit Profile
            </button>
          </div>
        </>
      )}
    </article>
  );
}

export default DashboardProfile;
