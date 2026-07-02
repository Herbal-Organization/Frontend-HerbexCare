import { motion as Motion } from "motion/react";
import PatientAddressCard from "@features/patient/components/PatientAddressCard";
import PatientDashboardState from "@features/patient/components/PatientDashboardState";
import PatientMedicalSummary from "@features/patient/components/PatientMedicalSummary";
import PatientOverviewHero from "@features/patient/components/PatientOverviewHero";
import PatientQuickAccess from "@features/patient/components/PatientQuickAccess";
import { useTranslation } from "react-i18next";
import { Spinner } from "@components/common";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

function PatientDashboardOverview({
  user,
  dashboardData,
  isLoading,
  error,
  onRetry,
}) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="p-8">
        <PatientDashboardState
          title={t("dashboard.states.loadingTitle")}
          description={t("dashboard.states.loadingDesc")}
          action={
            <Spinner size="md" />
          }
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <PatientDashboardState
          title={t("dashboard.states.errorTitle")}
          description={error}
          action={
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              {t("dashboard.states.retry")}
            </button>
          }
        />
      </div>
    );
  }

  if (!dashboardData?.profile) {
    return (
      <div className="p-8">
        <PatientDashboardState
          title={t("dashboard.states.noDataTitle")}
          description={t("dashboard.states.noDataDesc")}
        />
      </div>
    );
  }

  const { profile } = dashboardData;

  return (
    <Motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      <PatientOverviewHero user={user} profile={profile} />

      <PatientQuickAccess />

      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.3fr_0.9fr]">
        <PatientMedicalSummary profile={profile} />
        <PatientAddressCard profile={profile} />
      </section>
    </Motion.div>
  );
}

export default PatientDashboardOverview;
