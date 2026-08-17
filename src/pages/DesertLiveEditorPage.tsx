import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  desertLiveCategoryIcons,
  desertLiveCategoryLabels,
} from "../components/desert-live/desertLiveOptions";
import { isDesertLiveTargetUrlAllowed } from "../components/desert-live/desertLiveLinks";
import { useAuth } from "../context/authContext";
import {
  createAdminDesertLiveItem,
  createMyDesertLiveItem,
  deleteAdminDesertLiveImage,
  deleteMyDesertLiveImage,
  getAdminDesertLiveItem,
  getDesertLiveAssetUrl,
  getMyDesertLiveItem,
  updateAdminDesertLiveImage,
  updateAdminDesertLiveItem,
  updateMyDesertLiveImage,
  updateMyDesertLiveItem,
} from "../services/desertLiveService";
import type {
  DesertLiveCategory,
  DesertLiveItem,
  DesertLiveWriteRequest,
} from "../types/desertLive";
import raceBackground from "../assets/race.png";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const categories = Object.keys(
  desertLiveCategoryLabels,
) as DesertLiveCategory[];

type DesertLiveEditorPageProps = {
  editScope?: "MY" | "ADMIN";
};

function toLocalDateTime(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}

function toApiDateTime(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

function DesertLiveEditorPage({
  editScope = "MY",
}: DesertLiveEditorPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const itemId = id ? Number(id) : null;
  const isEditing = itemId !== null;
  const usesAdminApi =
    currentUser?.role === "ADMIN" && (!isEditing || editScope === "ADMIN");

  const [existingItem, setExistingItem] =
    useState<DesertLiveItem | null>(null);
  const [category, setCategory] = useState<DesertLiveCategory>("RACE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [activeFrom, setActiveFrom] = useState("");
  const [activeUntil, setActiveUntil] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);
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

  useEffect(() => {
    let active = true;

    async function loadItem() {
      if (!isEditing || itemId === null) {
        return;
      }

      if (!Number.isInteger(itemId) || itemId < 1) {
        setError("Invalid Desert Live publication");
        setLoading(false);
        return;
      }

      try {
        const item = usesAdminApi
          ? await getAdminDesertLiveItem(itemId)
          : await getMyDesertLiveItem(itemId);

        if (active) {
          setExistingItem(item);
          setCategory(item.category);
          setTitle(item.title);
          setDescription(item.description);
          setTargetUrl(item.targetUrl ?? "");
          setActiveFrom(toLocalDateTime(item.activeFrom));
          setActiveUntil(toLocalDateTime(item.activeUntil));
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load publication",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadItem();

    return () => {
      active = false;
    };
  }, [isEditing, itemId, usesAdminApi]);

  function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const image = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";

    if (!image) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }

    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Publication image must be 2 MB or smaller.");
      return;
    }

    setError("");
    setSelectedImage(image);
  }

  function createRequest(): DesertLiveWriteRequest {
    return {
      category,
      title: title.trim(),
      description: description.trim(),
      targetUrl: targetUrl.trim() || null,
      activeFrom: toApiDateTime(activeFrom),
      activeUntil: toApiDateTime(activeUntil),
    };
  }

  async function saveImage(item: DesertLiveItem): Promise<DesertLiveItem> {
    if (!selectedImage) {
      return item;
    }

    return usesAdminApi
      ? updateAdminDesertLiveImage(item.id, selectedImage)
      : updateMyDesertLiveImage(item.id, selectedImage);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    if (targetUrl.trim() && !isDesertLiveTargetUrlAllowed(targetUrl)) {
      setError("Use an internal /path or a complete http:// or https:// link.");
      return;
    }

    if (
      activeFrom &&
      activeUntil &&
      new Date(activeUntil).getTime() <= new Date(activeFrom).getTime()
    ) {
      setError("Active until must be later than active from.");
      return;
    }

    setSaving(true);

    try {
      const request = createRequest();
      let savedItem: DesertLiveItem;

      const persistedItemId = itemId ?? existingItem?.id ?? null;

      if (persistedItemId !== null) {
        savedItem = usesAdminApi
          ? await updateAdminDesertLiveItem(persistedItemId, request)
          : await updateMyDesertLiveItem(persistedItemId, request);
      } else {
        savedItem = usesAdminApi
          ? await createAdminDesertLiveItem(request)
          : await createMyDesertLiveItem(request);
      }

      setExistingItem(savedItem);
      savedItem = await saveImage(savedItem);

      navigate(
        usesAdminApi || savedItem.moderationStatus === "APPROVED"
          ? `/activity/${savedItem.id}`
          : "/activity/my",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to save publication",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleImageDelete() {
    if (!existingItem?.imageUrl) {
      return;
    }

    setImageSaving(true);
    setError("");

    try {
      const updatedItem = usesAdminApi
        ? await deleteAdminDesertLiveImage(existingItem.id)
        : await deleteMyDesertLiveImage(existingItem.id);

      setExistingItem(updatedItem);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to remove publication image",
      );
    } finally {
      setImageSaving(false);
    }
  }

  if (loading) {
    return <p className="du-sand-text">Loading publication editor...</p>;
  }

  const currentImageUrl = getDesertLiveAssetUrl(existingItem?.imageUrl ?? null);
  const previewUrl = selectedImagePreview ?? currentImageUrl;

  return (
    <section className="du-page">
      <article
        className="du-details-card du-desert-live-editor-page"
        style={{ backgroundImage: `url(${raceBackground})` }}
      >
        <div className="du-details-overlay du-details-overlay-top du-desert-live-editor-overlay">
          <header className="du-desert-live-page-header">
            <div>
              <p className="du-details-eyebrow">Desert Live</p>
              <h1 className="du-details-title">
                {isEditing || existingItem
                  ? "Edit Publication"
                  : "Post Advertisement"}
              </h1>
            </div>
            <button
              type="button"
              className="du-button du-button-small du-button-rect du-button-back"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </header>

          <form className="du-form du-desert-live-editor" onSubmit={handleSubmit}>
            <div className="du-desert-live-editor-fields">
              <label className="du-field">
                <span className="du-field-label">Category</span>
                <select
                  className="du-select"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as DesertLiveCategory)
                  }
                >
                  {categories.map((categoryOption) => (
                    <option key={categoryOption} value={categoryOption}>
                      {desertLiveCategoryLabels[categoryOption]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="du-field">
                <span className="du-field-label">Title</span>
                <input
                  className="du-input"
                  maxLength={120}
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label className="du-field du-desert-live-editor-wide">
                <span className="du-field-label">Description</span>
                <textarea
                  className="du-textarea"
                  maxLength={1000}
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>

              <label className="du-field du-desert-live-editor-wide">
                <span className="du-field-label">Destination link (optional)</span>
                <input
                  className="du-input"
                  maxLength={500}
                  placeholder="/races or https://..."
                  value={targetUrl}
                  onChange={(event) => setTargetUrl(event.target.value)}
                />
              </label>

              <label className="du-field">
                <span className="du-field-label">Active from (optional)</span>
                <input
                  className="du-input"
                  type="datetime-local"
                  value={activeFrom}
                  onChange={(event) => setActiveFrom(event.target.value)}
                />
              </label>

              <label className="du-field">
                <span className="du-field-label">Active until (optional)</span>
                <input
                  className="du-input"
                  type="datetime-local"
                  value={activeUntil}
                  onChange={(event) => setActiveUntil(event.target.value)}
                />
              </label>
            </div>

            <div className="du-desert-live-image-editor">
              <div className="du-desert-live-image-preview">
                {previewUrl ? (
                  <img src={previewUrl} alt="Publication preview" />
                ) : (
                  <span aria-hidden="true">
                    {desertLiveCategoryIcons[category]}
                  </span>
                )}
              </div>

              <div>
                <p className="du-field-label">Publication image</p>
                <p className="du-caption">JPG, PNG, or WebP · maximum 2 MB</p>
                <div className="du-inline du-inline-sm du-inline-wrap">
                  <label className="du-button du-button-small du-button-rect du-button-inline du-file-button">
                    {previewUrl ? "Change Image" : "Add Image"}
                    <input
                      hidden
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={selectImage}
                    />
                  </label>

                  {selectedImage && (
                    <button
                      type="button"
                      className="du-button du-button-small du-button-rect"
                      onClick={() => setSelectedImage(null)}
                    >
                      Undo Selection
                    </button>
                  )}

                  {existingItem?.imageUrl && !selectedImage && (
                    <button
                      type="button"
                      className="du-button du-button-small du-button-rect du-button-danger"
                      disabled={imageSaving}
                      onClick={handleImageDelete}
                    >
                      {imageSaving ? "Removing..." : "Remove Image"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {error && <p className="du-error">{error}</p>}

            {!usesAdminApi && (
              <p className="du-caption">
                New and edited user publications are sent to an administrator for review.
              </p>
            )}

            <div className="du-inline du-inline-sm du-inline-wrap">
              <button
                type="submit"
                className="du-button du-button-primary du-button-small du-button-rect"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : usesAdminApi
                    ? "Publish Now"
                    : "Submit for Review"}
              </button>
              <button
                type="button"
                className="du-button du-button-small du-button-rect"
                disabled={saving}
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </article>
    </section>
  );
}

export default DesertLiveEditorPage;
