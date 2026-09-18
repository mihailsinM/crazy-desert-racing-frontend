import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { hasAdminAccess } from "../utils/userRole";

type AdminRouteProps = {
  children: React.ReactNode;
};

function AdminRoute({ children }: AdminRouteProps) {
  const { currentUser } = useAuth();

  if (!hasAdminAccess(currentUser?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default AdminRoute;
