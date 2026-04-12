import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  isAuthenticated,
  getUserFromToken,
  getUserRole,
  logout,
} from "../../../utils/auth";
import HerbalistManageHerbs from "./HerbalistManageHerbs";
import HerbalistManageRecipes from "./HerbalistManageRecipes";
import HerbalistProfile from "./HerbalistProfile";
import Sidebar from "../../../components/herbalist/Sidebar";
import useHerbalistDashboardData from "../../../hooks/useHerbalistDashboardData";
import { normalizeHerbalistUser } from "../../../services/herbalistProfile";

function HerbalistDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }

      const userData = getUserFromToken();
      const role = getUserRole();

      if (role !== "Herbalist") {
        navigate("/");
        return;
      }

      setUser(normalizeHerbalistUser(userData || {}));
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
  };

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    reload: reloadDashboard,
  } = useHerbalistDashboardData(user?.userId || user?.id);

  useEffect(() => {
    if (!dashboardData?.userDetails) {
      return;
    }

    setUser((currentUser) =>
      normalizeHerbalistUser({
        ...(currentUser || {}),
        ...dashboardData.userDetails,
      }),
    );
  }, [dashboardData?.userDetails]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {dashboardError ? (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {dashboardError}
            </div>
          ) : null}

          <Routes>
            <Route
              path="/"
              element={<Navigate to="/herbalist/dashboard/profile" replace />}
            />
            <Route
              path="/profile"
              element={
                <HerbalistProfile
                  user={user}
                  dashboardData={dashboardData}
                  isLoading={isDashboardLoading}
                  onProfileUpdated={reloadDashboard}
                />
              }
            />
            <Route
              path="/herbs"
              element={
                <HerbalistManageHerbs
                  user={user}
                  dashboardData={dashboardData}
                />
              }
            />
            <Route
              path="/recipes"
              element={
                <HerbalistManageRecipes
                  user={user}
                  dashboardData={dashboardData}
                />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default HerbalistDashboard;
