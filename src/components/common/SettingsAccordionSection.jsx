import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa";

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
};

function SettingsAccordionSection({
  id,
  isOpen,
  onToggle,
  icon: Icon,
  iconWrapperClassName,
  title,
  description,
  variant = "default",
  children,
}) {
  const { t } = useTranslation();
  const isDanger = variant === "danger";

  return (
    <motion.section
      variants={itemVariants}
      className={`overflow-hidden rounded-[1.75rem] border shadow-sm transition-shadow ${
        isDanger
          ? "border-rose-200 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/30"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      } ${isOpen ? "ring-2 ring-primary/15 dark:ring-primary/25" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`settings-panel-${id}`}
        className="flex w-full items-center gap-4 p-5 text-start transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 sm:p-6"
      >
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconWrapperClassName}`}
        >
          <Icon className="text-lg" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className={`text-lg font-bold sm:text-xl ${
              isDanger
                ? "text-rose-950 dark:text-rose-100"
                : "text-slate-900 dark:text-slate-50"
            }`}
          >
            {title}
          </h2>
          <p
            className={`mt-0.5 line-clamp-2 text-sm ${
              isDanger
                ? "text-rose-800 dark:text-rose-300"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {description}
          </p>
        </div>

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
            isOpen
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          }`}
          aria-hidden
        >
          <FaChevronDown
            className={`text-sm transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={`settings-panel-${id}`}
            role="region"
            aria-label={title}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className={`border-t px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5 ${
                isDanger
                  ? "border-rose-200/80 dark:border-rose-900/50"
                  : "border-slate-100 dark:border-slate-800"
              }`}
            >
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <span className="sr-only">
        {isOpen
          ? t("dashboardSettings.sections.collapse")
          : t("dashboardSettings.sections.expand")}
      </span>
    </motion.section>
  );
}

export default SettingsAccordionSection;
