import { FaHeartbeat, FaMapMarkedAlt, FaRegAddressCard } from "react-icons/fa";
import PatientAddressCard from "../../../components/patient/PatientAddressCard";
import PatientDashboardState from "../../../components/patient/PatientDashboardState";
import PatientMedicalSummary from "../../../components/patient/PatientMedicalSummary";
import PatientOverviewHero from "../../../components/patient/PatientOverviewHero";
import PatientSummaryCard from "../../../components/patient/PatientSummaryCard";
import { getActiveConditions } from "../../../services/patientProfile";

function PatientDashboardOverview({ user, dashboardData, isLoading, error, onRetry }) {
  if (isLoading) {
    return (
      <div className="p-8">
        <PatientDashboardState
          title="Loading your dashboard"
          description="We’re fetching your address and medical history."
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
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
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
  const activeConditions = getActiveConditions(profile);
  const addressCount = [
    profile.governorate,
    profile.city,
    profile.street,
  ].filter(Boolean).length;

  return (
    <div className="p-8 space-y-8">
      <PatientOverviewHero user={user} profile={profile} />

      <section className="grid gap-6 lg:grid-cols-3">
        <PatientSummaryCard
          eyebrow="Profile"
          title="Address sections completed"
          value={`${addressCount}/3`}
          caption="Governorate, city, and street fields connected to your profile."
          icon={<FaRegAddressCard />}
          tone="emerald"
        />
        <PatientSummaryCard
          eyebrow="Health"
          title="Active medical flags"
          value={String(activeConditions.length)}
          caption="Conditions currently marked in your medical history."
          icon={<FaHeartbeat />}
          tone="amber"
        />
        <PatientSummaryCard
          eyebrow="Status"
          title="Profile sync"
          value="Live"
          caption="Dashboard cards are driven by your saved API data."
          icon={<FaMapMarkedAlt />}
          tone="sky"
        />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <PatientMedicalSummary profile={profile} />
        <PatientAddressCard profile={profile} />
      </section>
    </div>
  );
}

export default PatientDashboardOverview;
