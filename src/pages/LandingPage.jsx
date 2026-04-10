import Navbar from "../component/Navbar.jsx";
import HeroSection from "../component/HeroSection.jsx";
import StepsSection from "../component/StepsSection.jsx";
import RecipesSection from "../component/RecipesSection.jsx";
import NewsletterSection from "../component/NewsletterSection.jsx";
import Footer from "../component/Footer.jsx";

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