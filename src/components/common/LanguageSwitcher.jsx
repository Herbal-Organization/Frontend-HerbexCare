import { useTranslation } from "react-i18next";
import { GrLanguage } from "react-icons/gr";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLanguage);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors rounded-lg px-3 py-2 hover:bg-slate-100"
      aria-label="Toggle language"
    >
      <GrLanguage className="text-lg" />
      <span
        className="text-sm font-medium"
        style={{
          fontFamily:
            i18n.language === "en"
              ? "'Alexandria', sans-serif"
              : "'Alexandria', sans-serif",
        }}
      >
        {i18n.language === "en" ? "العربية" : "English"}
      </span>
    </button>
  );
}

export default LanguageSwitcher;
