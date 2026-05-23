import { FaVenusMars, FaBirthdayCake, FaHashtag } from "react-icons/fa";
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

function PatientDetailsSection({ profile, updateField }) {
  const { t } = useTranslation();
  const genderValue = profile.genderName || profile.gender || "";

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-4xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
        <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
          <FaVenusMars className="text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">{t("profile.sections.patientDetails.title")}</h2>
          <p className="text-sm text-slate-500 font-medium">
            {t("profile.sections.patientDetails.description")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-600 transition-colors">
            {t("profile.sections.patientDetails.birthDate")}
          </label>
          <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
            <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
              <FaBirthdayCake />
            </div>
            <input
              type="date"
              name="birthDate"
              value={profile.birthDate}
              onChange={updateField}
              className="block w-full rounded-xl border-slate-100 bg-slate-50/50 py-3 ps-11 pe-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-200"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-emerald-600 transition-colors">
            {t("profile.sections.patientDetails.age")}
          </label>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400 group-hover:text-emerald-600 transition-colors">
              <FaHashtag className="text-sm" />
            </div>
            <div className="w-full px-4 py-3 ps-11 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all">
              {profile.age || t("profile.messages.noData")}
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-600 transition-colors">
            {t("profile.sections.patientDetails.gender")}
          </label>
          <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
            <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
              <FaVenusMars />
            </div>
            <select
              name="genderName"
              value={genderValue}
              onChange={updateField}
              className="block w-full appearance-none rounded-xl border-slate-100 bg-slate-50/50 py-3 ps-11 pe-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-200 cursor-pointer"
            >
              <option value="">{t("profile.sections.patientDetails.genderOptions.choose")}</option>
              <option value="Male">{t("profile.sections.patientDetails.genderOptions.male")}</option>
              <option value="Female">{t("profile.sections.patientDetails.genderOptions.female")}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 inset-e-0 flex items-center px-4 text-slate-400">
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PatientDetailsSection;
