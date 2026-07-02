import { motion } from "motion/react";
import { FaUser, FaEnvelope, FaAt, FaPhone } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function PersonalInformationSection({ user }) {
  const { t } = useTranslation();
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
          <FaUser className="text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {t("profile.sections.personalInfo.title")}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {t("profile.sections.personalInfo.description")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-emerald-600 transition-colors">
            {t("profile.sections.personalInfo.fullName")}
          </label>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-slate-400 group-hover:text-emerald-600 transition-colors">
              <FaUser className="text-sm" />
            </div>
            <div className="w-full px-4 py-3 ps-11 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all">
              {user?.fullName || user?.name || t("profile.messages.noData")}
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-emerald-600 transition-colors">
            {t("profile.sections.personalInfo.email")}
          </label>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-slate-400 group-hover:text-emerald-600 transition-colors">
              <FaEnvelope className="text-sm" />
            </div>
            <div className="w-full px-4 py-3 ps-11 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all">
              {user?.email || t("profile.messages.noData")}
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-emerald-600 transition-colors">
            {t("profile.sections.personalInfo.username")}
          </label>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-slate-400 group-hover:text-emerald-600 transition-colors">
              <FaAt className="text-sm" />
            </div>
            <div className="w-full px-4 py-3 ps-11 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all">
              {user?.userName || user?.username || t("profile.messages.noData")}
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-emerald-600 transition-colors">
            {t("profile.sections.personalInfo.phone")}
          </label>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-slate-400 group-hover:text-emerald-600 transition-colors">
              <FaPhone className="text-sm" />
            </div>
            <div className="w-full px-4 py-3 ps-11 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all">
              {user?.phone || t("profile.messages.noData")}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PersonalInformationSection;
