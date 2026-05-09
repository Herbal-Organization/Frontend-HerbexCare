import { useState } from "react";
import { FaBrain } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { generateAiConsultation } from "../../../../api/aiConsultations";
import AiConsultationWizard from "./AiConsultationWizard";
import AiConsultationResult from "./AiConsultationResult";
import WizardStepper from "./WizardStepper";
import { INITIAL_FORM, WIZARD_STEPS } from "./aiConsultationConfig";
import { parseApiError, toNumber } from "./aiConsultationUtils";

function PatientAiConsultation() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState("demographics");

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
      setError("Please add at least one symptom.");
      return;
    }

    const payload = {
      // Demographics
      age: toNumber(form.age),
      gender: form.gender,
      weightKg: toNumber(form.weightKg),
      heightCm: toNumber(form.heightCm),
      // Medical History
      hasDiabetes: form.hasDiabetes,
      hasHypertension: form.hasHypertension,
      hasAllergies: form.hasAllergies,
      isPregnant: form.isPregnant,
      isSmoker: form.isSmoker,
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
      toast.success("AI recipe generated successfully!");
    } catch (submitError) {
      const message = parseApiError(submitError);
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            AI Recipe Generator
          </h1>
          <p className="text-slate-600">
            Get personalized herbal recipes based on your health profile
          </p>
        </div>
      </div>

      {/* Stepper */}
      <WizardStepper currentStep={currentStep} />

      {/* Wizard Form */}
      <AiConsultationWizard
        form={form}
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
