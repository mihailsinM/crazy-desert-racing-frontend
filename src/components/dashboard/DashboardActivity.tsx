import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import DesertLiveMenuFilter from "../desert-live/DesertLiveMenuFilter";
import {
  desertLiveCategoryIcons,
  desertLiveCategoryOptions,
  type DesertLiveCategoryFilter,
} from "../desert-live/desertLiveOptions";
import {
  getDesertLiveAssetUrl,
  getRandomDesertLiveItems,
} from "../../services/desertLiveService";
import type { DesertLiveItem } from "../../types/desertLive";
import {
  createImageFocusPoint,
  getImageObjectPosition,
} from "../../utils/imageFocus";

type DashboardActivityProps = {
  title: string;
  viewAllPath: string;
  visibleItemCount: 3 | 4;
};

const DASHBOARD_ROTATION_ITEM_LIMIT = 12;

type DashboardActivityItemProps = {
  item: DesertLiveItem;
  onOpen: () => void;
};

function DashboardActivityItem({
  item,
  onOpen,
}: DashboardActivityItemProps) {
  const imageUrl = getDesertLiveAssetUrl(item.imageUrl);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage = imageUrl !== null && imageUrl !== failedImageUrl;
  const imageObjectPosition = getImageObjectPosition(
    createImageFocusPoint(item.imageFocusX, item.imageFocusY),
  );

  return (
    <button
      type="button"
      className="du-hub-card du-dashboard-activity-item"
      onClick={onOpen}
    >
      <span className="du-dashboard-activity-media" aria-hidden="true">
        {showImage ? (
          <img
            src={imageUrl}
            alt=""
            style={{ objectPosition: imageObjectPosition }}
            onError={() => setFailedImageUrl(imageUrl)}
          />
        ) : (
          <span>{desertLiveCategoryIcons[item.category]}</span>
        )}
      </span>

      <span className="du-dashboard-activity-content">
        <span className="du-dashboard-activity-title du-sand-text">
          {item.title}
        </span>
        <span className="du-dashboard-activity-description">
          {item.description}
        </span>
      </span>
    </button>
  );
}

function DashboardActivity({
  title,
  viewAllPath,
  visibleItemCount,
}: DashboardActivityProps) {
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<DesertLiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] =
    useState<DesertLiveCategoryFilter>("ALL");

  useEffect(() => {
    let active = true;

    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }

    async function loadItems(showLoading: boolean) {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const category = activeFilter === "ALL" ? undefined : activeFilter;
        const loadedItems = await getRandomDesertLiveItems(
          category,
          DASHBOARD_ROTATION_ITEM_LIMIT,
        );

        if (active) {
          setItems(loadedItems);
          setError("");
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load Desert Live updates",
          );
        }
      } finally {
        if (active && showLoading) {
          setIsLoading(false);
        }
      }
    }

    void loadItems(true);

    const rotationTimer = window.setInterval(() => {
      void loadItems(false);
    }, 30_000);

    return () => {
      active = false;
      window.clearInterval(rotationTimer);
    };
  }, [activeFilter, visibleItemCount]);

  return (
    <aside className="du-dashboard-card du-card-scroll du-dashboard-activity-panel">
      <div className="du-hub-header du-dashboard-activity-header">
        <h2>{title}</h2>

        <div className="du-dashboard-activity-actions">
          <DesertLiveMenuFilter
            buttonLabel="Filter"
            menuLabel="Show activity"
            value={activeFilter}
            options={desertLiveCategoryOptions}
            onChange={setActiveFilter}
          />

          <button
            type="button"
            className="du-button du-button-small du-button-rect"
            onClick={() => navigate(viewAllPath)}
          >
            View All
          </button>
        </div>
      </div>

      <div
        ref={listRef}
        className={
          items.length === 0
            ? `du-card-list du-soft-scroll du-list-${visibleItemCount} du-dashboard-activity-list du-dashboard-activity-list-empty`
            : `du-card-list du-soft-scroll du-list-${visibleItemCount} du-list-row-medium du-dashboard-activity-list`
        }
      >
        {items.map((item) => (
          <DashboardActivityItem
            key={item.id}
            item={item}
            onOpen={() => navigate(`/activity/${item.id}`)}
          />
        ))}

        {items.length === 0 && (
          <div className="du-dashboard-empty-state">
            <span aria-hidden="true">🏜</span>
            <p>
              {isLoading
                ? "Loading Desert Live..."
                : error || "No updates in this category yet."}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default DashboardActivity;
