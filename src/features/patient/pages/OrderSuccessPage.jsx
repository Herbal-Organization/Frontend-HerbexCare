import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaCheckCircle } from "react-icons/fa";

function OrderSuccessPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const message =
    location.state?.message ||
    t("orderSuccess.description");

  const handleClose = () => {
    navigate("/patient/dashboard/orders", { replace: true });
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
        >
          <FaCheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </motion.div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t("orderSuccess.title")}
        </h2>

        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {message}
        </p>

        <button
          type="button"
          onClick={handleClose}
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
        >
          {t("orderSuccess.ok")}
        </button>
      </motion.div>
    </div>
  );
}

export default OrderSuccessPage;
