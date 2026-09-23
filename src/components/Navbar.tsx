import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import ChatBubbleIcon from "./chat/ChatBubbleIcon";
import { useAuth } from "../context/authContext";
import {
  CHAT_UNREAD_CHANGED_EVENT,
  getChatUnreadCount,
} from "../services/chatService";

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;

    function refreshUnreadCount() {
      void getChatUnreadCount()
        .then((count) => {
          if (active) {
            setUnreadChats(count);
          }
        })
        .catch(() => {
          // Keep navigation available if the lightweight counter request fails.
        });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshUnreadCount();
      }
    }

    refreshUnreadCount();
    const pollTimer = window.setInterval(refreshUnreadCount, 10000);
    window.addEventListener(CHAT_UNREAD_CHANGED_EVENT, refreshUnreadCount);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(pollTimer);
      window.removeEventListener(CHAT_UNREAD_CHANGED_EVENT, refreshUnreadCount);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated]);

  const visibleUnreadChats = isAuthenticated ? unreadChats : 0;

  function getNavLinkClass({ isActive }: { isActive: boolean }) {
    return isActive ? "du-nav-link du-nav-link-active" : "du-nav-link";
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
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
            <NavLink
              to="/chats"
              className={({ isActive }) =>
                `${getNavLinkClass({ isActive })} du-nav-chat-link`
              }
              onClick={() => setMenuOpen(false)}
              aria-label={
                visibleUnreadChats > 0
                  ? `My Chats, ${visibleUnreadChats} unread`
                  : "My Chats"
              }
              title="My Chats"
            >
              <ChatBubbleIcon className="du-nav-chat-icon" />
              <span className="du-nav-chat-label">My Chats</span>
              {visibleUnreadChats > 0 && (
                <span className="du-nav-unread-dot" aria-hidden="true" />
              )}
            </NavLink>

            <NavLink
              to="/dashboard"
              className={getNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/drivers"
              className={getNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              All Drivers
            </NavLink>

            <NavLink
              to="/races"
              className={getNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Races
            </NavLink>

            <NavLink
              to="/vip"
              className={getNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
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
            <a
              href="#races"
              className="du-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Races
            </a>

            <a
              href="#vip"
              className="du-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              VIP Club
            </a>

            <a
              href="#festival"
              className="du-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Festival
            </a>

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
