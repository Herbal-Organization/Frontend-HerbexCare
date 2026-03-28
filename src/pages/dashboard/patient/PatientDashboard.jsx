import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { isAuthenticated, getUserFromToken, logout, getUserRole } from "../../../utils/auth";
import PatientProfile from "./PatientProfile";
import PatientSidebar from "./PatientSidebar";
import PatientDashboardOverview from "./PatientDashboardOverview";

function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

      setUser(userData);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <PatientSidebar user={user} />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        
        <main className="flex-1 bg-slate-50">
          <Routes>
            <Route
              path="/"
              element={<PatientDashboardOverview user={user} />}
            />
            <Route path="/profile" element={<PatientProfile user={user} />} />
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

      <button
        type="button"
        onClick={handleLogout}
        className="fixed bottom-6 left-80 flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50"
      >
        <FaSignOutAlt className="h-4 w-4" />
        
      </button>
    </div>
  );
}

export default PatientDashboard;
