import "../styles/navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-logo">🏜 Crazy Desert Racing</div>

      <nav className="navbar-links">
        <a href="/races">Racing</a>
        <a href="/vip" className="vip-nav-link">
          VIP Club
        </a>
        <a href="#">Festival</a>
        <a href="/login">Login</a>
      </nav>
    </header>
  );
}

export default Navbar;
