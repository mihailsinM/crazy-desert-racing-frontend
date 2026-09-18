import { useAuth } from "../context/authContext";
import UserDashboard from "./dashboards/UserDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import { hasAdminAccess } from "../utils/userRole";

function DashboardPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <p>Loading dashboard...</p>;
  }

  if (hasAdminAccess(currentUser.role)) {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}

export default DashboardPage;
