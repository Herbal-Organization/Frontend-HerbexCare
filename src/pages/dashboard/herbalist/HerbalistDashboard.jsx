import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { isAuthenticated, getUserFromToken, logout } from "../../../utils/auth";
import HerbalistProfile from "./HerbalistProfile";
import Sidebar from "../../../components/herbalist/Sidebar";
import TopBar from "../../../components/herbalist/TopBar";
import StatsGrid from "../../../components/herbalist/StatsGrid";
import RecentActivity from "../../../components/herbalist/RecentActivity";
import QuickActions from "../../../components/herbalist/QuickActions";
import UpcomingConsultations from "../../../components/herbalist/UpcomingConsultations";

function HerbalistDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // const checkAuth = () => {
    //   if (!isAuthenticated()) {
    //     navigate("/auth");
    //     return;
    //   }

    //   const userData = getUserFromToken();
    //   if (userData?.role !== "Herbalist" && userData?.Role !== "Herbalist") {
    //     navigate("/");
    //     return;
    //   }

    //   setUser(userData);
    // };

    // checkAuth();

    setUser({ name: "Karim Safan", role: "herbalist" });
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
  };

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
        <TopBar />
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Welcome back, {user.name}
            </h2>
            <p className="text-slate-500 mt-1">
              Here&apos;s what&apos;s happening with your practice today.
            </p>
          </div>

          <StatsGrid />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <RecentActivity />
            <div className="space-y-6">
              <QuickActions />
              <UpcomingConsultations />
            </div>
          </div>

          <div className="mt-10">
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/herbalist/dashboard/profile" replace />}
              />
              <Route
                path="/profile"
                element={<HerbalistProfile user={user} />}
              />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HerbalistDashboard;
