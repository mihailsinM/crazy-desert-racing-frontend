import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { getDesertLiveImageFraming } from "../../utils/desertLiveImageFraming";
import FocalImage from "../images/FocalImage";

type DashboardActivityProps = {
  title: string;
  viewAllPath: string;
  addPath?: string;
  visibleItemCount: 3 | 4;
};

const DASHBOARD_ROTATION_ITEM_LIMIT = 12;

type DashboardActivityItemProps = {
  item: DesertLiveItem;
  onOpen: () => void;
  highlighted: boolean;
};

function DashboardActivityItem({
  item,
  onOpen,
  highlighted,
}: DashboardActivityItemProps) {
  const imageUrl = getDesertLiveAssetUrl(item.imageUrl);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage = imageUrl !== null && imageUrl !== failedImageUrl;
  const avatarFraming = getDesertLiveImageFraming(item).avatar;

  return (
    <button
      type="button"
      className={`du-hub-card du-dashboard-activity-item${highlighted ? " du-auto-highlight" : ""}`}
      onClick={onOpen}
    >
      <span className="du-dashboard-activity-media" aria-hidden="true">
        {showImage ? (
          <FocalImage
            src={imageUrl}
            alt=""
            focusX={avatarFraming.focusX}
            focusY={avatarFraming.focusY}
            cropPercent={avatarFraming.cropPercent}
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
        {(item.activeFrom || item.activeUntil) && <span className="du-dashboard-activity-period">
          {item.activeFrom ? new Date(item.activeFrom).toLocaleDateString() : "Now"} – {item.activeUntil ? new Date(item.activeUntil).toLocaleDateString() : "Ongoing"}
        </span>}
      </span>
    </button>
  );
}

function DashboardActivity({
  title,
  viewAllPath,
  addPath,
  visibleItemCount,
}: DashboardActivityProps) {
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<DesertLiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);

  const [activeFilter, setActiveFilter] =
    useState<DesertLiveCategoryFilter>("ALL");

  useLayoutEffect(() => {
    if (!isRolling && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [isRolling]);

  useEffect(() => {
    let active = true;

    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }

    async function loadItems() {
      setIsLoading(true);
      setIsRolling(false);

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
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadItems();

    return () => {
      active = false;
    };
  }, [activeFilter, refreshIndex]);

  useEffect(() => {
    if (isLoading || items.length < 2) {
      return;
    }

    let finishingTimer: number | null = null;
    let rolling = false;
    const rotationTimer = window.setInterval(() => {
      const list = listRef.current;
      if (document.visibilityState !== "visible" || !list || rolling
        || list.matches(":hover") || list.contains(document.activeElement)) {
        return;
      }

      if (list.scrollTop > 0) {
        list.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setItems((current) => {
        if (current.length <= visibleItemCount) {
          return current;
        }

        const nextItems = [...current];
        const randomIndex = visibleItemCount + Math.floor(
          Math.random() * (current.length - visibleItemCount),
        );
        [nextItems[visibleItemCount], nextItems[randomIndex]] = [
          nextItems[randomIndex], nextItems[visibleItemCount],
        ];
        return nextItems;
      });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setItems((current) => [...current.slice(1), current[0]]);
        return;
      }

      rolling = true;
      setIsRolling(true);
      finishingTimer = window.setTimeout(() => {
        setItems((current) => [...current.slice(1), current[0]]);
        setIsRolling(false);
        rolling = false;
        finishingTimer = null;
      }, 1_150);
    }, 15_000);

    return () => {
      window.clearInterval(rotationTimer);
      if (finishingTimer !== null) {
        window.clearTimeout(finishingTimer);
      }
    };
  }, [items.length, isLoading, visibleItemCount]);

  const displayedItems = isRolling && items.length <= visibleItemCount
    ? [...items, items[0]]
    : items;

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
            onClick={() => setRefreshIndex((current) => current + 1)}
            disabled={isLoading}
          >
            Refresh
          </button>

          {addPath && <button
            type="button"
            className="du-button du-button-small du-button-rect"
            onClick={() => navigate(addPath)}
          >+ Add</button>}

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
            : `du-card-list du-soft-scroll du-list-${visibleItemCount} du-list-row-medium du-dashboard-activity-list${isRolling ? " du-dashboard-activity-list-rolling" : ""}`
        }
      >
        {displayedItems.map((item, index) => (
          <DashboardActivityItem
            key={index === items.length ? `rolling-${item.id}` : item.id}
            item={item}
            highlighted={!isRolling && items.length > 1 && index === Math.min(
              Math.floor(visibleItemCount / 2), items.length - 1,
            )}
            onOpen={() =>
              navigate(
                item.linkedRaceId
                  ? `/races/${item.linkedRaceId}`
                  : `/activity/${item.id}`,
              )
            }
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
