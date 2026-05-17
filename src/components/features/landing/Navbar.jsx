import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FaLeaf, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@components/common/LanguageSwitcher";

const MotionDiv = motion.div;

function Navbar({ isAuthPage, isLogin }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <MotionDiv
      className="flex w-full items-center justify-between"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Link
        to="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <div className="flex items-center justify-center bg-primary rounded-lg p-1.5 text-white">
          <FaLeaf className="text-xl" />
        </div>
        <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">
          {t("navbar.brand")}
        </h2>
      </Link>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />

        {isAuthPage ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/auth/register"
              className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                !isLogin
                  ? "bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <FaUserPlus />
              <span>Sign Up</span>
            </Link>
            <Link
              to="/auth/login"
              className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                isLogin
                  ? "bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <FaSignInAlt />
              <span>Log In</span>
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
    </MotionDiv>
  );
}

export default Navbar;
