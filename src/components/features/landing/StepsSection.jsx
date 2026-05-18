import { IoChatbubbleEllipses, IoReceiptSharp } from "react-icons/io5";
import { FaBrain } from "react-icons/fa";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

const MotionDiv = motion.div;

function StepsSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const steps = [
    {
      icon: <IoChatbubbleEllipses className="text-3xl" />,
      titleKey: "steps.step1.title",
      descriptionKey: "steps.step1.description",
    },
    {
      icon: <FaBrain className="text-3xl" />,
      titleKey: "steps.step2.title",
      descriptionKey: "steps.step2.description",
    },
    {
      icon: <IoReceiptSharp className="text-3xl" />,
      titleKey: "steps.step3.title",
      descriptionKey: "steps.step3.description",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-slate-100 dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-7xl">
        <MotionDiv
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-4 tracking-tight">
            {t("steps.title")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">{t("steps.description")}</p>
        </MotionDiv>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <MotionDiv
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm dark:shadow-slate-900/50 flex flex-col items-center text-center transition-transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: idx * 0.12 }}
            >
              <div className="w-14 h-14 bg-primary-light dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-primary dark:text-emerald-400 mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3 tracking-tight">
                {t(step.titleKey)}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                {t(step.descriptionKey)}
              </p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StepsSection;
