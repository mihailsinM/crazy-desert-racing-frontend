import { useSearchParams } from "react-router-dom";

import type { DashboardWorkspaceView } from "../components/dashboard/DashboardWorkspace";
import { useAuth } from "../context/authContext";
import UserDashboard from "./dashboards/UserDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import { hasAdminAccess } from "../utils/userRole";

function DashboardPage() {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const workspaceView: DashboardWorkspaceView =
    searchParams.get("view") === "profile" ? "PROFILE" : "HUB";

  function setWorkspaceView(nextView: DashboardWorkspaceView) {
    const nextParams = new URLSearchParams(searchParams);

    if (nextView === "PROFILE") {
      nextParams.set("view", "profile");
    } else {
      nextParams.delete("view");
      nextParams.delete("edit");
    }

    setSearchParams(nextParams);
  }

  if (!currentUser) {
    return <p>Loading dashboard...</p>;
  }

  if (hasAdminAccess(currentUser.role)) {
    return (
      <AdminDashboard
        workspaceView={workspaceView}
        onWorkspaceViewChange={setWorkspaceView}
      />
    );
  }

  return (
    <UserDashboard
      workspaceView={workspaceView}
      onWorkspaceViewChange={setWorkspaceView}
    />
  );
}

export default DashboardPage;
