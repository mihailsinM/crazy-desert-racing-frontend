import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/authContext";
import {
  getCurrentUserPhotos,
  uploadCurrentUserPhoto,
} from "../../services/userPhotoService";
import type { UserPhoto } from "../../types/driver";
import { createImageFramingProfiles } from "../../utils/imageFocus";
import {
  formatImageFileSize,
  IMAGE_UPLOAD_ACCEPT,
  prepareImageForUpload,
} from "../../utils/imageUpload";
import { getUserImageFraming } from "../../utils/userImageFraming";
import AuthenticatedFocalImage from "../images/AuthenticatedFocalImage";

function formatVisibility(photo: UserPhoto): string {
  if (photo.visibility === "PRIVATE") return "Private";
  if (photo.visibility === "MEMBERS_ONLY") return "Club Members";
  return "Public Profile";
}

function ProfilePhotosManager() {
  const { refreshCurrentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedImagePreview = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : null),
    [selectedImage],
  );

  useEffect(() => {
    return () => {
      if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
    };
  }, [selectedImagePreview]);

  async function loadPhotos() {
    setPhotos(await getCurrentUserPhotos());
  }

  useEffect(() => {
    let active = true;
    void getCurrentUserPhotos()
      .then((loadedPhotos) => {
        if (active) setPhotos(loadedPhotos);
      })
      .catch((caughtError) => {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load your photos",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const image = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";
    if (!image) return;

    setOptimizing(true);
    setError("");
    setMessage("");
    try {
      const preparedImage = await prepareImageForUpload(image);
      setSelectedImage(preparedImage);
      setRightsConfirmed(false);
      setMessage(
        preparedImage === image
          ? `Ready to add · ${formatImageFileSize(preparedImage.size)}`
          : `Optimized ${formatImageFileSize(image.size)} → ${formatImageFileSize(preparedImage.size)}`,
      );
    } catch (caughtError) {
      setSelectedImage(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to prepare photo",
      );
    } finally {
      setOptimizing(false);
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedImage) {
      setError("Choose a photo first.");
      return;
    }
    if (!rightsConfirmed) {
      setError("Confirm that you own the photo or may publish it.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");
    try {
      await uploadCurrentUserPhoto({
        file: selectedImage,
        caption: null,
        visibility: "MEMBERS_ONLY",
        rightsConfirmed,
        imageFraming: createImageFramingProfiles(),
      });
      await loadPhotos();
      await refreshCurrentUser();
      setSelectedImage(null);
      setRightsConfirmed(false);
      setMessage("Photo added. Personalize it whenever you want in Settings.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to upload photo",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="du-profile-photos">
      <div className="du-hub-header">
        <div className="du-photo-gallery-heading">
          <h1 className="du-eyebrow">My Gallery</h1>
          <span className="du-caption">{photos.length} / 50</span>
        </div>
        <div className="du-photo-gallery-actions">
          <label className="du-button du-button-primary du-button-small du-button-rect du-file-button">
            <span aria-hidden="true">＋</span>
            {optimizing ? "Preparing..." : "Add Photo"}
            <input
              hidden
              type="file"
              accept={IMAGE_UPLOAD_ACCEPT}
              disabled={optimizing || uploading}
              onChange={selectImage}
            />
          </label>
          <button
            type="button"
            className="du-button du-button-small du-button-rect"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {selectedImagePreview && (
        <form className="du-photo-add-panel" onSubmit={handleUpload}>
          <div className="du-photo-add-confirmation">
            <img src={selectedImagePreview} alt="Selected upload preview" />
            <div className="du-photo-add-copy">
              <strong>Ready to add this photo?</strong>
              <p className="du-text-soft">
                Confirm that you may publish it. You can personalize everything
                else later in Settings.
              </p>
              <label className="du-check-row du-photo-rights">
                <input
                  type="checkbox"
                  checked={rightsConfirmed}
                  onChange={(event) =>
                    setRightsConfirmed(event.currentTarget.checked)
                  }
                />
                <span>This is my photo, or I have permission to publish it.</span>
              </label>
              <div className="du-inline du-inline-sm du-inline-wrap">
                <button
                  type="submit"
                  className="du-button du-button-primary du-button-small"
                  disabled={uploading || optimizing || !rightsConfirmed}
                >
                  {uploading ? "Adding..." : "Add to My Gallery"}
                </button>
                <button
                  type="button"
                  className="du-button du-button-small"
                  disabled={uploading}
                  onClick={() => {
                    setSelectedImage(null);
                    setRightsConfirmed(false);
                    setMessage("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {message && <p className="du-image-optimization-message">{message}</p>}
      {error && <p className="du-error">{error}</p>}

      {loading ? (
        <p className="du-caption">Loading photos...</p>
      ) : photos.length === 0 ? (
        <p className="du-text-soft">No gallery photos yet.</p>
      ) : (
        <div className="du-profile-photo-list">
          {photos.map((photo) => {
            const card = getUserImageFraming(photo).card;
            return (
              <article key={photo.id} className="du-photo-card du-profile-photo-item">
                <button
                  type="button"
                  className="du-profile-photo-preview"
                  aria-label={`View ${photo.caption || "gallery photo"}`}
                  onClick={() =>
                    navigate(`/profile/photos/${photo.id}`, {
                      state: { from: location.pathname },
                    })
                  }
                >
                  <AuthenticatedFocalImage
                    src={photo.imageUrl}
                    alt={photo.caption || "Profile gallery photo"}
                    focusX={card.focusX}
                    focusY={card.focusY}
                    cropPercent={card.cropPercent}
                  />
                </button>
                <div className="du-photo-card-copy du-profile-photo-copy">
                  <p>{photo.caption || "No description"}</p>
                  <span className="du-caption">
                    {formatVisibility(photo)}
                    {photo.profilePhoto ? " · Avatar" : ""}
                    {photo.cardProfilePhoto ? " · Profile Card" : ""}
                  </span>
                  <button
                    type="button"
                    className="du-button du-button-rect du-photo-settings-button"
                    onClick={() =>
                      navigate(`/profile/photos/${photo.id}/settings`, {
                        state: { from: location.pathname },
                      })
                    }
                  >
                    <span aria-hidden="true">⚙</span>
                    Settings
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ProfilePhotosManager;
