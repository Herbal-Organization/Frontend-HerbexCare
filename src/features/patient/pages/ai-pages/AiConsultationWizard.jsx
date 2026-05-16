import { FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  WIZARD_STEPS,
  FORM_FIELDS,
  MEDICAL_HISTORY_FIELDS,
  SYMPTOMS_LIST,
  getInputPlaceholder,
} from "./aiConsultationConfig";

function AiConsultationWizard({
  form,
  profile,
  isSubmitting,
  error,
  selectedSymptoms,
  currentStep,
  onChange,
  onCheckboxChange,
  onSymptomToggle,
  onNextStep,
  onPreviousStep,
  onSubmit,
  onReset,
}) {
  const { t } = useTranslation();
  const physicalFields = FORM_FIELDS.filter(
    (f) => f.section === "demographics",
  );
  const vitalsFields = FORM_FIELDS.filter((f) => f.section === "vitals");
  const currentStepData = WIZARD_STEPS.find((s) => s.id === currentStep);

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

  const renderDemographicsStep = () => (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {physicalFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              {t(field.labelKey)}
            </label>
            <input
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              placeholder={t(getInputPlaceholder(field.key))}
              value={form[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </div>
        ))}
      </div>
    </div>
  );


  const renderVitalsStep = () => (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {vitalsFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              {t(field.labelKey)}
            </label>
            <input
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              placeholder={t(getInputPlaceholder(field.key))}
              value={form[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSymptomsStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 mb-4">
        {t("aiConsultation.form.symptomsInstruction")}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {SYMPTOMS_LIST.map((symptom) => (
          <label
            key={symptom}
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50 transition"
          >
            <input
              type="checkbox"
              checked={selectedSymptoms.includes(symptom)}
              onChange={() => onSymptomToggle(symptom)}
              disabled={isSubmitting}
              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700">
              {symptom}
            </span>
          </label>
        ))}
      </div>
      <p className="text-sm font-medium text-emerald-600 mt-4">
        {t("aiConsultation.form.selectedCount", { count: selectedSymptoms.length })}
      </p>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="font-semibold text-slate-900 mb-2">{t("aiConsultation.form.sections.demographics")}</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <p>{t("aiConsultation.form.labels.age")}: {calculateAge(profile?.birthDate) || "—"} {t("aiConsultation.form.units.years")}</p>
            <p>{t("aiConsultation.form.labels.gender")}: {profile?.gender ? t(`profile.sections.patientDetails.genderOptions.${profile.gender.toLowerCase()}`) : "—"}</p>
            <p>{t("aiConsultation.form.labels.weightKg")}: {form.weightKg || "—"} {t("aiConsultation.form.units.kg")}</p>
            <p>{t("aiConsultation.form.labels.heightCm")}: {form.heightCm || "—"} {t("aiConsultation.form.units.cm")}</p>
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="font-semibold text-slate-900 mb-2">{t("aiConsultation.form.sections.medicalHistory")}</h4>
          <div className="text-sm text-slate-600">
            {[
              profile?.diabetes && `✓ ${t("profile.sections.medicalHistory.conditions.diabetes")}`,
              profile?.hypertension && `✓ ${t("profile.sections.medicalHistory.conditions.hypertension")}`,
              profile?.asthma && `✓ ${t("profile.sections.medicalHistory.conditions.asthma")}`,
              profile?.heartDisease && `✓ ${t("profile.sections.medicalHistory.conditions.heartDisease")}`,
              profile?.kidneyDisease && `✓ ${t("profile.sections.medicalHistory.conditions.kidneyDisease")}`,
              profile?.liverDisease && `✓ ${t("profile.sections.medicalHistory.conditions.liverDisease")}`,
              profile?.smoker && `✓ ${t("profile.sections.medicalHistory.conditions.smoker")}`,
              profile?.pregnancy && `✓ ${t("profile.sections.medicalHistory.conditions.pregnancy")}`,
              profile?.allergies && `✓ ${t("profile.sections.medicalHistory.conditions.allergies")}`,
            ]
              .filter(Boolean)
              .join(", ") || t("aiConsultation.form.noConditions")}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="font-semibold text-slate-900 mb-2">{t("aiConsultation.form.sections.vitals")}</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <p>
              {t("aiConsultation.form.labels.systolicBp")}/{t("aiConsultation.form.labels.diastolicBp")}: {form.systolicBp || "—"}/{form.diastolicBp || "—"} {t("aiConsultation.form.units.mmHg")}
            </p>
            <p>{t("aiConsultation.form.labels.temperatureCelsius")}: {form.temperatureCelsius || "—"}°C</p>
            <p>{t("aiConsultation.form.labels.heartRateBpm")}: {form.heartRateBpm || "—"} {t("aiConsultation.form.units.bpm")}</p>
            <p>{t("aiConsultation.form.labels.symptomDurationDays")}: {form.symptomDurationDays || "—"} {t("aiConsultation.form.units.days")}</p>
            <p>{t("aiConsultation.form.labels.severityScore")}: {form.severityScore || "—"}/10</p>
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50 p-4">
          <h4 className="font-semibold text-emerald-900 mb-2">{t("aiConsultation.form.sections.symptoms")}</h4>
          <div className="text-sm text-emerald-700">
            {selectedSymptoms.length > 0
              ? selectedSymptoms.map(s => t(`aiConsultation.form.symptoms.${s.toLowerCase().replace(/ /g, "_")}`)).join(", ")
              : t("aiConsultation.form.noSymptoms")}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case "demographics":
        return renderDemographicsStep();
      case "vitals":
        return renderVitalsStep();
      case "symptoms":
        return renderSymptomsStep();
      case "review":
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === "review") {
          onSubmit(e);
        } else {
          onNextStep();
        }
      }}
      className="w-full"
    >
      {/* Step Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border border-emerald-100">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{currentStepData?.icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {t(currentStepData?.titleKey)}
            </h2>
            <p className="text-sm text-slate-600">
              {t(currentStepData?.descriptionKey)}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error ? (
        <div className="mb-6 rounded-lg border border-eed-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {/* Step Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 mb-6 shadow-sm">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 justify-between">
        <button
          type="button"
          onClick={onPreviousStep}
          disabled={currentStep === "demographics" || isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
        >
          <FaChevronLeft className="text-xs" />
          {t("aiConsultation.form.actions.previous")}
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {t("aiConsultation.form.actions.reset")}
          </button>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              (currentStep === "symptoms" && selectedSymptoms.length === 0)
            }
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin text-xs" />
                {t("aiConsultation.form.submitting")}
              </>
            ) : currentStep === "review" ? (
              <>{t("aiConsultation.form.submit")}</>
            ) : (
              <>
                {t("aiConsultation.form.actions.next")}
                <FaChevronRight className="text-xs" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default AiConsultationWizard;
