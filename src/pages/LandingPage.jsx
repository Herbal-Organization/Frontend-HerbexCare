import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/landing/Navbar.jsx";
import HeroSection from "../components/landing/HeroSection.jsx";
import StepsSection from "../components/landing/StepsSection.jsx";
import RecipesSection from "../components/landing/RecipesSection.jsx";
import NewsletterSection from "../components/landing/NewsletterSection.jsx";
import Footer from "../components/landing/Footer.jsx";
import { FaArrowUp } from "react-icons/fa";

function LandingPage() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100"
        dir={isRTL ? "rtl" : "ltr"}
      >
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

      {isVisible && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 ${
            isRTL ? "left-8" : "right-8"
          } z-50 p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 hover:scale-110 hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}

export default LandingPage;
