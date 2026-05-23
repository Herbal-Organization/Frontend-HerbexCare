import { Navigate, Routes, Route } from "react-router-dom";
import AuthPage from "@features/auth/pages/AuthPage";
import ConfirmEmailPage from "@features/auth/pages/ConfirmEmailPage";
import { ForgetPassword, ProtectedRoute } from "@features/auth/components";
import ResetPasswordPage from "@features/auth/pages/ResetPasswordPage";
import PatientDashboard from "@features/patient/pages/PatientDashboard";
import HerbalistDashboard from "@features/herbalist/pages/HerbalistDashboard";
import AdminDashboard from "@features/admin/pages/AdminDashboard";

import PatientHome from "@features/patient/pages/PatientHome";
import RecipesPage from "@features/browse/pages/RecipesPage";
import HerbsPage from "@features/browse/pages/HerbsPage";
import RecipeDetailsPage from "@features/browse/pages/RecipeDetailsPage";
import HerbDetailsPage from "@features/browse/pages/HerbDetailsPage";
import HerbalistsPage from "@features/browse/pages/HerbalistsPage";
import LandingPage from "@features/landing/pages/LandingPage";
import NotFoundPage from "@features/landing/pages/NotFoundPage";
import { isAuthenticated } from "@utils/auth";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans scroll-smooth">
      <Toaster position="top-right" />

      {/* Landing and Auth Routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<AuthPage />} />
        <Route path="/auth/register" element={<AuthPage />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        <Route
          path="/forget-password"
          element={
            isAuthenticated() ? (
              <Navigate to="/change-password" replace />
            ) : (
              <ForgetPassword />
            )
          }
        />
        <Route
          path="/change-password"
          element={
            isAuthenticated() ? (
              <ResetPasswordPage />
            ) : (
              <Navigate to="/forget-password" replace />
            )
          }
        />

        {/* Patient Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Patient"]} />}>
          <Route path="/patient/home" element={<PatientHome />} />
          <Route path="/patient/home/herbs" element={<HerbsPage />} />
          <Route
            path="/patient/home/herbs/:herbId"
            element={<HerbDetailsPage />}
          />
          <Route path="/patient/home/recipes" element={<RecipesPage />} />
          <Route path="/patient/home/herbalists" element={<HerbalistsPage />} />
          <Route
            path="/patient/home/recipes/:recipeId"
            element={<RecipeDetailsPage />}
          />
          <Route path="/patient/dashboard/*" element={<PatientDashboard />} />
        </Route>
        
        {/* Hebalist Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Herbalist"]} />}>
          <Route
            path="/herbalist/dashboard/*"
            element={<HerbalistDashboard />}
          />
        </Route>

        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["SuperAdmin"]} />}>
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
