import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

import "../../styles/dashboard-page.css";

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <section className="dashboard-page du-page-shell du-page-scroll">
        <div className="du-container">
          <Outlet />
        </div>
      </section>
    </div>
  );
}

export default DashboardLayout;
