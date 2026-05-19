import { useTranslation } from "react-i18next";
import Navbar from "@components/features/landing/Navbar";

function AuthPageLayout({ title, subtitle, children, isLogin }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9] dark:bg-slate-900 font-sans transition-colors duration-300">
      {/* Top Navbar */}
      <header
        className="w-full h-20 px-6 sm:px-12 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-colors duration-300"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Navbar isAuthPage={true} isLogin={isLogin} />
      </header>

      {/* Main Form Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              {title}
            </h1>
            <p className="text-[#6bb580] dark:text-emerald-400 text-[15px] font-medium">
              {subtitle}
            </p>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default AuthPageLayout;
