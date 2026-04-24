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
import HerbalistInventory from "./HerbalistInventory";
import HerbalistDashboardHome from "./HerbalistDashboardHome";
import HerbalistProfile from "./HerbalistProfile";
import HerbalistSubOrders from "./HerbalistSubOrders";
import SubOrderDetails from "./SubOrderDetails";
import Sidebar from "../../../components/herbalist/Sidebar";
import useHerbalistDashboardData from "../../../hooks/useHerbalistDashboardData";
import { normalizeHerbalistUser } from "../../../services/herbalistProfile";
import { getMySubOrders } from "../../../api/subOrders";

function HerbalistDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [ordersCount, setOrdersCount] = useState(null);

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

  useEffect(() => {
    let isMounted = true;

    const loadOrdersCount = async () => {
      try {
        const response = await getMySubOrders();
        const items = Array.isArray(response)
          ? response
          : (response?.items ?? []);
        if (isMounted) {
          setOrdersCount(items.length);
        }
      } catch (_error) {
        if (isMounted) {
          setOrdersCount(null);
        }
      }
    };

    if (user) {
      loadOrdersCount();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

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
        ordersCount={ordersCount}
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
              element={
                <HerbalistDashboardHome
                  user={user}
                  dashboardData={dashboardData}
                  isLoadingDashboard={isDashboardLoading}
                  onRetryDashboard={reloadDashboard}
                />
              }
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
            <Route path="/inventory" element={<HerbalistInventory />} />
            <Route path="/orders" element={<HerbalistSubOrders />} />
            <Route path="/orders/:id" element={<SubOrderDetails />} />
            <Route
              path="/suborders"
              element={<Navigate to="/herbalist/dashboard/orders" replace />}
            />
            <Route
              path="/suborders/:id"
              element={<Navigate to="/herbalist/dashboard/orders" replace />}
            />
            <Route
              path="*"
              element={
                <HerbalistDashboardHome
                  user={user}
                  dashboardData={dashboardData}
                  isLoadingDashboard={isDashboardLoading}
                  onRetryDashboard={reloadDashboard}
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
