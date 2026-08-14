import { NavLink, useNavigate } from "react-router-dom";
import { hasToken, removeToken } from "../services/authService";

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = hasToken();

  function getNavLinkClass({ isActive }: { isActive: boolean }) {
    return isActive ? "du-nav-link du-nav-link-active" : "du-nav-link";
  }

  function handleLogout() {
    removeToken();
    navigate("/login");
    window.location.reload();
  }

  return (
    <header className="du-navbar">
      <NavLink to="/" className="du-navbar-logo">
        🏜 Crazy Desert Racing
      </NavLink>

      <nav className="du-navbar-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" className={getNavLinkClass}>
              Dashboard
            </NavLink>

            <NavLink to="/cars" className={getNavLinkClass}>
              My Cars
            </NavLink>

            <NavLink to="/races" className={getNavLinkClass}>
              Races
            </NavLink>

            <NavLink to="/vip" className={getNavLinkClass}>
              VIP Club
            </NavLink>

            <button
              type="button"
              className="du-button du-button-primary du-button-small"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/races" className={getNavLinkClass}>
              Racing
            </NavLink>

            <NavLink to="/vip" className={getNavLinkClass}>
              VIP Club
            </NavLink>

            <NavLink to="/festival" className={getNavLinkClass}>
              Festival
            </NavLink>

            <NavLink
              to="/login"
              className="du-button du-button-primary du-button-small"
            >
              Login
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
