import { FaMoon, FaSun } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useTheme } from "@context/ThemeContext";

function ThemeSwitcher() {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center justify-center rounded-lg p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
      aria-label={isDark ? t("theme.light") : t("theme.dark")}
    >
      {isDark ? (
        <FaSun className="text-lg" aria-hidden />
      ) : (
        <FaMoon className="text-lg" aria-hidden />
      )}
    </button>
  );
}

export default ThemeSwitcher;
