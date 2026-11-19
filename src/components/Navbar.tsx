import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import ChatBubbleIcon from "./chat/ChatBubbleIcon";
import { useAuth } from "../context/authContext";
import {
  CHAT_UNREAD_CHANGED_EVENT,
  getChatUnreadCount,
} from "../services/chatService";

function Navbar() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);
  const [unreadMarketplace, setUnreadMarketplace] = useState(0);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function dismissMenu(event: PointerEvent) {
      const target = event.target as Node;
      if (!menuToggleRef.current?.contains(target) &&
          !navigationRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", dismissMenu);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissMenu);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;

    function refreshUnreadCount() {
      if (document.visibilityState !== "visible") {
        return;
      }

      void getChatUnreadCount()
        .then((counts) => {
          if (active) {
            setUnreadChats(counts.unreadCount);
            setUnreadMarketplace(counts.marketplaceUnreadCount);
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
    window.addEventListener(CHAT_UNREAD_CHANGED_EVENT, refreshUnreadCount);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.removeEventListener(CHAT_UNREAD_CHANGED_EVENT, refreshUnreadCount);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, location.key]);

  const visibleUnreadChats = isAuthenticated ? unreadChats : 0;
  const visibleUnreadMarketplace = isAuthenticated ? unreadMarketplace : 0;

  function getNavLinkClass({ isActive }: { isActive: boolean }) {
    return isActive ? "du-nav-link du-nav-link-active" : "du-nav-link";
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
  }

  return (
    <header className="du-navbar">
      <NavLink to="/" className="du-navbar-logo" onClick={() => setMenuOpen(false)}>
        🏜 Crazy Desert Racing
      </NavLink>

      <button
        ref={menuToggleRef}
        type="button"
        className="du-navbar-menu-toggle du-button du-button-options"
        aria-label={`${menuOpen ? "Close" : "Open"} navigation${isAuthenticated && unreadChats + unreadMarketplace > 0 ? ", unread messages" : ""}`}
        aria-controls="du-navbar-navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span aria-hidden="true">•••</span>
        {isAuthenticated && unreadChats + unreadMarketplace > 0 && (
          <span className="du-nav-unread-dot" aria-hidden="true" />
        )}
      </button>

      <nav
        ref={navigationRef}
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
              Drivers
            </NavLink>

            <NavLink
              to="/races"
              className={getNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Races
            </NavLink>

            <NavLink to="/festivals" className={getNavLinkClass}
              onClick={() => setMenuOpen(false)}>Festivals</NavLink>

            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                `${getNavLinkClass({ isActive })} du-nav-chat-link`
              }
              onClick={() => setMenuOpen(false)}
              aria-label={visibleUnreadMarketplace > 0
                ? `Marketplace, ${visibleUnreadMarketplace} unread inquiries`
                : "Marketplace"}
            >
              Marketplace
              {visibleUnreadMarketplace > 0 && (
                <span className="du-nav-unread-dot" aria-hidden="true" />
              )}
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
              href="/#races"
              className="du-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Races
            </a>

            <a
              href="/#vip"
              className="du-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              VIP Club
            </a>

            <NavLink
              to="/festivals"
              className={getNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Festivals
            </NavLink>

            <NavLink to="/marketplace" className={getNavLinkClass}
              onClick={() => setMenuOpen(false)}>Marketplace</NavLink>

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
