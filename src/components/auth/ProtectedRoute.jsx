import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUserRole, isAuthenticated } from "../../utils/auth";

function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0) {
    const role = getUserRole();

    if (!allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
