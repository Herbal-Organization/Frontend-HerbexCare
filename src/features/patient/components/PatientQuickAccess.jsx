import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FaUserMd,
  FaCommentDots,
  FaArrowRight,
  FaLeaf,
  FaHistory,
  FaBrain,
} from "react-icons/fa";

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const quickAccessItems = (t) => [
  {
    icon: FaUserMd,
    title: t("dashboard.quickAccess.herbalists.title", "All Herbalists"),
    description: t(
      "dashboard.quickAccess.herbalists.desc",
      "Browse experts and their recipes.",
    ),
    href: "/patient/home/herbalists",
    color: "bg-emerald-500",
    shadow: "shadow-emerald-200",
  },
  {
    icon: FaHistory,
    title: t("dashboard.quickAccess.feedbacks.title", "My Feedbacks"),
    description: t(
      "dashboard.quickAccess.feedbacks.desc",
      "Review your previous ratings & comments.",
    ),
    href: "/patient/dashboard/feedbacks",
    color: "bg-indigo-500",
    shadow: "shadow-indigo-200",
  },
  {
    icon: FaBrain,
    title: t("dashboard.quickAccess.consultation.title", "Generate Recipe"),
    description: t(
      "dashboard.quickAccess.consultation.desc",
      "AI-powered personalized healing.",
    ),
    href: "/patient/dashboard/ai-consultation",
    color: "bg-purple-500",
    shadow: "shadow-purple-200",
  },
];

function PatientQuickAccess() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
          {t("dashboard.quickAccess.sectionTitle", "Quick Access")}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickAccessItems(t).map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="relative group h-full"
            >
              <Link
                to={item.href}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6 flex flex-col items-start gap-4 h-full">
                  <div
                    className={`p-4 rounded-2xl ${item.color} text-white shadow-lg ${item.shadow}/40 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="text-2xl" />
                  </div>

                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div
                    className={`mt-2 flex items-center gap-2 text-sm font-bold ${item.color.replace("bg-", "text-")} group-hover:gap-3 transition-all`}
                  >
                    {t("common.explore", "Explore")}
                    <FaArrowRight className={`${isRtl ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute top-0 right-0 -tr-y-4 tr-x-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <Icon className="text-8xl" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default PatientQuickAccess;
