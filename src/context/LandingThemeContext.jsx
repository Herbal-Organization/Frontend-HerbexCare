import { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "herbal_landing_theme";

const LandingThemeContext = createContext(null);

export function LandingThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  const isDark = theme === "dark";

  return (
    <LandingThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${
          isDark ? "dark" : ""
        } bg-[#fafafa] text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
      >
        {children}
      </div>
    </LandingThemeContext.Provider>
  );
}

export function useLandingTheme() {
  return useContext(LandingThemeContext);
}
