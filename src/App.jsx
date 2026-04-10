import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ForgetPassword from "./component/auth/ForgetPassword";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PatientDashboard from "./pages/dashboard/patient/PatientDashboard";
import HerbalistDashboard from "./pages/dashboard/herbalist/HerbalistDashboard";

import BrowseRecipe from "./pages/BrowseRecipe";
import RecipesPage from "./pages/RecipesPage";
import HerbsPage from "./pages/HerbsPage";
import RecipeDetailsPage from "./pages/RecipeDetailsPage";
import HerbDetailsPage from "./pages/HerbDetailsPage";
import LandingPage from "./pages/LandingPage";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans scroll-smooth">
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute allowedRoles={["Patient"]} />}>
          <Route path="/patient/home" element={<BrowseRecipe />} />
          <Route path="/patient/home/herbs" element={<HerbsPage />} />
          <Route path="/patient/home/herbs/:herbId" element={<HerbDetailsPage />} />
          <Route path="/patient/home/recipes" element={<RecipesPage />} />
          <Route path="/patient/home/recipes/:recipeId" element={<RecipeDetailsPage />} />
          <Route path="/patient/dashboard/*" element={<PatientDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Herbalist"]} />}>
          <Route path="/herbalist/dashboard/*" element={<HerbalistDashboard />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
