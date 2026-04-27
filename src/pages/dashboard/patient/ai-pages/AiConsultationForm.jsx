import { FaBrain, FaSpinner, FaStethoscope } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { FORM_FIELDS, SYMPTOMS_LIST } from "./aiConsultationConfig";

function AiConsultationForm({
  form,
  isSubmitting,
  error,
  selectedSymptoms,
  onChange,
  onSymptomToggle,
  onSubmit,
  onReset,
}) {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-slate-900">
        <FaStethoscope /> Clinical Inputs
      </h2>

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {FORM_FIELDS.map((field) => (
          <label key={field.key} className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {t(field.labelKey, { defaultValue: field.label })}
            </span>
            <input
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              value={form[field.key]}
              onChange={(event) => onChange(field.key, event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </label>
        ))}
      </div>

      <div className="mt-6 block">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
          Select Symptoms
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {SYMPTOMS_LIST.map((symptom) => {
            const translatedSymptom = t(
              `aiConsultation.form.symptoms.${symptom}`,
              { defaultValue: symptom },
            );
            return (
              <label key={symptom} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedSymptoms.includes(symptom)}
                  onChange={() => onSymptomToggle(symptom)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-sm font-medium text-slate-700">
                  {translatedSymptom}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-500">
        Selected symptoms: {selectedSymptoms.length}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaBrain />}
          {isSubmitting ? "Generating..." : "Generate Consultation"}
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={isSubmitting}
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

export default AiConsultationForm;
