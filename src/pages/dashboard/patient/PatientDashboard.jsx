import { useEffect, useState } from "react";
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
import PatientSavedRecipes from "./PatientSavedRecipes";
import PatientAiConsultation from "./ai-pages/PatientAiConsultation";
import usePatientDashboardData from "../../../hooks/usePatientDashboardData";
import {
  buildPatientDashboardUser,
  getPersistedPatientUser,
} from "../../../services/patientProfile";

function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getPersistedPatientUser());

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

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    reload: reloadDashboard,
  } = usePatientDashboardData(user?.userId || user?.id);

  useEffect(() => {
    if (!dashboardData?.userDetails) {
      return;
    }

    setUser((currentUser) =>
      buildPatientDashboardUser({
        authUser: currentUser,
        userDetails: dashboardData.userDetails,
      }),
    );
  }, [dashboardData?.userDetails]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <PatientSidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <main className="flex-1 bg-slate-50">
          <Routes>
            <Route
              path="/"
              element={
                <PatientDashboardOverview
                  user={user}
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
                  user={user}
                  dashboardData={dashboardData}
                  isLoading={isDashboardLoading}
                  onProfileUpdated={reloadDashboard}
                />
              }
            />
            <Route path="/cart" element={<PatientCart />} />
            <Route path="/orders" element={<PatientOrders />} />
            <Route
              path="/orders/:orderId/payment"
              element={<PatientPaymentSimulation />}
            />
            <Route path="/orders/:orderId" element={<PatientOrderDetails />} />
            <Route path="/recipes" element={<PatientSavedRecipes />} />
            <Route
              path="/ai-consultation"
              element={<PatientAiConsultation />}
            />
            <Route
              path="*"
              element={<Navigate to="/patient/dashboard" replace />}
            />
          </Routes>

          <div className="border-t border-slate-200 px-8 py-4 text-xs text-slate-400">
            Herbal Care AI &copy; {new Date().getFullYear()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PatientDashboard;
