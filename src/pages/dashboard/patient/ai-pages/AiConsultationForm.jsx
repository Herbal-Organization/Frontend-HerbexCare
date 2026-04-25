import { FaBrain, FaSpinner, FaStethoscope } from "react-icons/fa";
import { FORM_FIELDS } from "./aiConsultationConfig";

function AiConsultationForm({
  form,
  isSubmitting,
  error,
  selectedSymptoms,
  onChange,
  onSubmit,
  onReset,
}) {
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
              {field.label}
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

      <label className="mt-5 block space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Symptoms (comma or new line separated)
        </span>
        <textarea
          value={form.symptomsText}
          onChange={(event) => onChange("symptomsText", event.target.value)}
          placeholder="headache, fatigue, nausea"
          disabled={isSubmitting}
          className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        />
      </label>

      <p className="mt-3 text-xs font-semibold text-slate-500">
        Parsed symptoms: {selectedSymptoms.length}
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
