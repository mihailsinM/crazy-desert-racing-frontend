import { Outlet, useLocation } from "react-router-dom";
import DashboardNavbar from "./DashboardNavbar";
import "../../styles/dashboard-page.css";

function DashboardLayout() {
  const location = useLocation();

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  let pageTitle = "Dashboard";

  if (location.pathname === "/cars") {
    pageTitle = "My Cars";
  }

  if (location.pathname === "/races") {
    pageTitle = "Races";
  }

  if (location.pathname === "/vip") {
    pageTitle = "VIP Club";
  }

  return (
    <section className="dashboard-page du-page-shell">
      <div className="du-container">
        <DashboardNavbar title={pageTitle} onLogout={handleLogout} />
        <Outlet />
      </div>
    </section>
  );
}

export default DashboardLayout;
