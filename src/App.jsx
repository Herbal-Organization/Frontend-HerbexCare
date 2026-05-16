import { Navigate, Routes, Route } from "react-router-dom";
import AuthPage from "@features/auth/pages/AuthPage";
import ConfirmEmailPage from "@features/auth/pages/ConfirmEmailPage";
import { ForgetPassword, ProtectedRoute } from "@features/auth/components";
import ResetPasswordPage from "@features/auth/pages/ResetPasswordPage";
import PatientDashboard from "@features/patient/pages/PatientDashboard";
import HerbalistDashboard from "@features/herbalist/pages/HerbalistDashboard";

import PatientHome from "@features/patient/pages/PatientHome";
import RecipesPage from "@features/browse/pages/RecipesPage";
import HerbsPage from "@features/browse/pages/HerbsPage";
import RecipeDetailsPage from "@features/browse/pages/RecipeDetailsPage";
import HerbDetailsPage from "@features/browse/pages/HerbDetailsPage";
import LandingPage from "@features/landing/pages/LandingPage";
import { isAuthenticated } from "@utils/auth";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans scroll-smooth">
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        <Route
          path="/forget"
          element={
            isAuthenticated() ? (
              <Navigate to="/reset-password" replace />
            ) : (
              <ForgetPassword />
            )
          }
        />
        <Route
          path="/reset-password"
          element={
            isAuthenticated() ? (
              <ResetPasswordPage />
            ) : (
              <Navigate to="/forget" replace />
            )
          }
        />

        <Route element={<ProtectedRoute allowedRoles={["Patient"]} />}>
          <Route path="/patient/home" element={<PatientHome />} />
          <Route path="/patient/home/herbs" element={<HerbsPage />} />
          <Route
            path="/patient/home/herbs/:herbId"
            element={<HerbDetailsPage />}
          />
          <Route path="/patient/home/recipes" element={<RecipesPage />} />
          <Route
            path="/patient/home/recipes/:recipeId"
            element={<RecipeDetailsPage />}
          />
          <Route path="/patient/dashboard/*" element={<PatientDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Herbalist"]} />}>
          <Route
            path="/herbalist/dashboard/*"
            element={<HerbalistDashboard />}
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
