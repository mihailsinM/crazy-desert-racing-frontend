import { useEffect, useState } from "react";
import { removeToken } from "../services/authService";
import { getCurrentUser } from "../services/userService";
import type { UserResponse } from "../types/user";
import UserDashboard from "./dashboards/UserDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

function DashboardPage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setError("Failed to load user. Please login again.");
      }
    }

    loadUser();
  }, []);

  if (error) {
    removeToken();
    window.location.reload();
    return null;
  }

  if (!user) {
    return <p>Loading dashboard...</p>;
  }

  if (user.role === "ADMIN") {
    return <AdminDashboard user={user} />;
  }

  return <UserDashboard user={user} />;
}

export default DashboardPage;
