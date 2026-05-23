import { useCallback, useEffect, useState } from "react";
import { savePatientProfile } from "@features/patient/services/patientProfile";

function usePatientProfileForm(initialProfile, options = {}) {
  const { onSaved } = options;
  const [profile, setProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const updateField = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setProfile((current) => {
      if (name === "genderName" || name === "gender") {
        return {
          ...current,
          genderName: nextValue,
          gender: nextValue,
        };
      }

      return {
        ...current,
        [name]: nextValue,
      };
    });
  }, []);

  const save = useCallback(async () => {
    setIsSaving(true);
    setSaveError("");

    try {
      await savePatientProfile(profile);
      onSaved?.();
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to update profile. Please try again.";
      setSaveError(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [onSaved, profile]);

  return {
    profile,
    isSaving,
    saveError,
    setProfile,
    updateField,
    save,
  };
}

export default usePatientProfileForm;
