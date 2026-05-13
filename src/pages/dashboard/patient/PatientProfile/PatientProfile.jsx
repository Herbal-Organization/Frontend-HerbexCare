import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import ProfileLayout from "../../../../components/shared/ProfileLayout";
import PatientDashboardState from "../../../../components/patient/PatientDashboardState";
import usePatientProfileForm from "../../../../hooks/usePatientProfileForm";
import {
  DEFAULT_ADDRESS,
  DEFAULT_MEDICAL_HISTORY,
  DEFAULT_PATIENT_INFO,
  markProfileAsComplete,
} from "../../../../services/patientProfile";

// Import section components
import ProfilePhotoSection from "./sections/ProfilePhotoSection";
import PersonalInformationSection from "./sections/PersonalInformationSection";
import PatientDetailsSection from "./sections/PatientDetailsSection";
import AddressInformationSection from "./sections/AddressInformationSection";
import MedicalHistorySection from "./sections/MedicalHistorySection";

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
          ℹ️ {t("profile.messages.completionRequired") || "Please fill in your personal information to complete your profile setup."}
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Profile Sections */}
        <ProfilePhotoSection
          profile={profile}
          setProfile={setProfile}
          user={user}
        />
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
