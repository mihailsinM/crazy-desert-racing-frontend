import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import raceBackground from "../assets/race.png";
import DetailsCard from "../components/details/DetailsCard";
import AdaptiveCardList from "../components/lists/AdaptiveCardList";
import CatalogPage from "../components/lists/CatalogPage";
import {
  deleteUserPhotoAsAdmin,
  getOpenPhotoReports,
  hideUserPhotoAsAdmin,
  reviewPhotoReport,
} from "../services/userPhotoService";
import type { UserPhotoReport } from "../types/driver";

function formatReportDate(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminPhotoReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<UserPhotoReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyReportId, setBusyReportId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadReports() {
    setReports(await getOpenPhotoReports());
  }

  useEffect(() => {
    let active = true;

    void getOpenPhotoReports()
      .then((loadedReports) => {
        if (active) {
          setReports(loadedReports);
        }
      })
      .catch((caughtError) => {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load photo reports",
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

  async function reviewReport(
    report: UserPhotoReport,
    action: "RESOLVE" | "DISMISS" | "HIDE" | "DELETE",
  ) {
    if (
      action === "DELETE" &&
      !window.confirm("Delete this photo permanently and resolve its report?")
    ) {
      return;
    }

    setBusyReportId(report.id);
    setError("");
    setMessage("");

    try {
      if (action === "HIDE") {
        await hideUserPhotoAsAdmin(report.photoId);
        await reviewPhotoReport(report.id, "RESOLVED");
      } else if (action === "DELETE") {
        await deleteUserPhotoAsAdmin(report.photoId);
      } else {
        await reviewPhotoReport(
          report.id,
          action === "RESOLVE" ? "RESOLVED" : "DISMISSED",
        );
      }

      await loadReports();
      setMessage(
        action === "HIDE"
          ? "Photo hidden and report resolved."
          : action === "DELETE"
            ? "Photo deleted."
            : action === "DISMISS"
              ? "Report dismissed."
              : "Report resolved.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to review photo report",
      );
    } finally {
      setBusyReportId(null);
    }
  }

  if (loading) {
    return <p className="du-sand-text">Loading photo reports...</p>;
  }

  return (
    <CatalogPage>
      <DetailsCard
        image={{ src: raceBackground, alt: "Desert race background" }}
        eyebrow="Admin Panel"
        title="Photo Reports"
        overlayClassName="du-scroll"
        topAligned
        status={
          <button
            type="button"
            className="du-button du-button-small"
            onClick={() => navigate("/admin/users")}
          >
            All Users
          </button>
        }
      >
        <p className="du-text-soft du-text-readable">
          Review privacy, copyright and community-safety reports. The reporter
          and photo owner remain visible only to administrators.
        </p>

        {error && <p className="du-error">{error}</p>}
        {message && <p className="du-image-optimization-message">{message}</p>}

        <AdaptiveCardList className="du-list-row-large">
          {reports.length === 0 ? (
            <div className="du-row-panel">
              <div className="du-row-main">
                <span className="du-row-title">No open photo reports</span>
                <span className="du-row-subtitle">
                  The community moderation queue is clear.
                </span>
              </div>
            </div>
          ) : (
            reports.map((report) => (
              <article key={report.id} className="du-row-panel du-photo-report-row">
                <div className="du-row-main">
                  <span className="du-row-heading">
                    <span className="du-row-title">{report.reason}</span>
                    <span className="du-status du-status-small du-status-pending">
                      {report.status}
                    </span>
                  </span>
                  <span className="du-row-subtitle">
                    Photo #{report.photoId} · owner {report.photoOwnerName} ·
                    reported by {report.reporterName}
                  </span>
                  <span className="du-row-subtitle">
                    {report.details || "No additional details"} · {formatReportDate(report.createdAt)}
                  </span>
                </div>

                <div className="du-row-actions du-photo-report-actions">
                  <button
                    type="button"
                    className="du-button du-button-small"
                    disabled={busyReportId === report.id}
                    onClick={() => navigate(`/drivers/${report.photoOwnerId}`)}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    className="du-button du-button-small"
                    disabled={busyReportId === report.id}
                    onClick={() => reviewReport(report, "DISMISS")}
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    className="du-button du-button-small"
                    disabled={busyReportId === report.id}
                    onClick={() => reviewReport(report, "HIDE")}
                  >
                    Hide
                  </button>
                  <button
                    type="button"
                    className="du-button du-button-small du-button-danger"
                    disabled={busyReportId === report.id}
                    onClick={() => reviewReport(report, "DELETE")}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </AdaptiveCardList>
      </DetailsCard>
    </CatalogPage>
  );
}

export default AdminPhotoReportsPage;
