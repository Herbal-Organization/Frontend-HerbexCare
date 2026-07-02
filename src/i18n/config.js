import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Eagerly load the default locale only
import enTranslations from "./locales/en.json";

const defaultResources = {
  en: {
    translation: enTranslations,
  },
};

// Lazy-load the other locale on demand
const localeLoaders = {
  ar: () => import("./locales/ar.json"),
};

// Get saved language from localStorage, default to 'en'
const savedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources: defaultResources,
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Load missing locale bundle on demand
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";

  if (!i18n.hasResourceBundle(lng, "translation") && localeLoaders[lng]) {
    localeLoaders[lng]().then((mod) => {
      i18n.addResourceBundle(lng, "translation", mod.default, true, true);
    });
  }
});

// Set initial direction and language on the html tag
document.documentElement.lang = savedLanguage;
document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";

// Load initial non-default locale if needed
if (savedLanguage !== "en" && !i18n.hasResourceBundle(savedLanguage, "translation") && localeLoaders[savedLanguage]) {
  localeLoaders[savedLanguage]().then((mod) => {
    i18n.addResourceBundle(savedLanguage, "translation", mod.default, true, true);
  });
}

export default i18n;
