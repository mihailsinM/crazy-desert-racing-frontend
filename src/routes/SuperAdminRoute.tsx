import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  return currentUser?.role === "SUPER_ADMIN"
    ? <>{children}</>
    : <Navigate to="/dashboard" replace />;
}
