import React, { useEffect, useState, useMemo } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  isAuthenticated,
  getUserFromToken,
  getUserRole,
  logout,
} from "@utils/auth";
import HerbalistManageHerbs from "./HerbalistManageHerbs";
import HerbalistManageRecipes from "./HerbalistManageRecipes";
import HerbalistManageAIRecipes from "./HerbalistManageAIRecipes";
import HerbalistManageAIChatRecipes from "./HerbalistManageAIChatRecipes";
import HerbalistManageDiseases from "./HerbalistManageDiseases";
import HerbalistDashboardHome from "./HerbalistDashboardHome";
import HerbalistProfile from "./HerbalistProfile";
import HerbalistSettings from "./HerbalistSettings";
import HerbalistSubOrders from "./HerbalistSubOrders";
import SubOrderDetails from "./SubOrderDetails";
import useHerbalistDashboardData from "@features/herbalist/hooks/useHerbalistDashboardData";
import {
  getHerbalistDisplayName,
  mergeHerbalistUser,
  normalizeHerbalistUser,
} from "@features/herbalist/services/herbalistProfile";
import { getMySubOrders } from "@api/subOrders";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@components/layouts/DashboardLayout";
import { getHerbalistNavConfig } from "@config/dashboard/herbalistNav";

function HerbalistDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [ordersCount, setOrdersCount] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        navigate("/auth/login");
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

  const handleLogout = () => {
    logout();
  };

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    reload: reloadDashboard,
  } = useHerbalistDashboardData(user);

  const displayUser = useMemo(() => {
    if (!user) return null;
    return mergeHerbalistUser(user, dashboardData?.userDetails || {});
  }, [user, dashboardData?.userDetails]);

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

  if (!displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  const navConfig = getHerbalistNavConfig(t, { ordersCount });

  return (
    <DashboardLayout
      role="herbalist"
      user={displayUser}
      navigation={navConfig}
      onLogout={handleLogout}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      error={dashboardError}
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <Routes>
          <Route
            path="/"
            element={
              <HerbalistDashboardHome
                user={displayUser}
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
                user={displayUser}
                dashboardData={dashboardData}
                isLoading={isDashboardLoading}
                onProfileUpdated={reloadDashboard}
              />
            }
          />
          <Route
            path="/settings"
            element={<HerbalistSettings user={displayUser} />}
          />
          <Route
            path="/herbs"
            element={
              <Navigate to="/herbalist/dashboard/herbs/managed" replace />
            }
          />
          <Route
            path="/herbs/managed"
            element={
              <HerbalistManageHerbs
                user={displayUser}
                dashboardData={dashboardData}
                view="managed"
              />
            }
          />
          <Route
            path="/herbs/readonly"
            element={
              <HerbalistManageHerbs
                user={displayUser}
                dashboardData={dashboardData}
                view="readonly"
              />
            }
          />
          <Route
            path="/herbs/inventory"
            element={
              <HerbalistManageHerbs
                user={displayUser}
                dashboardData={dashboardData}
                view="inventory"
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
          <Route path="/ai-recipes" element={<HerbalistManageAIRecipes />} />
          <Route
            path="/ai-chat-recipes"
            element={<HerbalistManageAIChatRecipes />}
          />
          <Route path="/diseases" element={<HerbalistManageDiseases />} />
          <Route
            path="/inventory"
            element={
              <Navigate to="/herbalist/dashboard/herbs/inventory" replace />
            }
          />
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
                user={displayUser}
                dashboardData={dashboardData}
                isLoadingDashboard={isDashboardLoading}
                onRetryDashboard={reloadDashboard}
              />
            }
          />
        </Routes>
      </div>
    </DashboardLayout>
  );
}

export default HerbalistDashboard;
