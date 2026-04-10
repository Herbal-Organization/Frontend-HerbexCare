import { motion } from "motion/react";
import PatientAddressCard from "../../../components/patient/PatientAddressCard";
import PatientDashboardState from "../../../components/patient/PatientDashboardState";
import PatientMedicalSummary from "../../../components/patient/PatientMedicalSummary";
import PatientOverviewHero from "../../../components/patient/PatientOverviewHero";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

function PatientDashboardOverview({ user, dashboardData, isLoading, error, onRetry }) {
  if (isLoading) {
    return (
      <div className="p-8">
        <PatientDashboardState
          title="Loading your dashboard"
          description="We're fetching your address and medical history."
          action={
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          }
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <PatientDashboardState
          title="Unable to load dashboard data"
          description={error}
          action={
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Try Again
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
          title="No dashboard data yet"
          description="Once your profile data is available, it will appear here."
        />
      </div>
    );
  }

  const { profile } = dashboardData;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      <PatientOverviewHero user={user} profile={profile} />

      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.3fr_0.9fr]">
        <PatientMedicalSummary profile={profile} />
        <PatientAddressCard profile={profile} />
      </section>
    </motion.div>
  );
}

export default PatientDashboardOverview;
