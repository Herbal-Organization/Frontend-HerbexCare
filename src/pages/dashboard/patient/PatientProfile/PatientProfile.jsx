import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ProfileLayout from "../../../../components/shared/ProfileLayout";
import PatientDashboardState from "../../../../components/patient/PatientDashboardState";
import usePatientProfileForm from "../../../../hooks/usePatientProfileForm";
import useAsyncAction from "../../../../hooks/useAsyncAction";
import {
  changePassword,
  deleteUserAccount,
} from "../../../../services/accountSettings";
import {
  DEFAULT_ADDRESS,
  DEFAULT_MEDICAL_HISTORY,
  DEFAULT_PATIENT_INFO,
} from "../../../../services/patientProfile";

// Import section components
import ProfilePhotoSection from "./sections/ProfilePhotoSection";
import PersonalInformationSection from "./sections/PersonalInformationSection";
import PatientDetailsSection from "./sections/PatientDetailsSection";
import AddressInformationSection from "./sections/AddressInformationSection";
import MedicalHistorySection from "./sections/MedicalHistorySection";
import ChangePasswordSection from "./sections/ChangePasswordSection";
import DeleteAccountSection from "./sections/DeleteAccountSection";

// Import modal components
import ChangePasswordModal from "./modals/ChangePasswordModal";
import DeleteAccountModal from "./modals/DeleteAccountModal";

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
      onSaved: onProfileUpdated,
    });

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile, setProfile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const didSave = await save();

    if (didSave) {
      toast.success("Profile updated successfully!");
      return;
    }

    toast.error(saveError || "Failed to update profile. Please try again.");
  };

  // ============= ACCOUNT SETTINGS STATE & LOGIC =============

  const navigate = useNavigate();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");

  // Change password form setup
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
    watch: watchPassword,
  } = useForm({
    defaultValues: {
      email: user?.email || "",
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPassword = watchPassword("newPassword");

  const {
    error: passwordError,
    isLoading: isPasswordLoading,
    execute: submitChangePassword,
    clearError: clearPasswordError,
  } = useAsyncAction(
    (data) => changePassword(data.email, data.oldPassword, data.newPassword),
    {
      defaultErrorMessage: "Password change failed. Please try again.",
      onSuccess: () => {
        toast.success("Password changed successfully!");
        resetPasswordForm();
        setShowChangePasswordModal(false);
      },
    },
  );

  const {
    error: deleteError,
    isLoading: isDeleteLoading,
    execute: submitDeleteAccount,
    clearError: clearDeleteError,
  } = useAsyncAction(() => deleteUserAccount(user?.userId || user?.id), {
    defaultErrorMessage: "Account deletion failed. Please try again.",
    onSuccess: () => {
      toast.success("Account deleted successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/auth");
      }, 1500);
    },
  });

  const onChangePasswordSubmit = async (data) => {
    clearPasswordError();
    try {
      await submitChangePassword(data);
    } catch {
      return;
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteEmailConfirm !== user?.email) {
      return;
    }

    if (!window.confirm("Are you absolutely sure? This cannot be undone.")) {
      return;
    }

    clearDeleteError();
    try {
      await submitDeleteAccount();
    } catch {
      return;
    }
  };

  // ============= RENDER =============

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData?.profile) {
    return (
      <div className="p-6">
        <PatientDashboardState
          title="Profile data is unavailable"
          description="We couldn't load your address and medical history yet."
        />
      </div>
    );
  }

  return (
    <ProfileLayout
      title="Patient Profile"
      subtitle="Manage your personal information and wellness preferences"
      saving={isSaving}
      onSubmit={handleSubmit}
    >
      {saveError ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
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

        {/* Account Settings Sections */}
        <ChangePasswordSection
          onOpenModal={() => {
            clearPasswordError();
            setShowChangePasswordModal(true);
          }}
        />
        <DeleteAccountSection
          onOpenModal={() => {
            clearDeleteError();
            setDeleteEmailConfirm("");
            setShowDeleteModal(true);
          }}
        />
      </motion.div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        isLoading={isPasswordLoading}
        error={passwordError}
        onSubmit={handlePasswordSubmit(onChangePasswordSubmit)}
        newPassword={newPassword}
        register={registerPassword}
        handleSubmit={handlePasswordSubmit}
        errors={passwordErrors}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        isLoading={isDeleteLoading}
        error={deleteError}
        onSubmit={handleDeleteAccount}
        deleteEmailConfirm={deleteEmailConfirm}
        onEmailChange={(e) => setDeleteEmailConfirm(e.target.value)}
        user={user}
      />
    </ProfileLayout>
  );
}

export default PatientProfile;
