import { FaBrain, FaSpinner, FaStethoscope } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  FORM_FIELDS,
  SYMPTOMS_LIST,
  MEDICAL_HISTORY_FIELDS,
  getInputPlaceholder,
} from "./aiConsultationConfig";

function AiConsultationForm({
  form,
  isSubmitting,
  error,
  selectedSymptoms,
  onChange,
  onCheckboxChange,
  onSymptomToggle,
  onSubmit,
  onReset,
}) {
  const { t } = useTranslation();
  const demographicsFields = FORM_FIELDS.filter(
    (f) => f.section === "demographics",
  );
  const vitalsFields = FORM_FIELDS.filter((f) => f.section === "vitals");

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-slate-900">
        <FaStethoscope /> {t("aiConsultation.form.title")}
      </h2>

      {error ? (
        <div className="mb-5 rounded-2xl border border-eed-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {/* Demographics Section */}
      <div className="mb-6">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
          {t("aiConsultation.form.sections.info")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {demographicsFields.map((field) => (
            <label key={field.key} className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {t(`aiConsultation.form.labels.${field.key}`)}
              </span>
              {field.type === "select" ? (
                <select
                  value={form[field.key]}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">{t("aiConsultation.form.placeholders.selectGender")}</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {t(`profile.sections.patientDetails.genderOptions.${opt.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  placeholder={t(`aiConsultation.form.placeholders.${field.key}`)}
                  value={form[field.key]}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Medical History Section */}
      <div className="mb-6">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
          {t("aiConsultation.form.sections.medical")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {MEDICAL_HISTORY_FIELDS.map((field) => (
            <label key={field.key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form[field.key] || false}
                onChange={(event) =>
                  onCheckboxChange(field.key, event.target.checked)
                }
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="text-sm font-medium text-slate-700">
                {t(`aiConsultation.form.labels.${field.key}`)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Vital Signs Section */}
      <div className="mb-6">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
          {t("aiConsultation.form.sections.vitals")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {vitalsFields.map((field) => (
            <label key={field.key} className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {t(`aiConsultation.form.labels.${field.key}`)}
              </span>
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder={t(getInputPlaceholder(field.key))}
                value={form[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Symptoms Section */}
      <div className="mb-6">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
          {t("aiConsultation.form.sections.symptoms")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {SYMPTOMS_LIST.map((symptom) => (
            <label key={symptom} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedSymptoms.includes(symptom)}
                onChange={() => onSymptomToggle(symptom)}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="text-sm font-medium text-slate-700">
                {t(`aiConsultation.form.symptoms.${symptom.toLowerCase().replace(/ /g, "_")}`)}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-500">
          {t("aiConsultation.form.selectedSymptoms", { count: selectedSymptoms.length })}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaBrain />}
          {isSubmitting ? t("aiConsultation.form.submitting") : t("aiConsultation.form.submit")}
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={isSubmitting}
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("aiConsultation.form.reset")}
        </button>
      </div>
    </form>
  );
}

export default AiConsultationForm;
