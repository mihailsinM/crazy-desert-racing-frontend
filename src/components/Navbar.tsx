import { Link } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        🏜 Crazy Desert Racing
      </Link>

      <nav className="navbar-links">
        <Link to="/races">Racing</Link>

        <Link to="/vip" className="vip-nav-link">
          VIP Club
        </Link>

        <a href="#">Festival</a>

        <Link to="/login">Login</Link>
      </nav>
    </header>
  );
}

export default Navbar;
