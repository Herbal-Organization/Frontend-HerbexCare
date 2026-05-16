import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaBrain, FaUserEdit, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { generateAiConsultation } from "@api/aiConsultations";
import AiConsultationWizard from "./AiConsultationWizard";
import AiConsultationResult from "./AiConsultationResult";
import WizardStepper from "./WizardStepper";
import { INITIAL_FORM, WIZARD_STEPS } from "./aiConsultationConfig";
import { parseApiError, toNumber } from "./aiConsultationUtils";
import { getUserFromToken } from "@utils/auth";
import usePatientDashboardData from "@hooks/usePatientDashboardData";

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

function PatientAiConsultation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useMemo(() => getUserFromToken(), []);
  const { data: dashboardData, isLoading: isDashboardLoading } =
    usePatientDashboardData(user?.userId || user?.id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState("demographics");

  const profile = dashboardData?.profile;
  const isProfileIncomplete = !profile?.birthDate || !profile?.gender;

  const selectedSymptoms = form.selectedSymptoms || [];

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCheckboxChange = (key, checked) => {
    setForm((current) => ({ ...current, [key]: checked }));
  };

  const handleSymptomToggle = (symptom) => {
    setForm((current) => {
      const symptoms = current.selectedSymptoms || [];
      const isSelected = symptoms.includes(symptom);
      return {
        ...current,
        selectedSymptoms: isSelected
          ? symptoms.filter((s) => s !== symptom)
          : [...symptoms, symptom],
      };
    });
  };

  const handleNextStep = () => {
    const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      setCurrentStep(WIZARD_STEPS[currentIndex + 1].id);
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(WIZARD_STEPS[currentIndex - 1].id);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setCurrentStep("demographics");
    setError("");
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!selectedSymptoms.length) {
      setError(t("aiConsultation.form.messages.symptomRequired"));
      return;
    }

    const age = calculateAge(profile.birthDate);

    const payload = {
      // Demographics from Profile & Form
      age,
      gender: profile.gender,
      weightKg: toNumber(form.weightKg),
      heightCm: toNumber(form.heightCm),
      // Medical History from Profile
      hasDiabetes: profile.diabetes,
      hasHypertension: profile.hypertension,
      hasAllergies: profile.allergies,
      isPregnant: profile.pregnancy,
      isSmoker: profile.smoker,
      // Vital Signs
      severityScore: toNumber(form.severityScore),
      systolicBp: toNumber(form.systolicBp),
      diastolicBp: toNumber(form.diastolicBp),
      temperatureCelsius: toNumber(form.temperatureCelsius),
      heartRateBpm: toNumber(form.heartRateBpm),
      symptomDurationDays: toNumber(form.symptomDurationDays),
      selectedSymptoms,
    };

    setIsSubmitting(true);
    setError("");

    try {
      const consultation = await generateAiConsultation(payload);
      setResult(consultation);
      toast.success(t("aiConsultation.form.messages.generateSuccess"));
    } catch (submitError) {
      const message = parseApiError(submitError);
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isDashboardLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600"></div>
        <p className="text-sm font-medium text-slate-500">
          {t("profile.messages.loading")}
        </p>
      </div>
    );
  }

  // Show force profile completion state
  if (isProfileIncomplete) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <FaExclamationTriangle className="text-3xl" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            {t("aiConsultation.profileIncomplete.title", "Profile Incomplete")}
          </h2>
          <p className="mb-8 text-slate-600">
            {t(
              "aiConsultation.profileIncomplete.description",
              "To provide accurate AI consultations, we need your birth date and gender from your profile. Please update your profile details to continue.",
            )}
          </p>
          <button
            onClick={() => navigate("/patient/dashboard/profile")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 shadow-md"
          >
            <FaUserEdit />
            {t("aiConsultation.profileIncomplete.action", "Update My Profile")}
          </button>
        </div>
      </div>
    );
  }

  // Show result if available
  if (result) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AiConsultationResult result={result} onNewConsultation={handleReset} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-white shadow-lg">
          <FaBrain className="text-3xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t("aiConsultation.nav.generator")}
          </h1>
          <p className="text-slate-600">
            {t("aiConsultation.subtitle")}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <WizardStepper currentStep={currentStep} />

      {/* Wizard Form */}
      <AiConsultationWizard
        form={form}
        profile={profile}
        isSubmitting={isSubmitting}
        error={error}
        selectedSymptoms={selectedSymptoms}
        currentStep={currentStep}
        onChange={handleChange}
        onCheckboxChange={handleCheckboxChange}
        onSymptomToggle={handleSymptomToggle}
        onNextStep={handleNextStep}
        onPreviousStep={handlePreviousStep}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />
    </div>
  );
}

export default PatientAiConsultation;
