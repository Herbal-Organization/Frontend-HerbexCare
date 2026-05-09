import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en.json";
import arTranslations from "./locales/ar.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  ar: {
    translation: arTranslations,
  },
};

// Get saved language from localStorage, default to 'en'
const savedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already protects against XSS
  },
});

// Save language to localStorage when it changes
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
});

export default i18n;
