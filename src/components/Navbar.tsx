import "../styles/navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-logo">Crazy Desert Racing</div>

      <nav className="navbar-links">
        <a href="#">Races</a>
        <a href="#">VIP Club</a>
        <a href="#">Festival</a>
        <a href="#">Login</a>
      </nav>
    </header>
  );
}

export default Navbar;
