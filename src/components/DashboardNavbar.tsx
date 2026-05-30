import '../styles/dashboard-navbar.css'

type DashboardNavbarProps = {
  activePage: string
  onNavigate: (page: string) => void
  onLogout: () => void
}

function DashboardNavbar({
  activePage,
  onNavigate,
  onLogout,
}: DashboardNavbarProps) {
  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-logo">Crazy Desert Racing</div>

      <div className="dashboard-menu">
        <button
          className={activePage === 'dashboard' ? 'active' : ''}
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>

        <button
          className={activePage === 'cars' ? 'active' : ''}
          onClick={() => onNavigate('cars')}
        >
          My Cars
        </button>

        <button
          className={activePage === 'races' ? 'active' : ''}
          onClick={() => onNavigate('races')}
        >
          Races
        </button>

        <button
          className={activePage === 'vip' ? 'active' : ''}
          onClick={() => onNavigate('vip')}
        >
          VIP Club
        </button>

        <button className="logout-nav-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default DashboardNavbar