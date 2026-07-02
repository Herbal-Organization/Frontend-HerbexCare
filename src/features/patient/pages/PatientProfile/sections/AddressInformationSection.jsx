import { motion } from "motion/react";
import { FaMapMarkerAlt, FaCity, FaStreetView } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function AddressInformationSection({ profile, updateField }) {
  const { t } = useTranslation();
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
          <FaMapMarkerAlt className="text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {t("profile.sections.addressInfo.title")}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {t("profile.sections.addressInfo.description")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="group md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-600 transition-colors">
            {t("profile.sections.addressInfo.governorate")}
          </label>
          <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
              <FaMapMarkerAlt />
            </div>
            <input
              type="text"
              name="governorate"
              value={profile.governorate}
              onChange={updateField}
              placeholder={t("profile.sections.addressInfo.placeholders.governorate")}
              className="block w-full rounded-xl border-slate-100 bg-slate-50/50 py-3 ps-11 pe-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-200"
            />
          </div>
        </div>
        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-600 transition-colors">
            {t("profile.sections.addressInfo.city")}
          </label>
          <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
              <FaCity />
            </div>
            <input
              type="text"
              name="city"
              value={profile.city}
              onChange={updateField}
              placeholder={t("profile.sections.addressInfo.placeholders.city")}
              className="block w-full rounded-xl border-slate-100 bg-slate-50/50 py-3 ps-11 pe-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-200"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-emerald-600 transition-colors">
            {t("profile.sections.addressInfo.street")}
          </label>
          <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
              <FaStreetView />
            </div>
            <input
              type="text"
              name="street"
              value={profile.street}
              onChange={updateField}
              placeholder={t("profile.sections.addressInfo.placeholders.street")}
              className="block w-full rounded-xl border-slate-100 bg-slate-50/50 py-3 ps-11 pe-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-200"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AddressInformationSection;
