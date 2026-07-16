import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export type DashboardActivityType =
  | "RACE"
  | "FESTIVAL"
  | "MARKETPLACE"
  | "COMMUNITY"
  | "NEWS";

export type DashboardActivityItem = {
  id: string;
  type: DashboardActivityType;
  title: string;
  text: string;
  path: string;
};

type DashboardActivityFilter = "ALL" | DashboardActivityType;

type DashboardActivityProps = {
  title: string;
  items: DashboardActivityItem[];
  viewAllPath: string;
};

type FilterOption = {
  value: DashboardActivityFilter;
  label: string;
  icon: string;
};

const filterOptions: FilterOption[] = [
  {
    value: "ALL",
    label: "All updates",
    icon: "✨",
  },
  {
    value: "RACE",
    label: "Races",
    icon: "🏁",
  },
  {
    value: "FESTIVAL",
    label: "Festivals",
    icon: "🎵",
  },
  {
    value: "MARKETPLACE",
    label: "Marketplace",
    icon: "🛒",
  },
  {
    value: "COMMUNITY",
    label: "Community",
    icon: "👥",
  },
  {
    value: "NEWS",
    label: "News",
    icon: "🔥",
  },
];

function DashboardActivity({
  title,
  items,
  viewAllPath,
}: DashboardActivityProps) {
  const navigate = useNavigate();

  const filterRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] =
    useState<DashboardActivityFilter>("ALL");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const visibleItems = useMemo(() => {
    if (activeFilter === "ALL") {
      return items;
    }
    return items.filter((item) => item.type === activeFilter);
  }, [activeFilter, items]);

  const activeFilterLabel =
    filterOptions.find((option) => option.value === activeFilter)?.label ??
    "All updates";

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function selectFilter(filter: DashboardActivityFilter) {
    setActiveFilter(filter);
    setIsFilterOpen(false);
  }

  return (
    <aside className="du-dashboard-card du-card-scroll">
      <div className="du-hub-header du-dashboard-activity-header">
        <h2>{title}</h2>

        <div className="du-dashboard-activity-actions">
          <div ref={filterRef} className="du-dashboard-filter">
            <button
              type="button"
              className="du-button du-button-small du-filter-trigger"
              aria-expanded={isFilterOpen}
              aria-haspopup="menu"
              onClick={() => setIsFilterOpen((current) => !current)}
            >
              <span aria-hidden="true">⏷</span>
              Filter
            </button>

            {isFilterOpen && (
              <div
                className="du-filter-menu"
                role="menu"
                aria-label="Filter Desert Live"
              >
                <div className="du-filter-menu-header">
                  <span>Show activity</span>
                  <strong>{activeFilterLabel}</strong>
                </div>

                {filterOptions.map((option) => {
                  const isActive = option.value === activeFilter;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={isActive}
                      className={
                        isActive
                          ? "du-filter-option du-filter-option-active"
                          : "du-filter-option"
                      }
                      onClick={() => selectFilter(option.value)}
                    >
                      <span className="du-filter-option-icon">
                        {option.icon}
                      </span>

                      <span>{option.label}</span>

                      {isActive && (
                        <span
                          className="du-filter-option-check"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            className="du-button du-button-small"
            onClick={() => navigate(viewAllPath)}
          >
            View All
          </button>
        </div>
      </div>

      <div
        className={
          visibleItems.length === 0
            ? "du-card-list du-soft-scroll du-dashboard-activity-list du-dashboard-activity-list-empty"
            : "du-card-list du-soft-scroll du-list-3 du-list-row-medium du-dashboard-activity-list"
        }
      >
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="du-hub-card du-dashboard-activity-item"
            onClick={() => navigate(item.path)}
          >
            <h3>
              <span className="du-sand-text">{item.title}</span>
            </h3>

            <p>{item.text}</p>
          </button>
        ))}

        {visibleItems.length === 0 && (
          <div className="du-dashboard-empty-state">
            <span aria-hidden="true">🏜</span>
            <p>No updates in this category yet.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default DashboardActivity;
