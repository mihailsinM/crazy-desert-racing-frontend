import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DesertLiveMenuFilter from "../components/desert-live/DesertLiveMenuFilter";
import DesertLiveRow from "../components/desert-live/DesertLiveRow";
import {
  desertLiveCategoryOptions,
  desertLiveStatusOptions,
  type DesertLiveCategoryFilter,
  type DesertLiveStatusFilter,
} from "../components/desert-live/desertLiveOptions";
import { useAuth } from "../context/authContext";
import {
  approveDesertLiveItem,
  deleteMyDesertLiveItem,
  getAdminDesertLiveItems,
  getMyDesertLiveItems,
  getPublicDesertLiveItems,
  rejectDesertLiveItem,
} from "../services/desertLiveService";
import type {
  DesertLiveItem,
  DesertLivePage as DesertLivePageData,
} from "../types/desertLive";
import raceBackground from "../assets/race.png";

type DesertLivePageProps = {
  scope?: "PUBLIC" | "MY";
};

const emptyPage: DesertLivePageData = {
  items: [],
  page: 0,
  size: 20,
  totalItems: 0,
  totalPages: 0,
};

function DesertLivePage({ scope = "PUBLIC" }: DesertLivePageProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const isMyPage = scope === "MY";

  const [category, setCategory] =
    useState<DesertLiveCategoryFilter>("ALL");
  const [status, setStatus] = useState<DesertLiveStatusFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageData, setPageData] = useState(emptyPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [rejectingItem, setRejectingItem] =
    useState<DesertLiveItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deletingItem, setDeletingItem] =
    useState<DesertLiveItem | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPageIndex(0);
    }, 300);

    return () => window.clearTimeout(debounceTimer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    async function loadItems() {
      setLoading(true);

      try {
        const query = {
          category: category === "ALL" ? undefined : category,
          status: status === "ALL" ? undefined : status,
          search,
          page: pageIndex,
          size: 20,
        };

        const loadedPage = isMyPage
          ? await getMyDesertLiveItems(query)
          : isAdmin
            ? await getAdminDesertLiveItems(query)
            : await getPublicDesertLiveItems(query);

        if (active) {
          setPageData(loadedPage);
          setError("");
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load Desert Live",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadItems();

    return () => {
      active = false;
    };
  }, [category, isAdmin, isMyPage, pageIndex, reloadVersion, search, status]);

  function refreshItems() {
    setReloadVersion((current) => current + 1);
  }

  async function handleApprove(item: DesertLiveItem) {
    setBusyItemId(item.id);
    setError("");

    try {
      await approveDesertLiveItem(item.id);
      refreshItems();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to approve publication",
      );
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleReject() {
    if (!rejectingItem || !rejectReason.trim()) {
      return;
    }

    setBusyItemId(rejectingItem.id);
    setError("");

    try {
      await rejectDesertLiveItem(rejectingItem.id, rejectReason.trim());
      setRejectingItem(null);
      setRejectReason("");
      refreshItems();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to reject publication",
      );
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleDelete() {
    if (!deletingItem) {
      return;
    }

    setBusyItemId(deletingItem.id);
    setError("");

    try {
      await deleteMyDesertLiveItem(deletingItem.id);
      setDeletingItem(null);
      refreshItems();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete publication",
      );
    } finally {
      setBusyItemId(null);
    }
  }

  function changeCategory(value: DesertLiveCategoryFilter) {
    setCategory(value);
    setPageIndex(0);
  }

  function changeStatus(value: DesertLiveStatusFilter) {
    setStatus(value);
    setPageIndex(0);
  }

  return (
    <section className="du-page">
      <article
        className="du-details-card du-desert-live-page"
        style={{ backgroundImage: `url(${raceBackground})` }}
      >
        <div className="du-details-overlay du-details-overlay-top du-desert-live-overlay">
          <header className="du-desert-live-page-header">
            <div>
              <p className="du-details-eyebrow">
                {isMyPage ? "My Desert Live" : "Club Activity"}
              </p>
              <h1 className="du-details-title">
                {isMyPage ? "My Publications" : "Desert Live"}
              </h1>
            </div>

            <div className="du-desert-live-primary-actions">
              {!isMyPage && (
                <button
                  type="button"
                  className="du-button du-button-small du-button-rect"
                  onClick={() => navigate("/activity/my")}
                >
                  My Posts
                </button>
              )}
              <button
                type="button"
                className="du-button du-button-primary du-button-small du-button-rect"
                onClick={() => navigate("/activity/new")}
              >
                Post Advertisement
              </button>
            </div>
          </header>

          <div className="du-desert-live-toolbar">
            <div className="du-search-box du-desert-live-search">
              {!searchInput && (
                <span className="du-search-icon" aria-hidden="true">
                  ⌕
                </span>
              )}
              <input
                className="du-search-input"
                type="search"
                placeholder="Search publications..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>

            <DesertLiveMenuFilter
              buttonLabel="Filter"
              menuLabel="Show category"
              value={category}
              options={desertLiveCategoryOptions}
              onChange={changeCategory}
            />

            {(isAdmin || isMyPage) && (
              <DesertLiveMenuFilter
                buttonLabel="Status"
                menuLabel="Show status"
                value={status}
                options={desertLiveStatusOptions}
                onChange={changeStatus}
              />
            )}

            <button
              type="button"
              className="du-button du-button-small du-button-rect du-button-back"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>

          {error && <p className="du-error">{error}</p>}

          <div className="du-card-list du-soft-scroll du-list-4 du-list-row-large du-desert-live-page-list">
            {!loading &&
              pageData.items.map((item) => (
                <DesertLiveRow
                  key={item.id}
                  item={item}
                  busy={busyItemId === item.id}
                  showModerationActions={!isMyPage && isAdmin}
                  showOwnerActions={isMyPage}
                  onView={() =>
                    navigate(
                      isMyPage
                        ? `/activity/my/${item.id}`
                        : `/activity/${item.id}`,
                    )
                  }
                  onApprove={handleApprove}
                  onReject={setRejectingItem}
                  onEdit={(selectedItem) =>
                    navigate(`/activity/my/${selectedItem.id}/edit`)
                  }
                  onDelete={setDeletingItem}
                />
              ))}

            {(loading || pageData.items.length === 0) && (
              <div className="du-dashboard-empty-state du-desert-live-list-state">
                <span aria-hidden="true">{loading ? "⌛" : "🏜"}</span>
                <p>
                  {loading
                    ? "Loading Desert Live..."
                    : "No publications match these filters."}
                </p>
              </div>
            )}
          </div>

          {pageData.totalPages > 1 && (
            <div className="du-desert-live-pagination">
              <button
                type="button"
                className="du-button du-button-small du-button-rect"
                disabled={pageIndex === 0}
                onClick={() => setPageIndex((current) => current - 1)}
              >
                Previous
              </button>
              <span>
                Page {pageIndex + 1} of {pageData.totalPages}
              </span>
              <button
                type="button"
                className="du-button du-button-small du-button-rect"
                disabled={pageIndex + 1 >= pageData.totalPages}
                onClick={() => setPageIndex((current) => current + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {rejectingItem && (
          <div className="du-desert-live-dialog-backdrop">
            <div className="du-panel du-desert-live-dialog" role="dialog" aria-modal="true">
              <p className="du-eyebrow">Moderation</p>
              <h2>Reject publication</h2>
              <p className="du-text-soft">{rejectingItem.title}</p>
              <label className="du-field">
                <span className="du-field-label">Reason for rejection</span>
                <textarea
                  className="du-textarea"
                  maxLength={500}
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                />
              </label>
              <div className="du-inline du-inline-sm du-inline-wrap du-mt-lg">
                <button
                  type="button"
                  className="du-button du-button-danger du-button-rect du-button-small"
                  disabled={!rejectReason.trim() || busyItemId !== null}
                  onClick={handleReject}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="du-button du-button-rect du-button-small"
                  disabled={busyItemId !== null}
                  onClick={() => {
                    setRejectingItem(null);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {deletingItem && (
          <div className="du-desert-live-dialog-backdrop">
            <div className="du-panel du-desert-live-dialog" role="dialog" aria-modal="true">
              <p className="du-eyebrow">My Publication</p>
              <h2>Delete publication?</h2>
              <p className="du-text-soft">
                “{deletingItem.title}” and its image will be removed.
              </p>
              <div className="du-inline du-inline-sm du-inline-wrap du-mt-lg">
                <button
                  type="button"
                  className="du-button du-button-danger du-button-rect du-button-small"
                  disabled={busyItemId !== null}
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="du-button du-button-rect du-button-small"
                  disabled={busyItemId !== null}
                  onClick={() => setDeletingItem(null)}
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

export default DesertLivePage;
