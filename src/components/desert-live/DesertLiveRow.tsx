import { useState } from "react";

import { getDesertLiveAssetUrl } from "../../services/desertLiveService";
import type { DesertLiveItem } from "../../types/desertLive";
import {
  desertLiveCategoryIcons,
  desertLiveCategoryLabels,
} from "./desertLiveOptions";

type DesertLiveRowProps = {
  item: DesertLiveItem;
  busy?: boolean;
  showModerationActions?: boolean;
  showOwnerActions?: boolean;
  onView?: (item: DesertLiveItem) => void;
  onApprove?: (item: DesertLiveItem) => void;
  onReject?: (item: DesertLiveItem) => void;
  onEdit?: (item: DesertLiveItem) => void;
  onDelete?: (item: DesertLiveItem) => void;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DesertLiveRow({
  item,
  busy = false,
  showModerationActions = false,
  showOwnerActions = false,
  onView,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: DesertLiveRowProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getDesertLiveAssetUrl(item.imageUrl);
  const showImage = imageUrl !== null && !imageFailed;

  return (
    <article className="du-row-panel du-desert-live-row">
      <div className="du-desert-live-row-media" aria-hidden={!showImage}>
        {showImage ? (
          <img
            src={imageUrl}
            alt=""
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span aria-hidden="true">
            {desertLiveCategoryIcons[item.category]}
          </span>
        )}
      </div>

      <div className="du-row-main du-desert-live-row-main">
        <div className="du-desert-live-row-heading">
          <span className="du-row-title">{item.title}</span>
          <span
            className={`du-status du-status-small du-status-${item.moderationStatus.toLowerCase()}`}
          >
            {item.moderationStatus}
          </span>
        </div>

        <span className="du-row-subtitle du-desert-live-row-description">
          {item.description}
        </span>

        <span className="du-desert-live-row-meta">
          {desertLiveCategoryLabels[item.category]}
          {" · "}
          {item.authorName}
          {" · "}
          {formatDate(item.createdAt)}
        </span>
      </div>

      <div className="du-row-actions du-desert-live-row-actions">
        {showModerationActions &&
          item.moderationStatus !== "APPROVED" && (
            <button
              type="button"
              className="du-button du-button-primary du-button-small du-button-rect"
              onClick={() => onApprove?.(item)}
              disabled={busy}
            >
              Approve
            </button>
          )}

        {showModerationActions &&
          item.moderationStatus !== "REJECTED" && (
            <button
              type="button"
              className="du-button du-button-small du-button-rect du-button-danger"
              onClick={() => onReject?.(item)}
              disabled={busy}
            >
              Reject
            </button>
          )}

        {showOwnerActions && (
          <>
            <button
              type="button"
              className="du-button du-button-small du-button-rect"
              onClick={() => onEdit?.(item)}
              disabled={busy}
            >
              Edit
            </button>
            <button
              type="button"
              className="du-button du-button-small du-button-rect du-button-danger"
              onClick={() => onDelete?.(item)}
              disabled={busy}
            >
              Delete
            </button>
          </>
        )}

        {onView && (
          <button
            type="button"
            className="du-button du-button-small du-button-rect"
            onClick={() => onView(item)}
            disabled={busy}
          >
            View Details
          </button>
        )}
      </div>
    </article>
  );
}

export default DesertLiveRow;
