import { FaHeartbeat } from "react-icons/fa";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { MEDICAL_CONDITIONS } from "@features/patient/services/patientProfile";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function MedicalHistorySection({ profile, updateField }) {
  const { t } = useTranslation();
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
          <FaHeartbeat className="text-lg" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {t("profile.sections.medicalHistory.title")}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {t("profile.sections.medicalHistory.description")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MEDICAL_CONDITIONS.map((condition) => {
          const isChecked = profile[condition.name];
          return (
            <label
              key={condition.name}
              className={`relative flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 font-medium ${
                isChecked
                  ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                  : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  name={condition.name}
                  checked={isChecked}
                  onChange={updateField}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-0 bg-transparent transition-colors"
                />
              </div>
              <span className="text-sm flex-1">
                {t(
                  `profile.sections.medicalHistory.conditions.${condition.name}`,
                )}
              </span>
            </label>
          );
        })}

        <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-4 group">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
            {t("profile.sections.medicalHistory.otherNotes")}
          </label>
          <textarea
            name="otherNotes"
            value={profile.otherNotes}
            onChange={updateField}
            placeholder={t("profile.sections.medicalHistory.notesPlaceholder")}
            className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300 resize-none group-hover:shadow-sm"
            rows="4"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default MedicalHistorySection;
