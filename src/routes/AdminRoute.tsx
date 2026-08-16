import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

type AdminRouteProps = {
  children: React.ReactNode;
};

function AdminRoute({ children }: AdminRouteProps) {
  const { currentUser } = useAuth();

  if (currentUser?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default AdminRoute;
