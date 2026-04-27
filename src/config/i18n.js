import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import arTranslations from "./locales/ar/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: arTranslations },
  },
  lng: "ar",
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language || "ar";
}

export default i18n;
