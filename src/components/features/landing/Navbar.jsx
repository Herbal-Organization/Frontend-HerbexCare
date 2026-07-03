import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { FaLeaf, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@components/common/LanguageSwitcher";
import ThemeSwitcher from "@components/common/ThemeSwitcher";

const MotionDiv = motion.div;

function Navbar({ isAuthPage, isLogin }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <MotionDiv
      className="flex w-full items-center justify-between"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Brand */}
      <Link
        to="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <div className="flex items-center justify-center bg-primary rounded-lg p-1.5 text-white">
          <FaLeaf className="text-xl" />
        </div>
        <h2 className="text-slate-900 dark:text-slate-50 text-xl font-bold leading-tight tracking-tight">
          {t("navbar.brand")}
        </h2>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-2 sm:gap-3">
        <ThemeSwitcher />
        <LanguageSwitcher />

        {isAuthPage ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/auth/register"
              className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                !isLogin
                  ? "bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <FaUserPlus />
              <span>{t("navbar.signUp")}</span>
            </Link>
            <Link
              to="/auth/login"
              className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                isLogin
                  ? "bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <FaSignInAlt />
              <span>{t("navbar.logIn")}</span>
            </Link>
          </div>
        ) : (
          <Link
            to="/auth/login"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40"
          >
            {t("navbar.getStarted")}
          </Link>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
      </button>

      {/* Mobile Drawer — rendered via portal to escape sticky header stacking context */}
      {createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />

              {/* Drawer Panel */}
              <motion.div
                className={`fixed top-0 z-[9999] h-full w-72 bg-white dark:bg-slate-900 shadow-xl md:hidden flex flex-col ${
                  isRTL ? "left-0" : "right-0"
                }`}
                initial={isRTL ? { x: "-100%" } : { x: "100%" }}
                animate={{ x: 0 }}
                exit={isRTL ? { x: "-100%" } : { x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
                  <Link
                    to="/"
                    className="flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex items-center justify-center bg-primary rounded-lg p-1.5 text-white">
                      <FaLeaf className="text-lg" />
                    </div>
                    <span className="text-slate-900 dark:text-slate-50 text-lg font-bold">
                      {t("navbar.brand")}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Close menu"
                  >
                    <HiX className="text-xl" />
                  </button>
                </div>

                {/* Drawer Actions */}
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4 space-y-3">
                    {isAuthPage ? (
                      <>
                        <Link
                          to="/auth/register"
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            !isLogin
                              ? "bg-primary text-white shadow-md shadow-primary/20"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          <FaUserPlus />
                          <span>{t("navbar.signUp")}</span>
                        </Link>
                        <Link
                          to="/auth/login"
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            isLogin
                              ? "bg-primary text-white shadow-md shadow-primary/20"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          <FaSignInAlt />
                          <span>{t("navbar.logIn")}</span>
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/auth/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                      >
                        {t("navbar.getStarted")}
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </MotionDiv>
  );
}

export default Navbar;
