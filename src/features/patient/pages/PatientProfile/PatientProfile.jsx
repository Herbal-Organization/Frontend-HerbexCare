import { useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ProfileLayout from "@components/common/ProfileLayout";
import PatientDashboardState from "@features/patient/components/PatientDashboardState";
import usePatientProfileForm from "@features/patient/hooks/usePatientProfileForm";
import {
  DEFAULT_ADDRESS,
  DEFAULT_MEDICAL_HISTORY,
  DEFAULT_PATIENT_INFO,
  markProfileAsComplete,
} from "@features/patient/services/patientProfile";

// Import section components

import PersonalInformationSection from "./sections/PersonalInformationSection";
import PatientDetailsSection from "./sections/PatientDetailsSection";
import AddressInformationSection from "./sections/AddressInformationSection";
import MedicalHistorySection from "./sections/MedicalHistorySection";

const medicalHistoryFields = [
  "diabetes",
  "hypertension",
  "asthma",
  "heartDisease",
  "kidneyDisease",
  "liverDisease",
  "smoker",
  "pregnancy",
  "allergies",
];

const completionFields = [
  (profile, user) => user?.fullName || user?.name,
  (profile, user) => user?.email,
  (profile, user) => user?.userName || user?.username,
  (profile, user) => user?.phone,
  (profile) => profile?.birthDate,
  (profile) => profile?.genderName || profile?.gender,
  (profile) => profile?.governorate,
  (profile) => profile?.city,
  (profile) => profile?.street,
  (profile) => profile?.otherNotes,
  ...medicalHistoryFields.map((field) => (profile) => profile?.[field]),
];

const PROFILE_COMPLETION_SEGMENTS = 20;

function getProfileCompletionPercent(profile, user) {
  const filled = completionFields.reduce((count, getValue) => {
    const value = getValue(profile, user);
    if (typeof value === "boolean") {
      return count + (value ? 1 : 0);
    }

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return count + 1;
    }

    return count;
  }, 0);

  return Math.round((filled / completionFields.length) * 100);
}

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function PatientProfile({ user, dashboardData, isLoading, onProfileUpdated }) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const requireCompletion = searchParams.get("requireCompletion") === "true";

  const initialProfile = useMemo(() => {
    const rawProfile = dashboardData?.profile ?? {
      ...DEFAULT_PATIENT_INFO,
      ...DEFAULT_ADDRESS,
      ...DEFAULT_MEDICAL_HISTORY,
    };

    let formattedBirthDate = rawProfile.birthDate || "";
    if (formattedBirthDate) {
      try {
        const d = new Date(formattedBirthDate);
        if (!isNaN(d.getTime())) {
          formattedBirthDate = d.toISOString().split("T")[0];
        }
      } catch (e) {
        console.error("Invalid birthDate format", e);
      }
    }

    return {
      ...rawProfile,
      birthDate: formattedBirthDate,
    };
  }, [dashboardData?.profile]);

  const { profile, isSaving, saveError, setProfile, updateField, save } =
    usePatientProfileForm(initialProfile, {
      onSaved: () => {
        // Mark profile as complete after successful save
        markProfileAsComplete();
        onProfileUpdated?.();
      },
    });

  const profileCompletion = useMemo(
    () => getProfileCompletionPercent(profile, user),
    [profile, user],
  );
  const completedSegments = Math.round(
    (profileCompletion / 100) * PROFILE_COMPLETION_SEGMENTS,
  );

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile, setProfile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const didSave = await save();

    if (didSave) {
      toast.success(t("profile.messages.success"));
      return;
    }

    toast.error(saveError || t("profile.messages.error"));
  };

  // ============= RENDER =============

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-sm font-medium text-slate-500">
          {t("profile.messages.loading")}
        </p>
      </div>
    );
  }

  if (!dashboardData?.profile) {
    return (
      <div className="p-6">
        <PatientDashboardState
          title={t("profile.messages.unavailableTitle")}
          description={t("profile.messages.unavailableDescription")}
        />
      </div>
    );
  }

  return (
    <ProfileLayout
      title={t("profile.title")}
      subtitle={t("profile.subtitle")}
      saving={isSaving}
      onSubmit={handleSubmit}
    >
      {requireCompletion && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"
        >
          ℹ️{" "}
          {t("profile.messages.completionRequired") ||
            "Please fill in your personal information to complete your profile setup."}
        </motion.div>
      )}

      {saveError ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 rounded-2xl border border-eed-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {saveError}
        </motion.div>
      ) : null}

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-4xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {t("profile.completion.title")}
            </p>
            <p className="text-xs text-slate-500">
              {t("profile.completion.helper")}
            </p>
          </div>
          <p className="text-sm font-semibold text-primary">
            {t("profile.completion.subtitle", { percent: profileCompletion })}
          </p>
        </div>

        <div className="mt-4 flex gap-1.5">
          {Array.from({ length: PROFILE_COMPLETION_SEGMENTS }).map(
            (_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                  index < completedSegments ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            ),
          )}
        </div>
      </motion.section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Profile Sections */}

        <PersonalInformationSection user={user} />
        <PatientDetailsSection profile={profile} updateField={updateField} />
        <AddressInformationSection
          profile={profile}
          updateField={updateField}
        />
        <MedicalHistorySection profile={profile} updateField={updateField} />
      </motion.div>
    </ProfileLayout>
  );
}

export default PatientProfile;
