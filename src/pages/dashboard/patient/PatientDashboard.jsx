import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  isAuthenticated,
  getUserFromToken,
  logout,
  getUserRole,
} from "../../../utils/auth";
import PatientProfile from "./PatientProfile";
import PatientSidebar from "./PatientSidebar";
import PatientDashboardOverview from "./PatientDashboardOverview";
import PatientCart from "./PatientCart";
import PatientOrders from "./PatientOrders";
import PatientOrderDetails from "./PatientOrderDetails";
import PatientPaymentSimulation from "./PaymentSimulationPage";
import OrderSuccessPage from "./OrderSuccessPage";
import PatientSavedRecipes from "./PatientSavedRecipes";
import PatientSettings from "./PatientSettings";
import AiConsultationPage from "./ai-pages/AiConsultationPage";
import usePatientDashboardData from "../../../hooks/usePatientDashboardData";
import {
  buildPatientDashboardUser,
  getPersistedPatientUser,
  isProfileComplete,
  markProfileAsComplete,
} from "../../../services/patientProfile";
import { FaBars, FaSpa } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const PROFILE_COMPLETION_KEY = "patient_profile_completed";

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

  // Check if user needs to complete profile (set gender/birthdate on first login)
  useEffect(() => {
    if (dashboardData?.profile && !isProfileComplete(dashboardData.profile)) {
      setNeedsProfileCompletion(true);
    }
  }, [dashboardData?.profile]);

  // Redirect to profile completion if needed
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

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <PatientSidebar
        user={displayUser}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 md:ms-72 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <FaBars className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5 text-white">
              <FaSpa className="text-lg" />
            </div>
            <span className="font-bold text-slate-900">
              {t("patientSidebar.brand")}
            </span>
          </div>
        </div>

        <main className="flex-1 bg-slate-50">
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
            <Route path="/settings" element={<PatientSettings user={displayUser} />} />
            <Route path="/cart" element={<PatientCart />} />
            <Route path="/orders" element={<PatientOrders />} />
            <Route path="/orders/success" element={<OrderSuccessPage />} />
            <Route
              path="/orders/:orderId/payment"
              element={<PatientPaymentSimulation />}
            />
            <Route path="/orders/:orderId" element={<PatientOrderDetails />} />
            <Route path="/recipes" element={<PatientSavedRecipes />} />
            <Route path="/ai-consultation" element={<AiConsultationPage />} />
            <Route
              path="*"
              element={<Navigate to="/patient/dashboard" replace />}
            />
          </Routes>

          <div className="border-t border-slate-200 px-4 sm:px-8 py-4 text-xs text-slate-400">
            Herbal Care AI &copy; {new Date().getFullYear()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PatientDashboard;
