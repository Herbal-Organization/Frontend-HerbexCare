import Navbar from "../components/landing/Navbar.jsx";
import HeroSection from "../components/landing/HeroSection.jsx";
import StepsSection from "../components/landing/StepsSection.jsx";
import RecipesSection from "../components/landing/RecipesSection.jsx";
import NewsletterSection from "../components/landing/NewsletterSection.jsx";
import Footer from "../components/landing/Footer.jsx";

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

export default LandingPage;