import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  desertLiveCategoryIcons,
  desertLiveCategoryLabels,
} from "../components/desert-live/desertLiveOptions";
import { isDesertLiveTargetUrlAllowed } from "../components/desert-live/desertLiveLinks";
import FocalImage from "../components/images/FocalImage";
import { useAuth } from "../context/authContext";
import {
  deleteAdminDesertLiveItem,
  deleteMyDesertLiveItem,
  getAdminDesertLiveItem,
  getDesertLiveAssetUrl,
  getMyDesertLiveItem,
  getPublicDesertLiveItem,
} from "../services/desertLiveService";
import type { DesertLiveItem } from "../types/desertLive";
import raceBackground from "../assets/race.png";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type DesertLiveDetailsPageProps = {
  itemScope?: "PUBLIC" | "MY";
};

function DesertLiveDetailsPage({
  itemScope = "PUBLIC",
}: DesertLiveDetailsPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const itemId = Number(id);
  const isAdmin = currentUser?.role === "ADMIN";
  const usesMyApi = itemScope === "MY";

  const [item, setItem] = useState<DesertLiveItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadItem() {
      if (!Number.isInteger(itemId) || itemId < 1) {
        setError("Invalid Desert Live publication");
        setLoading(false);
        return;
      }

      try {
        const loadedItem = usesMyApi
          ? await getMyDesertLiveItem(itemId)
          : isAdmin
            ? await getAdminDesertLiveItem(itemId)
            : await getPublicDesertLiveItem(itemId);

        if (active) {
          setItem(loadedItem);
          setError("");
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
  }, [isAdmin, itemId, usesMyApi]);

  if (loading) {
    return <p className="du-sand-text">Loading publication...</p>;
  }

  if (!item || error) {
    return (
      <section className="du-panel">
        <p className="du-error">{error || "Publication not found"}</p>
        <button
          type="button"
          className="du-button du-button-small du-button-rect"
          onClick={() => navigate("/activity")}
        >
          Back to Desert Live
        </button>
      </section>
    );
  }

  const itemImageUrl = getDesertLiveAssetUrl(item.imageUrl);
  const canManage = isAdmin || currentUser?.id === item.authorId;
  const hasAllowedTargetUrl = Boolean(
    item.targetUrl && isDesertLiveTargetUrlAllowed(item.targetUrl),
  );

  function openTargetUrl() {
    if (!item?.targetUrl) {
      return;
    }

    if (item.targetUrl.startsWith("/")) {
      navigate(item.targetUrl);
      return;
    }

    window.open(item.targetUrl, "_blank", "noopener,noreferrer");
  }

  async function handleDelete() {
    if (!item) {
      return;
    }

    setDeleting(true);
    setActionError("");

    try {
      if (usesMyApi || !isAdmin) {
        await deleteMyDesertLiveItem(item.id);
      } else {
        await deleteAdminDesertLiveItem(item.id);
      }

      navigate(usesMyApi ? "/activity/my" : "/activity");
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete publication",
      );
      setDeleting(false);
    }
  }

  return (
    <section className="du-page">
      <article
        className="du-details-card du-desert-live-details"
      >
        <FocalImage
          src={itemImageUrl ?? raceBackground}
          alt=""
          focusX={itemImageUrl ? item.imageFocusX : 50}
          focusY={itemImageUrl ? item.imageFocusY : 50}
          className="du-details-media"
          aria-hidden="true"
        />
        <div className="du-details-overlay du-details-overlay-top du-desert-live-details-overlay">
          <div className="du-desert-live-details-topline">
            <p className="du-details-eyebrow">
              {desertLiveCategoryIcons[item.category]}{" "}
              {desertLiveCategoryLabels[item.category]}
            </p>
            <span
              className={`du-status du-status-${item.moderationStatus.toLowerCase()}`}
            >
              {item.moderationStatus}
            </span>
          </div>

          <h1 className="du-details-title">{item.title}</h1>

          <div className="du-desert-live-details-meta">
            <span>By {item.authorName}</span>
            <span>{formatDate(item.createdAt)}</span>
          </div>

          <p className="du-details-description du-desert-live-details-description">
            {item.description}
          </p>

          {item.moderationNote && (
            <div className="du-details-message">
              <p className="du-details-message-title">Moderation note</p>
              <p>{item.moderationNote}</p>
            </div>
          )}

          <div className="du-inline du-inline-sm du-inline-wrap du-push-bottom">
            <button
              type="button"
              className="du-button du-button-small du-button-rect du-button-back"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>

            {hasAllowedTargetUrl && (
              <button
                type="button"
                className="du-button du-button-primary du-button-small du-button-rect"
                onClick={openTargetUrl}
              >
                Open Link
              </button>
            )}

            {canManage && (
              <button
                type="button"
                className="du-button du-button-small du-button-rect"
                onClick={() =>
                  navigate(
                    isAdmin && !usesMyApi
                      ? `/activity/admin/${item.id}/edit`
                      : `/activity/my/${item.id}/edit`,
                  )
                }
              >
                Edit Publication
              </button>
            )}

            {canManage && (
              <button
                type="button"
                className="du-button du-button-small du-button-rect du-button-danger"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Publication
              </button>
            )}
          </div>
        </div>

        {deleteDialogOpen && (
          <div className="du-desert-live-dialog-backdrop">
            <div
              className="du-panel du-desert-live-dialog"
              role="dialog"
              aria-modal="true"
            >
              <p className="du-eyebrow">Desert Live</p>
              <h2>Delete publication?</h2>
              <p className="du-text-soft">
                “{item.title}” and its image will be removed.
              </p>
              {actionError && <p className="du-error">{actionError}</p>}
              <div className="du-inline du-inline-sm du-inline-wrap du-mt-lg">
                <button
                  type="button"
                  className="du-button du-button-danger du-button-rect du-button-small"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  className="du-button du-button-rect du-button-small"
                  disabled={deleting}
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setActionError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}

export default DesertLiveDetailsPage;
