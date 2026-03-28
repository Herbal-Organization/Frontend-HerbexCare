import { Routes, Route } from "react-router-dom";
import Navbar from "./component/Navbar";
import HeroSection from "./component/HeroSection";
import StepsSection from "./component/StepsSection";
import RecipesSection from "./component/RecipesSection";
import NewsletterSection from "./component/NewsletterSection";
import Footer from "./component/Footer";
import AuthPage from "./pages/AuthPage";
import ForgetPassword from "./component/auth/ForgetPassword";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PatientDashboard from "./pages/dashboard/patient/PatientDashboard";
import HerbalistDashboard from "./pages/dashboard/herbalist/HerbalistDashboard";
import BrowseRecipe from "./pages/BrowseRecipe";
import { Toaster } from 'react-hot-toast';

function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Navbar />
        </div>
      </header>
      <main className="flex-1">
        <HeroSection />
        <StepsSection />
        <RecipesSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/patient/home" element={<BrowseRecipe />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/patient/dashboard/*" element={<PatientDashboard />} />
        <Route path="/herbalist/dashboard/*" element={<HerbalistDashboard />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
