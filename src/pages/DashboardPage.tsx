import { useAuth } from "../context/authContext";
import UserDashboard from "./dashboards/UserDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

function DashboardPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <p>Loading dashboard...</p>;
  }

  if (currentUser.role === "ADMIN") {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}

export default DashboardPage;
