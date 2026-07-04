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
import { Spinner } from "@components/common";
import { getAdminNavConfig } from "@config/dashboard/adminNav";
import AdminOverviewPage from "./AdminOverviewPage";
import AdminUsersPage from "./AdminUsersPage";
import AdminDiseasesPage from "./AdminDiseasesPage";
import AdminAiChatConsultationsPage from "./AdminAiChatConsultationsPage";
import AdminInventoryAiChatPage from "./AdminInventoryAiChatPage";
import AdminNotificationsPage from "./AdminNotificationsPage";
import AdminHerbsAllPage from "./AdminHerbsAllPage";
import AdminHerbsPendingPage from "./AdminHerbsPendingPage";
import AdminRecipesPage from "./AdminRecipesPage";
import AdminOrdersPage from "./AdminOrdersPage";
import AdminSubOrdersPage from "./AdminSubOrdersPage";
import AdminFeedbacksPage from "./AdminFeedbacksPage";
import AdminReviewsPage from "./AdminReviewsPage";
import AdminInventoryHerbsPage from "./AdminInventoryHerbsPage";
import AdminInventoryRecipesPage from "./AdminInventoryRecipesPage";
import AdminInventoryAIRecipesPage from "./AdminInventoryAIRecipesPage";
import AdminAiConsultationsPage from "./AdminAiConsultationsPage";
import AdminSettings from "./AdminSettings";

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
        <Spinner size="xl" />
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
        <Route
          path="/inventory"
          element={<AdminInventoryAiChatPage />}
        />
        <Route path="/notifications" element={<AdminNotificationsPage />} />
        <Route path="/herbs" element={<AdminHerbsAllPage />} />
        <Route path="/herbs/pending" element={<AdminHerbsPendingPage />} />
        <Route path="/recipes" element={<AdminRecipesPage />} />
        <Route path="/orders" element={<AdminOrdersPage />} />
        <Route path="/sub-orders" element={<AdminSubOrdersPage />} />
        <Route path="/feedbacks" element={<AdminFeedbacksPage />} />
        <Route path="/reviews" element={<AdminReviewsPage />} />
        <Route path="/inventory-herbs" element={<AdminInventoryHerbsPage />} />
        <Route path="/inventory-recipes" element={<AdminInventoryRecipesPage />} />
        <Route path="/inventory-ai-recipes" element={<AdminInventoryAIRecipesPage />} />
        <Route path="/ai-consultations" element={<AdminAiConsultationsPage />} />
        <Route path="/settings" element={<AdminSettings user={displayUser} />} />
        <Route path="*" element={<Navigate to="/admin/dashboard/overview" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default AdminDashboard;
