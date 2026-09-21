import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import raceBackground from "../assets/race.png";
import ChatAttachmentImage from "../components/chat/ChatAttachmentImage";
import DetailsCard from "../components/details/DetailsCard";
import AdaptiveCardList from "../components/lists/AdaptiveCardList";
import CatalogPage from "../components/lists/CatalogPage";
import {
  getOpenChatReports,
  reviewChatReport,
} from "../services/chatService";
import type { ChatReport } from "../types/chat";

function formatReportDate(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminChatReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ChatReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyReportId, setBusyReportId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadReports() {
    setReports(await getOpenChatReports());
  }

  useEffect(() => {
    let active = true;

    void getOpenChatReports()
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
              : "Failed to load message reports",
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

  async function handleReview(
    reportId: number,
    status: "RESOLVED" | "DISMISSED",
  ) {
    setBusyReportId(reportId);
    setError("");
    setNotice("");

    try {
      await reviewChatReport(reportId, status);
      await loadReports();
      setNotice(
        status === "RESOLVED" ? "Report resolved." : "Report dismissed.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to review message report",
      );
    } finally {
      setBusyReportId(null);
    }
  }

  if (loading) {
    return <p className="du-sand-text">Loading message reports...</p>;
  }

  return (
    <CatalogPage>
      <DetailsCard
        image={{ src: raceBackground, alt: "Desert race background" }}
        eyebrow="Admin Panel"
        title="Message Reports"
        overlayClassName="du-scroll"
        topAligned
        status={(
          <button
            type="button"
            className="du-button du-button-small du-button-rect"
            onClick={() => navigate("/chats")}
          >
            Admin Chats
          </button>
        )}
      >
        <p className="du-text-soft du-text-readable">
          Each report reveals only the message selected by the reporter. It
          does not open the surrounding private conversation.
        </p>

        {error && <p className="du-error">{error}</p>}
        {notice && <p className="du-image-optimization-message">{notice}</p>}

        <AdaptiveCardList className="du-list-row-large du-chat-report-list">
          {reports.length === 0 ? (
            <div className="du-row-panel">
              <div className="du-row-main">
                <span className="du-row-title">No open message reports</span>
                <span className="du-row-subtitle">
                  The community chat moderation queue is clear.
                </span>
              </div>
            </div>
          ) : (
            reports.map((report) => (
              <article
                key={report.id}
                className="du-row-panel du-chat-report-row"
              >
                <div className="du-row-main du-chat-report-copy">
                  <span className="du-row-heading">
                    <span className="du-row-title">{report.reason}</span>
                    <span className="du-status du-status-small du-status-pending">
                      {report.status}
                    </span>
                  </span>
                  <span className="du-row-subtitle">
                    {report.reporterName} reported a message from {" "}
                    {report.reportedUserName}
                  </span>
                  <blockquote>
                    {report.reportedMessage || "Image attachment"}
                  </blockquote>
                  {report.imageUrl && (
                    <ChatAttachmentImage
                      src={report.imageUrl}
                      alt="Reported chat attachment"
                    />
                  )}
                  <span className="du-row-subtitle">
                    {report.details || "No additional details"} · {" "}
                    {formatReportDate(report.createdAt)}
                  </span>
                </div>

                <div className="du-row-actions du-chat-report-actions">
                  <button
                    type="button"
                    className="du-button du-button-small"
                    disabled={busyReportId === report.id}
                    onClick={() => handleReview(report.id, "DISMISSED")}
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    className="du-button du-button-small du-button-primary"
                    disabled={busyReportId === report.id}
                    onClick={() => handleReview(report.id, "RESOLVED")}
                  >
                    Resolve
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

export default AdminChatReportsPage;
