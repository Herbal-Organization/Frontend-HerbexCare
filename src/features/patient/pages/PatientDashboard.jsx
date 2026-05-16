import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  isAuthenticated,
  getUserFromToken,
  logout,
  getUserRole,
} from "@utils/auth";
import PatientProfile from "./PatientProfile";
import PatientDashboardOverview from "./PatientDashboardOverview";
import PatientCart from "./PatientCart";
import PatientOrders from "./PatientOrders";
import PatientOrderDetails from "./PatientOrderDetails";
import PatientPaymentSimulation from "./PaymentSimulationPage";
import OrderSuccessPage from "./OrderSuccessPage";
import PatientFavorites from "./PatientFavorites";
import PatientSettings from "./PatientSettings";
import AiConsultationPage from "./ai-pages/AiConsultationPage";
import AiChatPage from "./ai-chat/AiChatPage";
import usePatientDashboardData from "@features/patient/hooks/usePatientDashboardData";
import {
  buildPatientDashboardUser,
  getPersistedPatientUser,
  isProfileComplete,
} from "@features/patient/services/patientProfile";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@components/layouts/DashboardLayout";
import { getPatientNavConfig } from "@config/dashboard/patientNav";

function PatientDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(() => getPersistedPatientUser());
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        navigate("/auth");
        return;
      }

      const userData = getUserFromToken();
      const role = getUserRole();

      if (role !== "Patient") {
        navigate("/");
        return;
      }

      setUser((currentUser) =>
        buildPatientDashboardUser({
          authUser: {
            ...currentUser,
            ...userData,
          },
        }),
      );
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
  };

  const safeUserId = user?.userId || user?.id;
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    reload: reloadDashboard,
  } = usePatientDashboardData(safeUserId);

  const displayUser = React.useMemo(() => {
    if (!dashboardData?.userDetails) return user;
    return buildPatientDashboardUser({
      authUser: user,
      userDetails: dashboardData.userDetails,
    });
  }, [user, dashboardData?.userDetails]);

  // Check if user needs to complete profile
  useEffect(() => {
    if (dashboardData?.profile && !isProfileComplete(dashboardData.profile)) {
      setNeedsProfileCompletion(true);
    }
  }, [dashboardData?.profile]);

  useEffect(() => {
    if (needsProfileCompletion) {
      navigate("/patient/dashboard/profile?requireCompletion=true");
    }
  }, [needsProfileCompletion, navigate]);

  if (!displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navConfig = getPatientNavConfig(t);

  return (
    <DashboardLayout
      role="patient"
      user={displayUser}
      navigation={navConfig}
      onLogout={handleLogout}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      error={dashboardError}
    >
      <Routes>
        <Route
          path="/"
          element={
            <PatientDashboardOverview
              user={displayUser}
              dashboardData={dashboardData}
              isLoading={isDashboardLoading}
              error={dashboardError}
              onRetry={reloadDashboard}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <PatientProfile
              user={displayUser}
              dashboardData={dashboardData}
              isLoading={isDashboardLoading}
              onProfileUpdated={reloadDashboard}
            />
          }
        />
        <Route
          path="/settings"
          element={<PatientSettings user={displayUser} />}
        />
        <Route path="/cart" element={<PatientCart />} />
        <Route path="/orders" element={<PatientOrders />} />
        <Route path="/orders/success" element={<OrderSuccessPage />} />
        <Route
          path="/orders/:orderId/payment"
          element={<PatientPaymentSimulation />}
        />
        <Route path="/orders/:orderId" element={<PatientOrderDetails />} />
        <Route path="/favorites" element={<PatientFavorites />} />
        <Route
          path="/recipes"
          element={<Navigate to="/patient/dashboard/favorites" replace />}
        />
        <Route path="/ai-consultation" element={<AiConsultationPage />} />
        <Route path="/ai-chat" element={<AiChatPage />} />
        <Route
          path="*"
          element={<Navigate to="/patient/dashboard" replace />}
        />
      </Routes>
    </DashboardLayout>
  );
}

export default PatientDashboard;
