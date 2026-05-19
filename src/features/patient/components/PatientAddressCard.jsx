import { FaCity, FaMapMarkedAlt, FaMapMarkerAlt, FaRoad } from "react-icons/fa";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function AddressRow({ icon, label, value, t }) {
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-5 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm transition-all">
      <div className="mt-0.5 rounded-xl bg-white dark:bg-slate-900 p-2.5 text-slate-400 dark:text-slate-500 shadow-sm group-hover:text-primary dark:group-hover:text-emerald-500 group-hover:scale-110 transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-emerald-500 transition-colors">
          {label}
        </p>
        <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
          {value || t("dashboard.address.notSet")}
        </p>
      </div>
    </div>
  );
}

function PatientAddressCard({ profile }) {
  const { t } = useTranslation();
  return (
    <motion.section
      variants={itemVariants}
      className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
        <div className="p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-2xl">
          <FaMapMarkedAlt className="text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {t("dashboard.address.title")}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("dashboard.address.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <AddressRow
          icon={<FaMapMarkerAlt className="text-lg" />}
          label={t("dashboard.address.governorate")}
          value={profile?.governorate}
          t={t}
        />
        <AddressRow
          icon={<FaCity className="text-lg" />}
          label={t("dashboard.address.city")}
          value={profile?.city}
          t={t}
        />
        <AddressRow
          icon={<FaRoad className="text-lg" />}
          label={t("dashboard.address.street")}
          value={profile?.street}
          t={t}
        />
      </div>
    </motion.section>
  );
}

export default PatientAddressCard;
