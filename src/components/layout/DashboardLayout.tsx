import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

import "../../styles/dashboard-page.css";

function DashboardLayout() {
  return (
    <section className="dashboard-page du-page-shell">
      <Navbar />

      <div className="du-container">
        <Outlet />
      </div>
    </section>
  );
}

export default DashboardLayout;