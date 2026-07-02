import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function NotFoundPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div
      className="min-h-screen bg-white dark:bg-slate-900 flex flex-col md:flex-row items-center justify-center p-6 md:p-12"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full md:w-1/2 flex justify-center md:justify-end mb-8 md:mb-0">
        <img
          src="/404.png"
          alt="404 Error"
          className="max-w-full h-auto max-h-[500px] object-contain"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-start md:ps-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {t("notFound.title", "It's a 404 Error!")}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-2 max-w-md">
          {t("notFound.line1", 'Don\'t worry, no one even knows what "404" means.')}
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-md">
          {t("notFound.line2", "But don't fret, everything is gonna be OK.")}
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md">
          {t("notFound.line3", "Just hit that back arrow that's somewhere up top?")}
        </p>
        <Link
          to="/"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40"
        >
          {t("notFound.backHome", "Back to Home")}
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
