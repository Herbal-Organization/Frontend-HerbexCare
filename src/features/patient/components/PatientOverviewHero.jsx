import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaBirthdayCake, FaVenusMars } from "react-icons/fa";
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

function PatientOverviewHero({ user, profile }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const address = [profile?.street, profile?.city, profile?.governorate]
    .filter(Boolean)
    .join(", ");
  const displayName = user?.fullName || user?.name || user?.userName || "";

  return (
    <motion.section
      variants={itemVariants}
      className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30" />
      <div className="pointer-events-none absolute -top-40 -start-40 h-96 w-96 rounded-full bg-emerald-400/10 blur-[80px]" />

      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary mb-2">
            {t("dashboard.hero.tagline")}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-5xl leading-tight">
            {t("dashboard.hero.welcome")}
            {displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500 font-medium">
            {t("dashboard.hero.description")}
          </p>

          <div className="mt-8 grid grid-cols-2 sm:flex flex-wrap gap-4">
            <div className="group rounded-2xl border border-slate-100 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-md hover:-translate-y-1 hover:shadow-md transition-all flex items-center gap-3">
              <div className="text-slate-400 group-hover:text-emerald-600 transition-colors">
                <FaEnvelope className="text-base" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t("dashboard.hero.email")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 truncate">
                  {user?.email || t("dashboard.hero.notAvailable")}
                </p>
              </div>
            </div>

            <div className="group rounded-2xl border border-slate-100 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-md hover:-translate-y-1 hover:shadow-md transition-all flex items-center gap-3">
              <div className="text-slate-400 group-hover:text-emerald-600 transition-colors">
                <FaPhone className="text-base" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t("dashboard.hero.phone")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {user?.phone || t("dashboard.hero.notAvailable")}
                </p>
              </div>
            </div>

            <div className="group rounded-2xl border border-slate-100 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-md hover:-translate-y-1 hover:shadow-md transition-all flex items-center gap-3">
              <div className="text-slate-400 group-hover:text-emerald-600 transition-colors">
                <FaBirthdayCake className="text-base" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t("dashboard.hero.birthDate")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {profile?.birthDate
                    ? new Date(profile.birthDate).toLocaleDateString(isAr ? "ar-EG" : "en-US", { year: 'numeric', month: 'short', day: 'numeric'})
                    : t("dashboard.hero.notSet")}
                </p>
              </div>
            </div>

            <div className="group rounded-2xl border border-slate-100 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-md hover:-translate-y-1 hover:shadow-md transition-all flex items-center gap-3">
              <div className="text-slate-400 group-hover:text-emerald-600 transition-colors">
                <FaVenusMars className="text-base" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t("dashboard.hero.gender")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {profile?.gender ? t(`profile.sections.patientDetails.genderOptions.${profile.gender.toLowerCase()}`) : t("dashboard.hero.notSet")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 content-center border-t lg:border-t-0 lg:border-s border-slate-100 pt-8 lg:pt-0 lg:ps-8">
          <div className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3.5 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                <FaMapMarkerAlt className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {t("dashboard.hero.location")}
                </p>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {address || t("dashboard.hero.updateProfile")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default PatientOverviewHero;
