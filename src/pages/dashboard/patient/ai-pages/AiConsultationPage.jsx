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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveView("consultation")}
              className={`px-6 py-4 font-semibold text-sm transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeView === "consultation"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaBrain className="text-lg" />
              {t("aiConsultation.nav.generator")}
            </button>
            <button
              onClick={() => setActiveView("favorites")}
              className={`px-6 py-4 font-semibold text-sm transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeView === "favorites"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaHeart className="text-lg" />
              {t("aiConsultation.nav.favorites")}
            </button>
            <button
              onClick={() => setActiveView("consultations")}
              className={`px-6 py-4 font-semibold text-sm transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeView === "consultations"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaHistory className="text-lg" />
              {t("aiConsultation.nav.consultations")}
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
