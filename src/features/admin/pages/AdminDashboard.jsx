import { useEffect, useMemo, useState } from "react";
import { Navigate, Routes, Route, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  isAuthenticated,
  getUserFromToken,
  getUserRole,
  logout,
} from "@utils/auth";
import DashboardLayout from "@components/layouts/DashboardLayout";
import { getAdminNavConfig } from "@config/dashboard/adminNav";
import AdminOverviewPage from "./AdminOverviewPage";
import AdminUsersPage from "./AdminUsersPage";
import AdminDiseasesPage from "./AdminDiseasesPage";
import AdminAiChatConsultationsPage from "./AdminAiChatConsultationsPage";

function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        navigate("/auth/login");
        return;
      }

      const userData = getUserFromToken();
      const role = getUserRole();

      if (role !== "SuperAdmin") {
        navigate("/");
        return;
      }

      setUser(userData);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    logout();
  };

  const displayUser = useMemo(() => user, [user]);

  if (!displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout
      role="admin"
      user={displayUser}
      navigation={getAdminNavConfig(t)}
      onLogout={handleLogout}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard/overview" replace />} />
        <Route path="/overview" element={<AdminOverviewPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/diseases" element={<AdminDiseasesPage />} />
        <Route
          path="/ai-chat"
          element={<AdminAiChatConsultationsPage />}
        />
        <Route path="*" element={<Navigate to="/admin/dashboard/overview" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default AdminDashboard;
