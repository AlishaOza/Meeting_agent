import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


 const Dev_BYPASS = true;
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && !Dev_BYPASS) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}