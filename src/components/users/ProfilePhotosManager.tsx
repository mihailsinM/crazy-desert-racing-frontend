import { useEffect, useMemo, useState } from "react";

import AuthenticatedFocalImage from "../images/AuthenticatedFocalImage";
import ImageFocusPicker from "../images/ImageFocusPicker";
import {
  deleteCurrentUserPhoto,
  getCurrentUserPhotos,
  setCurrentUserProfilePhoto,
  updateCurrentUserPhoto,
  updateCurrentUserPhotoFraming,
  uploadCurrentUserPhoto,
} from "../../services/userPhotoService";
import type { UserPhoto, UserPhotoVisibility } from "../../types/driver";
import {
  createImageFramingProfiles,
  type ImageFramingProfiles,
} from "../../utils/imageFocus";
import {
  formatImageFileSize,
  IMAGE_UPLOAD_ACCEPT,
  MAX_SOURCE_IMAGE_SIZE_MB,
  prepareImageForUpload,
} from "../../utils/imageUpload";
import { getUserImageFraming } from "../../utils/userImageFraming";

type ProfilePhotosManagerProps = {
  onProfilePhotoChanged: () => Promise<void>;
};

function ProfilePhotosManager({
  onProfilePhotoChanged,
}: ProfilePhotosManagerProps) {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] =
    useState<UserPhotoVisibility>("MEMBERS_ONLY");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [imageFraming, setImageFraming] = useState<ImageFramingProfiles>(() =>
    createImageFramingProfiles(),
  );
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [editingFraming, setEditingFraming] = useState<ImageFramingProfiles>(
    () => createImageFramingProfiles(),
  );
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [busyPhotoId, setBusyPhotoId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedImagePreview = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : null),
    [selectedImage],
  );

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  async function loadPhotos() {
    setPhotos(await getCurrentUserPhotos());
  }

  useEffect(() => {
    let active = true;

    void getCurrentUserPhotos()
      .then((loadedPhotos) => {
        if (active) {
          setPhotos(loadedPhotos);
        }
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
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const image = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";

    if (!image) {
      return;
    }

    setOptimizing(true);
    setError("");
    setMessage("");

    try {
      const preparedImage = await prepareImageForUpload(image);
      setSelectedImage(preparedImage);
      setImageFraming(createImageFramingProfiles());
      setMessage(
        preparedImage === image
          ? `Ready to upload · ${formatImageFileSize(preparedImage.size)}`
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
        caption: caption.trim() || null,
        visibility,
        rightsConfirmed,
        imageFraming,
      });
      await loadPhotos();
      setSelectedImage(null);
      setCaption("");
      setVisibility("MEMBERS_ONLY");
      setRightsConfirmed(false);
      setImageFraming(createImageFramingProfiles());
      setMessage("Photo added to your gallery.");
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

  async function changeVisibility(
    photo: UserPhoto,
    nextVisibility: UserPhotoVisibility,
  ) {
    setBusyPhotoId(photo.id);
    setError("");
    setMessage("");

    try {
      await updateCurrentUserPhoto(photo.id, {
        caption: photo.caption,
        visibility: nextVisibility,
      });
      await loadPhotos();
      await onProfilePhotoChanged();
      setMessage(
        nextVisibility === "PRIVATE"
          ? "Photo hidden. A private photo cannot remain the profile photo."
          : "Photo visibility updated.",
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to update photo");
    } finally {
      setBusyPhotoId(null);
    }
  }

  async function editCaption(photo: UserPhoto) {
    const nextCaption = window.prompt("Photo caption:", photo.caption ?? "");

    if (nextCaption === null) {
      return;
    }

    setBusyPhotoId(photo.id);
    setError("");

    try {
      await updateCurrentUserPhoto(photo.id, {
        caption: nextCaption.trim() || null,
        visibility: photo.visibility,
      });
      await loadPhotos();
      setMessage("Photo caption updated.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to update caption");
    } finally {
      setBusyPhotoId(null);
    }
  }

  async function setProfilePhoto(photo: UserPhoto) {
    setBusyPhotoId(photo.id);
    setError("");
    setMessage("");

    try {
      await setCurrentUserProfilePhoto(photo.id);
      await loadPhotos();
      await onProfilePhotoChanged();
      setMessage("Profile photo updated.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to set profile photo");
    } finally {
      setBusyPhotoId(null);
    }
  }

  function startFramingEdit(photo: UserPhoto) {
    setEditingPhotoId(photo.id);
    setEditingFraming(getUserImageFraming(photo));
    setError("");
  }

  async function saveFraming(photo: UserPhoto) {
    setBusyPhotoId(photo.id);
    setError("");

    try {
      await updateCurrentUserPhotoFraming(photo.id, editingFraming);
      await loadPhotos();
      await onProfilePhotoChanged();
      setEditingPhotoId(null);
      setMessage("Avatar and card framing saved.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to save framing");
    } finally {
      setBusyPhotoId(null);
    }
  }

  async function deletePhoto(photo: UserPhoto) {
    if (!window.confirm("Delete this photo permanently?")) {
      return;
    }

    setBusyPhotoId(photo.id);
    setError("");
    setMessage("");

    try {
      await deleteCurrentUserPhoto(photo.id);
      await loadPhotos();
      await onProfilePhotoChanged();
      setMessage("Photo deleted.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to delete photo");
    } finally {
      setBusyPhotoId(null);
    }
  }

  return (
    <section className="du-profile-photos">
      <div className="du-hub-header">
        <div>
          <p className="du-eyebrow">My Gallery</p>
          <h3 className="du-title-sm">Profile Photos</h3>
        </div>
        <span className="du-caption">{photos.length} / 50 photos</span>
      </div>

      <form className="du-form du-photo-upload" onSubmit={handleUpload}>
        <div className="du-inline du-inline-sm du-inline-wrap">
          <label className="du-button du-button-small du-button-rect du-button-inline du-file-button">
            {optimizing ? "Optimizing..." : "Choose Photo"}
            <input
              hidden
              type="file"
              accept={IMAGE_UPLOAD_ACCEPT}
              disabled={optimizing || uploading}
              onChange={selectImage}
            />
          </label>
          <span className="du-caption">
            JPG, PNG, or WebP · up to {MAX_SOURCE_IMAGE_SIZE_MB} MB
          </span>
        </div>

        {selectedImagePreview && (
          <>
            <label className="du-field">
              <span className="du-field-label">Caption</span>
              <input
                className="du-input"
                value={caption}
                maxLength={300}
                onChange={(event) => setCaption(event.currentTarget.value)}
              />
            </label>
            <label className="du-field">
              <span className="du-field-label">Visibility</span>
              <select
                className="du-select"
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.currentTarget.value as UserPhotoVisibility)
                }
              >
                <option value="PRIVATE">Private</option>
                <option value="MEMBERS_ONLY">Club Members</option>
                <option value="PUBLIC">Public Profile</option>
              </select>
            </label>

            <ImageFocusPicker
              imageUrl={selectedImagePreview}
              framingProfiles={imageFraming}
              onFramingProfilesChange={setImageFraming}
              imageAlt="Profile photo"
              disabled={uploading}
            />

            <label className="du-check-row du-photo-rights">
              <input
                type="checkbox"
                checked={rightsConfirmed}
                onChange={(event) => setRightsConfirmed(event.currentTarget.checked)}
              />
              <span>
                I confirm that this is my photo or I have permission to publish it.
              </span>
            </label>

            <div className="du-inline du-inline-sm du-inline-wrap">
              <button
                type="submit"
                className="du-button du-button-primary du-button-small"
                disabled={uploading || optimizing || !rightsConfirmed}
              >
                {uploading ? "Uploading..." : "Add to Gallery"}
              </button>
              <button
                type="button"
                className="du-button du-button-small"
                disabled={uploading}
                onClick={() => setSelectedImage(null)}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </form>

      {message && <p className="du-image-optimization-message">{message}</p>}
      {error && <p className="du-error">{error}</p>}

      {loading ? (
        <p className="du-caption">Loading photos...</p>
      ) : photos.length === 0 ? (
        <p className="du-text-soft">No gallery photos yet.</p>
      ) : (
        <div className="du-profile-photo-list du-soft-scroll du-scroll-large">
          {photos.map((photo) => {
            const card = getUserImageFraming(photo).card;
            const disabled = busyPhotoId === photo.id;

            return (
              <article key={photo.id} className="du-profile-photo-item">
                <div className="du-profile-photo-preview">
                  <AuthenticatedFocalImage
                    src={photo.imageUrl}
                    alt={photo.caption || "Profile gallery photo"}
                    focusX={card.focusX}
                    focusY={card.focusY}
                    cropPercent={card.cropPercent}
                  />
                </div>
                <div className="du-profile-photo-copy">
                  <strong>{photo.caption || "Untitled photo"}</strong>
                  <span className="du-caption">
                    {photo.visibility.replace("_", " ")}
                    {photo.profilePhoto ? " · PROFILE PHOTO" : ""}
                  </span>
                  <div className="du-inline du-inline-sm du-inline-wrap">
                    {!photo.profilePhoto && photo.visibility !== "PRIVATE" && (
                      <button
                        type="button"
                        className="du-button du-button-small"
                        disabled={disabled}
                        onClick={() => setProfilePhoto(photo)}
                      >
                        Use as Profile
                      </button>
                    )}
                    <button
                      type="button"
                      className="du-button du-button-small"
                      disabled={disabled}
                      onClick={() => editCaption(photo)}
                    >
                      Edit Caption
                    </button>
                    <button
                      type="button"
                      className="du-button du-button-small"
                      disabled={disabled}
                      onClick={() => startFramingEdit(photo)}
                    >
                      Edit Framing
                    </button>
                    <select
                      className="du-select du-photo-visibility-select"
                      aria-label="Photo visibility"
                      value={photo.visibility}
                      disabled={disabled}
                      onChange={(event) =>
                        changeVisibility(
                          photo,
                          event.currentTarget.value as UserPhotoVisibility,
                        )
                      }
                    >
                      <option value="PRIVATE">Private</option>
                      <option value="MEMBERS_ONLY">Club Members</option>
                      <option value="PUBLIC">Public</option>
                    </select>
                    <button
                      type="button"
                      className="du-button du-button-small du-button-danger"
                      disabled={disabled}
                      onClick={() => deletePhoto(photo)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingPhotoId === photo.id && (
                  <div className="du-profile-photo-framing">
                    <ImageFocusPicker
                      imageUrl={photo.imageUrl}
                      framingProfiles={editingFraming}
                      onFramingProfilesChange={setEditingFraming}
                      imageAlt="Gallery photo"
                      disabled={disabled}
                    />
                    <div className="du-inline du-inline-sm du-inline-wrap">
                      <button
                        type="button"
                        className="du-button du-button-primary du-button-small"
                        disabled={disabled}
                        onClick={() => saveFraming(photo)}
                      >
                        Save Framing
                      </button>
                      <button
                        type="button"
                        className="du-button du-button-small"
                        disabled={disabled}
                        onClick={() => setEditingPhotoId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ProfilePhotosManager;
