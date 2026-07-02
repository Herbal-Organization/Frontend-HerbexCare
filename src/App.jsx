import { lazy, Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@features/auth/components";
import { isAuthenticated } from "@utils/auth";
import { Toaster } from "react-hot-toast";

const AuthPage = lazy(() => import("@features/auth/pages/AuthPage"));
const ConfirmEmailPage = lazy(() => import("@features/auth/pages/ConfirmEmailPage"));
const ForgetPassword = lazy(() => import("@features/auth/components").then(m => ({ default: m.ForgetPassword })));
const ResetPasswordPage = lazy(() => import("@features/auth/pages/ResetPasswordPage"));

const PatientDashboard = lazy(() => import("@features/patient/pages/PatientDashboard"));
const HerbalistDashboard = lazy(() => import("@features/herbalist/pages/HerbalistDashboard"));
const AdminDashboard = lazy(() => import("@features/admin/pages/AdminDashboard"));

const PatientHome = lazy(() => import("@features/patient/pages/PatientHome"));
const RecipesPage = lazy(() => import("@features/browse/pages/RecipesPage"));
const HerbsPage = lazy(() => import("@features/browse/pages/HerbsPage"));
const RecipeDetailsPage = lazy(() => import("@features/browse/pages/RecipeDetailsPage"));
const HerbDetailsPage = lazy(() => import("@features/browse/pages/HerbDetailsPage"));
const HerbalistsPage = lazy(() => import("@features/browse/pages/HerbalistsPage"));
const LandingPage = lazy(() => import("@features/landing/pages/LandingPage"));
const NotFoundPage = lazy(() => import("@features/landing/pages/NotFoundPage"));

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans scroll-smooth">
      <Toaster position="top-right" />

      {/* Landing and Auth Routes */}
      <Routes>
        <Route path="/" element={<Suspense><LandingPage /></Suspense>} />
        <Route path="/auth/login" element={<Suspense><AuthPage /></Suspense>} />
        <Route path="/auth/register" element={<Suspense><AuthPage /></Suspense>} />
        <Route path="/confirm-email" element={<Suspense><ConfirmEmailPage /></Suspense>} />
        <Route
          path="/forget-password"
          element={
            isAuthenticated() ? (
              <Navigate to="/change-password" replace />
            ) : (
              <Suspense><ForgetPassword /></Suspense>
            )
          }
        />
        <Route
          path="/change-password"
          element={
            isAuthenticated() ? (
              <Suspense><ResetPasswordPage /></Suspense>
            ) : (
              <Navigate to="/forget-password" replace />
            )
          }
        />

        {/* Patient Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Patient"]} />}>
          <Route path="/patient/home" element={<Suspense><PatientHome /></Suspense>} />
          <Route path="/patient/home/herbs" element={<Suspense><HerbsPage /></Suspense>} />
          <Route
            path="/patient/home/herbs/:herbId"
            element={<Suspense><HerbDetailsPage /></Suspense>}
          />
          <Route path="/patient/home/recipes" element={<Suspense><RecipesPage /></Suspense>} />
          <Route path="/patient/home/herbalists" element={<Suspense><HerbalistsPage /></Suspense>} />
          <Route
            path="/patient/home/recipes/:recipeId"
            element={<Suspense><RecipeDetailsPage /></Suspense>}
          />
          <Route path="/patient/dashboard/*" element={<Suspense><PatientDashboard /></Suspense>} />
        </Route>

        {/* Hebalist Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Herbalist"]} />}>
          <Route
            path="/herbalist/dashboard/*"
            element={<Suspense><HerbalistDashboard /></Suspense>}
          />
        </Route>

        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["SuperAdmin"]} />}>
          <Route path="/admin/dashboard/*" element={<Suspense><AdminDashboard /></Suspense>} />
        </Route>
        <Route path="*" element={<Suspense><NotFoundPage /></Suspense>} />
      </Routes>
    </div>
  );
}

export default App;
