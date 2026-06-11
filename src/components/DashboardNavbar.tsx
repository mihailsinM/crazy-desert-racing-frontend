import "../styles/dashboard-navbar.css";
import { NavLink } from "react-router-dom";

type DashboardNavbarProps = {
  title: string;
  onLogout: () => void;
};

function DashboardNavbar({ title, onLogout }: DashboardNavbarProps) {
  return (
    <nav className="dashboard-navbar du-navbar">
      <div className="dashboard-logo">{title}</div>

      <div className="dashboard-menu du-navbar-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "du-nav-link du-nav-link-active" : "du-nav-link"
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "du-nav-link du-nav-link-active" : "du-nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/cars"
          className={({ isActive }) =>
            isActive ? "du-nav-link du-nav-link-active" : "du-nav-link"
          }
        >
          My Cars
        </NavLink>

        <NavLink
          to="/races"
          className={({ isActive }) =>
            isActive ? "du-nav-link du-nav-link-active" : "du-nav-link"
          }
        >
          Races
        </NavLink>

        <NavLink
          to="/vip"
          className={({ isActive }) =>
            isActive ? "du-nav-link du-nav-link-active" : "du-nav-link"
          }
        >
          VIP Club
        </NavLink>

        <button className="logout-nav-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default DashboardNavbar;
