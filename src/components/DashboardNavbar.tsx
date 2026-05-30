import "../styles/dashboard-navbar.css";
import { NavLink } from "react-router-dom";

type DashboardNavbarProps = {
  title: string;
  onLogout: () => void;
};

function DashboardNavbar({ title, onLogout }: DashboardNavbarProps) {
  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-logo">{title}</div>

      <div className="dashboard-menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/cars"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          My Cars
        </NavLink>

        <NavLink
          to="/races"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Races
        </NavLink>

        <NavLink
          to="/vip"
          className={({ isActive }) => (isActive ? "active" : "")}
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
