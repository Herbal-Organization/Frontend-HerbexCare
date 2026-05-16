import { FaTrash } from "react-icons/fa";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function DeleteAccountSection({ onOpenModal }) {
  const { t } = useTranslation();
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-eed-200 bg-red-50 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-eed-100 pb-4">
        <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
          <FaTrash className="text-lg" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-red-900">{t("profile.sections.security.deleteAccount")}</h2>
          <p className="text-xs text-red-700 font-medium">
            {t("profile.sections.security.deleteAccountDescription")}
          </p>
        </div>
      </div>

      <p className="text-sm text-red-800 mb-4 font-medium">
        {t("profile.sections.security.deleteAccountWarning")}
      </p>

      <button
        type="button"
        onClick={onOpenModal}
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-red-600 text-white text-sm font-bold shadow-sm hover:-translate-y-0.5 shadow-red-600/30 hover:shadow-red-600/50 transition-all hover:bg-red-700"
      >
        <FaTrash className="me-2" />
        {t("profile.sections.security.deleteAccount")}
      </button>
    </motion.div>
  );
}

export default DeleteAccountSection;
