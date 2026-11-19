import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FestivalCard } from "../components/FestivalCard";
import { useAuth } from "../context/authContext";
import { getFestivalHistory, getPublicDesertLiveItems } from "../services/desertLiveService";
import type { DesertLivePage } from "../types/desertLive";

export default function FestivalsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [params, setParams] = useSearchParams();
  const history = params.get("view") === "history";
  const pageNumber = Math.max(0, Number(params.get("page")) || 0);
  const [page, setPage] = useState<DesertLivePage | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const request = history ? getFestivalHistory(pageNumber) :
      getPublicDesertLiveItems({ category: "FESTIVAL", page: pageNumber, size: 12 });
    void request.then((result) => { if (mounted) setPage(result); })
      .catch((cause) => { if (mounted) setError(cause instanceof Error ? cause.message : "Could not load festivals"); });
    return () => { mounted = false; };
  }, [history, pageNumber]);

  function select(view: "active" | "history", page = 0) {
    setPage(null); setError("");
    setParams(page ? { view, page: String(page) } : { view });
  }

  return (
    <section className="du-page du-viewport-page du-collection-page">
      <header className="du-page-header">
        <h1 className="du-eyebrow du-my-cars-title">Festivals</h1>
        <div className="du-inline du-inline-sm">
          <button className={`du-button du-button-small du-button-rect${!history ? " du-button-primary" : ""}`}
            type="button" aria-pressed={!history} onClick={() => select("active")}>Active</button>
          <button className={`du-button du-button-small du-button-rect${history ? " du-button-primary" : ""}`}
            type="button" aria-pressed={history} onClick={() => select("history")}>History</button>
          {isAuthenticated && <button type="button" className="du-button du-button-primary du-button-small du-button-rect"
            onClick={() => navigate("/activity/new")}>+ Create Festival</button>}
        </div>
      </header>
      <div className="du-collection-scroll du-soft-scroll">
        {error && <p className="du-error">{error}</p>}
        {!page && !error && <p className="du-sand-text">Loading festivals...</p>}
        {page && <>
          <div className="du-showcase-grid">
            {page.items.map((item) => <FestivalCard key={item.id} festival={item} />)}
          </div>
          {!page.items.length && <p className="du-sand-text">{history ? "No past festivals yet." : "No upcoming festivals yet."}</p>}
          {page.totalPages > 1 && <div className="du-inline du-inline-sm">
            <button className="du-button du-button-small" type="button" disabled={!pageNumber}
              onClick={() => select(history ? "history" : "active", pageNumber - 1)}>Previous</button>
            <span className="du-sand-text">{pageNumber + 1} / {page.totalPages}</span>
            <button className="du-button du-button-small" type="button" disabled={pageNumber + 1 >= page.totalPages}
              onClick={() => select(history ? "history" : "active", pageNumber + 1)}>Next</button>
          </div>}
        </>}
      </div>
    </section>
  );
}
