import { FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";
import {
  WIZARD_STEPS,
  FORM_FIELDS,
  MEDICAL_HISTORY_FIELDS,
  SYMPTOMS_LIST,
  getInputPlaceholder,
} from "./aiConsultationConfig";

function AiConsultationWizard({
  form,
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
  const demographicsFields = FORM_FIELDS.filter(
    (f) => f.section === "demographics",
  );
  const vitalsFields = FORM_FIELDS.filter((f) => f.section === "vitals");
  const currentStepData = WIZARD_STEPS.find((s) => s.id === currentStep);

  const renderDemographicsStep = () => (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {demographicsFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              {field.label}
            </label>
            {field.type === "select" ? (
              <select
                value={form[field.key]}
                onChange={(e) => onChange(field.key, e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder={getInputPlaceholder(field.key)}
                value={form[field.key]}
                onChange={(e) => onChange(field.key, e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMedicalStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 mb-4">
        Check any conditions that apply to you
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {MEDICAL_HISTORY_FIELDS.map((field) => (
          <label
            key={field.key}
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50 transition"
          >
            <input
              type="checkbox"
              checked={form[field.key] || false}
              onChange={(e) => onCheckboxChange(field.key, e.target.checked)}
              disabled={isSubmitting}
              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700">
              {field.label}
            </span>
          </label>
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
              {field.label}
            </label>
            <input
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              placeholder={getInputPlaceholder(field.key)}
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
        Select all symptoms you're experiencing
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
        Selected: {selectedSymptoms.length} symptoms
      </p>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="font-semibold text-slate-900 mb-2">Demographics</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <p>Age: {form.age || "—"} years</p>
            <p>Gender: {form.gender || "—"}</p>
            <p>Weight: {form.weightKg || "—"} kg</p>
            <p>Height: {form.heightCm || "—"} cm</p>
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="font-semibold text-slate-900 mb-2">Medical History</h4>
          <div className="text-sm text-slate-600">
            {[
              form.hasDiabetes && "✓ Diabetes",
              form.hasHypertension && "✓ Hypertension",
              form.hasAllergies && "✓ Known Allergies",
              form.isPregnant && "✓ Pregnant",
              form.isSmoker && "✓ Smoker",
            ]
              .filter(Boolean)
              .join(", ") || "No conditions selected"}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="font-semibold text-slate-900 mb-2">Vital Signs</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <p>
              BP: {form.systolicBp || "—"}/{form.diastolicBp || "—"} mmHg
            </p>
            <p>Temperature: {form.temperatureCelsius || "—"}°C</p>
            <p>Heart Rate: {form.heartRateBpm || "—"} BPM</p>
            <p>Symptom Duration: {form.symptomDurationDays || "—"} days</p>
            <p>Severity: {form.severityScore || "—"}/10</p>
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50 p-4">
          <h4 className="font-semibold text-emerald-900 mb-2">Symptoms</h4>
          <div className="text-sm text-emerald-700">
            {selectedSymptoms.length > 0
              ? selectedSymptoms.join(", ")
              : "No symptoms selected"}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case "demographics":
        return renderDemographicsStep();
      case "medical":
        return renderMedicalStep();
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
              {currentStepData?.title}
            </h2>
            <p className="text-sm text-slate-600">
              {currentStepData?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
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
          Previous
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            Reset
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
                Generating...
              </>
            ) : currentStep === "review" ? (
              <>Generate Recipe</>
            ) : (
              <>
                Next
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
