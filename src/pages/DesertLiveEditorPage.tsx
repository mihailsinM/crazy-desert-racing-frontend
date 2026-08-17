import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  desertLiveCategoryIcons,
  desertLiveCategorySelectOptions,
} from "../components/desert-live/desertLiveOptions";
import DesertLiveMenuFilter from "../components/desert-live/DesertLiveMenuFilter";
import ImageFocusPicker from "../components/images/ImageFocusPicker";
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
  updateAdminDesertLiveImageFocus,
  updateAdminDesertLiveItem,
  updateMyDesertLiveImage,
  updateMyDesertLiveImageFocus,
  updateMyDesertLiveItem,
} from "../services/desertLiveService";
import type {
  DesertLiveCategory,
  DesertLiveItem,
  DesertLiveWriteRequest,
} from "../types/desertLive";
import raceBackground from "../assets/race.png";
import {
  compressImageForUpload,
  DEFAULT_MAX_SOURCE_IMAGE_BYTES,
} from "../utils/imageCompression";
import {
  CENTER_IMAGE_FOCUS,
  createImageFocusPoint,
  getImageObjectPosition,
  imageFocusPointsEqual,
  type ImageFocusPoint,
} from "../utils/imageFocus";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SOURCE_IMAGE_SIZE_MB = Math.round(
  DEFAULT_MAX_SOURCE_IMAGE_BYTES / 1024 / 1024,
);

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

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function getItemImageFocus(item: DesertLiveItem): ImageFocusPoint {
  return createImageFocusPoint(item.imageFocusX, item.imageFocusY);
}

function dateTimesEqual(
  first: string | null,
  second: string | null,
): boolean {
  return toLocalDateTime(first) === toLocalDateTime(second);
}

function itemMatchesRequest(
  item: DesertLiveItem,
  request: DesertLiveWriteRequest,
): boolean {
  return (
    item.category === request.category &&
    item.title === request.title &&
    item.description === request.description &&
    item.targetUrl === request.targetUrl &&
    dateTimesEqual(item.activeFrom, request.activeFrom) &&
    dateTimesEqual(item.activeUntil, request.activeUntil)
  );
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
  const [imageFocus, setImageFocus] = useState<ImageFocusPoint>({
    ...CENTER_IMAGE_FOCUS,
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);
  const [imageOptimizing, setImageOptimizing] = useState(false);
  const [imageOptimizationMessage, setImageOptimizationMessage] = useState("");
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
          setImageFocus(getItemImageFocus(item));
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

  async function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const image = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";

    if (!image) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }

    if (image.size > DEFAULT_MAX_SOURCE_IMAGE_BYTES) {
      setError(`Choose an image smaller than ${MAX_SOURCE_IMAGE_SIZE_MB} MB.`);
      return;
    }

    setImageOptimizing(true);
    setError("");

    try {
      const optimizedImage = await compressImageForUpload(image, {
        maxBytes: MAX_IMAGE_SIZE_BYTES,
        maxDimension: 1600,
        maxSourceBytes: DEFAULT_MAX_SOURCE_IMAGE_BYTES,
        outputType: "image/webp",
      });

      setSelectedImage(optimizedImage);
      setImageFocus({ ...CENTER_IMAGE_FOCUS });
      setImageOptimizationMessage(
        optimizedImage === image
          ? `Ready to upload · ${formatFileSize(optimizedImage.size)}`
          : `Optimized ${formatFileSize(image.size)} → ${formatFileSize(optimizedImage.size)}`,
      );
    } catch (caughtError) {
      setSelectedImage(null);
      setImageOptimizationMessage("");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to optimize the selected image.",
      );
    } finally {
      setImageOptimizing(false);
    }
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
    if (selectedImage) {
      return usesAdminApi
        ? updateAdminDesertLiveImage(item.id, selectedImage, imageFocus)
        : updateMyDesertLiveImage(item.id, selectedImage, imageFocus);
    }

    if (
      item.imageUrl &&
      !imageFocusPointsEqual(imageFocus, getItemImageFocus(item))
    ) {
      return usesAdminApi
        ? updateAdminDesertLiveImageFocus(item.id, imageFocus)
        : updateMyDesertLiveImageFocus(item.id, imageFocus);
    }

    return item;
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
        if (existingItem && itemMatchesRequest(existingItem, request)) {
          savedItem = existingItem;
        } else {
          savedItem = usesAdminApi
            ? await updateAdminDesertLiveItem(persistedItemId, request)
            : await updateMyDesertLiveItem(persistedItemId, request);
        }
      } else {
        savedItem = usesAdminApi
          ? await createAdminDesertLiveItem(request)
          : await createMyDesertLiveItem(request);
      }

      setExistingItem(savedItem);
      savedItem = await saveImage(savedItem);
      setExistingItem(savedItem);

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
      setImageFocus(getItemImageFocus(updatedItem));
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
  const previewObjectPosition = getImageObjectPosition(imageFocus);
  const hasContentChanges = existingItem
    ? !itemMatchesRequest(existingItem, createRequest())
    : true;
  const hasFocusChanges = existingItem
    ? !imageFocusPointsEqual(imageFocus, getItemImageFocus(existingItem))
    : false;
  const isFocusOnlySave = Boolean(
    existingItem?.imageUrl &&
    !selectedImage &&
    !hasContentChanges &&
    hasFocusChanges,
  );
  let submitLabel = usesAdminApi ? "Publish Now" : "Submit for Review";

  if (isFocusOnlySave) {
    submitLabel = "Save Image Focus";
  } else if (isEditing) {
    submitLabel = usesAdminApi ? "Save Changes" : "Submit Changes";
  }

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
              <div className="du-field">
                <span className="du-field-label">Category</span>
                <DesertLiveMenuFilter
                  buttonLabel="Category"
                  menuLabel="Choose category"
                  value={category}
                  options={desertLiveCategorySelectOptions}
                  onChange={setCategory}
                  variant="SELECT"
                />
              </div>

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
                  <img
                    src={previewUrl}
                    alt="Publication preview"
                    style={{ objectPosition: previewObjectPosition }}
                  />
                ) : (
                  <span aria-hidden="true">
                    {desertLiveCategoryIcons[category]}
                  </span>
                )}
              </div>

              <div className="du-desert-live-image-controls">
                <p className="du-field-label">Publication image</p>
                <p className="du-caption">
                  JPG, PNG, or WebP · photos up to {MAX_SOURCE_IMAGE_SIZE_MB} MB
                  are optimized automatically
                </p>
                {imageOptimizationMessage && (
                  <p className="du-image-optimization-message">
                    {imageOptimizationMessage}
                  </p>
                )}
                <div className="du-inline du-inline-sm du-inline-wrap">
                  <label
                    className={
                      imageOptimizing
                        ? "du-button du-button-small du-button-rect du-button-inline du-file-button du-file-button-disabled"
                        : "du-button du-button-small du-button-rect du-button-inline du-file-button"
                    }
                    aria-disabled={imageOptimizing}
                  >
                    {imageOptimizing
                      ? "Optimizing..."
                      : previewUrl
                        ? "Change Image"
                        : "Add Image"}
                    <input
                      hidden
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={imageOptimizing}
                      onChange={selectImage}
                    />
                  </label>

                  {selectedImage && (
                    <button
                      type="button"
                      className="du-button du-button-small du-button-rect"
                      onClick={() => {
                        setSelectedImage(null);
                        setImageOptimizationMessage("");
                        setImageFocus(
                          existingItem
                            ? getItemImageFocus(existingItem)
                            : { ...CENTER_IMAGE_FOCUS },
                        );
                      }}
                    >
                      {existingItem?.imageUrl
                        ? "Keep Current Image"
                        : "Remove Image"}
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

              {previewUrl && (
                <ImageFocusPicker
                  imageUrl={previewUrl}
                  value={imageFocus}
                  onChange={setImageFocus}
                  disabled={saving || imageSaving || imageOptimizing}
                />
              )}
            </div>

            {error && <p className="du-error">{error}</p>}

            {!usesAdminApi && (
              <p className="du-caption">
                New publications, replaced images, and content changes are sent
                to an administrator for review. Changing only the image focus
                keeps the current moderation status.
              </p>
            )}

            <div className="du-inline du-inline-sm du-inline-wrap">
              <button
                type="submit"
                className="du-button du-button-primary du-button-small du-button-rect"
                disabled={saving || imageOptimizing}
              >
                {saving ? "Saving..." : submitLabel}
              </button>
              <button
                type="button"
                className="du-button du-button-small du-button-rect"
                disabled={saving || imageOptimizing}
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
