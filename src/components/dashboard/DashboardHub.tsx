import { useNavigate } from "react-router-dom";

export type DashboardHubItem = {
  title: string;
  text: string;
  path: string;
};

type DashboardHubProps = {
  title: string;
  items: DashboardHubItem[];
  addPath?: string;
  viewAllPath?: string;
};

function DashboardHub({
  title,
  items,
  addPath,
  viewAllPath,
}: DashboardHubProps) {
  const navigate = useNavigate();

  return (
    <aside className="du-dashboard-card d du-dashboard-admin-panel">
      <div className="du-hub-header">
        <h2>{title}</h2>

        <div className="du-dashboard-hub-actions">
          {viewAllPath && (
            <button
              type="button"
              className="du-button du-button-small du-button-rect"
              onClick={() => navigate(viewAllPath)}
            >
              View All
            </button>
          )}

          {addPath && (
            <button
              type="button"
              className="du-button du-button-small du-button-rect"
              onClick={() => navigate(addPath)}
            >
              + Add
            </button>
          )}
        </div>
      </div>

      <div className="du-dashboard-hub-grid">
        {items.slice(0, 6).map((item) => (
          <button
            key={item.title}
            type="button"
            className="du-hub-card du-dashboard-hub-item"
            onClick={() => navigate(item.path)}
          >
            <h3>
              <span className="du-sand-text">{item.title}</span>
            </h3>

            <p>{item.text}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default DashboardHub;