import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function getNavLinkClass({ isActive }: { isActive: boolean }) {
    return isActive ? "du-nav-link du-nav-link-active" : "du-nav-link";
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="du-navbar">
      <NavLink to="/" className="du-navbar-logo">
        🏜 Crazy Desert Racing
      </NavLink>

      <button
        type="button"
        className="du-navbar-menu-toggle du-button du-button-small"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-controls="du-navbar-navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <nav
        id="du-navbar-navigation"
        className={`du-navbar-links${menuOpen ? " du-navbar-links-open" : ""}`}
        aria-label="Main navigation"
      >
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" className={getNavLinkClass} onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>

            <NavLink to="/drivers" className={getNavLinkClass} onClick={() => setMenuOpen(false)}>
              All Drivers
            </NavLink>

            <NavLink to="/races" className={getNavLinkClass} onClick={() => setMenuOpen(false)}>
              Races
            </NavLink>

            <NavLink to="/vip" className={getNavLinkClass} onClick={() => setMenuOpen(false)}>
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
            <NavLink to="/races" className={getNavLinkClass} onClick={() => setMenuOpen(false)}>
              Racing
            </NavLink>

            <NavLink to="/vip" className={getNavLinkClass} onClick={() => setMenuOpen(false)}>
              VIP Club
            </NavLink>

            <NavLink to="/festival" className={getNavLinkClass} onClick={() => setMenuOpen(false)}>
              Festival
            </NavLink>

            <NavLink
              to="/login"
              className="du-button du-button-primary du-button-small"
              onClick={() => setMenuOpen(false)}
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
