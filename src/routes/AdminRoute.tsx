import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/userService";
import type { UserResponse } from "../types/user";

type AdminRouteProps = {
  children: React.ReactNode;
};

function AdminRoute({ children }: AdminRouteProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setAllowed(currentUser.role === "ADMIN");
      } catch {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, []);

  if (loading) {
    return <p className="du-sand-text">Checking admin access...</p>;
  }

  if (!user || !allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default AdminRoute;