import { motion } from "motion/react";
import { FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function ChangePasswordSection({ onOpenModal }) {
  const { t } = useTranslation();
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
          <FaLock className="text-lg" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("profile.sections.security.changePassword")}</h2>
          <p className="text-xs text-slate-500 font-medium">
            {t("profile.sections.security.changePasswordDescription")}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenModal}
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:-translate-y-0.5 shadow-primary/30 hover:shadow-primary/50 transition-all"
      >
        <FaLock className="me-2" />
        {t("profile.sections.security.changePassword")}
      </button>
    </motion.div>
  );
}

export default ChangePasswordSection;
