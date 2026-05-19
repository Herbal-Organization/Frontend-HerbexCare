import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaBrain, FaHeart, FaHistory } from "react-icons/fa";
import PatientAiConsultation from "./PatientAiConsultation";
import FavoriteRecipes from "./FavoriteRecipes";
import MyConsultations from "./MyConsultations";

function AiConsultationPage() {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState("consultations");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-[61px] lg:top-0 z-20 shadow-sm overflow-hidden transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => setActiveView("consultation")}
              className={`px-4 sm:px-6 py-4 font-semibold text-xs sm:text-sm transition border-b-2 whitespace-nowrap flex items-center justify-center flex-1 sm:flex-none gap-2 ${
                activeView === "consultation"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/10"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <FaBrain className="text-base sm:text-lg" />
              <span className="hidden xs:inline">
                {t("aiConsultation.nav.generator")}
              </span>
              <span className="xs:hidden">
                {t("aiConsultation.nav.generator").split(" ")[0]}
              </span>
            </button>
            <button
              onClick={() => setActiveView("favorites")}
              className={`px-4 sm:px-6 py-4 font-semibold text-xs sm:text-sm transition border-b-2 whitespace-nowrap flex items-center justify-center flex-1 sm:flex-none gap-2 ${
                activeView === "favorites"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/10"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <FaHeart className="text-base sm:text-lg" />
              <span>{t("aiConsultation.nav.favorites")}</span>
            </button>
            <button
              onClick={() => setActiveView("consultations")}
              className={`px-4 sm:px-6 py-4 font-semibold text-xs sm:text-sm transition border-b-2 whitespace-nowrap flex items-center justify-center flex-1 sm:flex-none gap-2 ${
                activeView === "consultations"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/10"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <FaHistory className="text-base sm:text-lg" />
              <span>{t("aiConsultation.nav.consultations")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl">
        {activeView === "consultation" && <PatientAiConsultation />}
        {activeView === "favorites" && <FavoriteRecipes />}
        {activeView === "consultations" && <MyConsultations />}
      </div>
    </div>
  );
}

export default AiConsultationPage;
