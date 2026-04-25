import { useMemo, useState } from "react";
import { FaBrain } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { generateAiConsultation } from "../../../../api/aiConsultations";
import AiConsultationForm from "./AiConsultationForm";
import AiConsultationResult from "./AiConsultationResult";
import { INITIAL_FORM } from "./aiConsultationConfig";
import { parseApiError, parseSymptoms, toNumber } from "./aiConsultationUtils";

function PatientAiConsultation() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const selectedSymptoms = useMemo(
    () => parseSymptoms(form.symptomsText),
    [form.symptomsText],
  );

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
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
      weightKg: toNumber(form.weightKg),
      heightCm: toNumber(form.heightCm),
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
      toast.success("AI consultation generated successfully");
    } catch (submitError) {
      const message = parseApiError(submitError);
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
          <FaBrain className="text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            AI Consultation
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Enter vital data and symptoms to generate an AI-driven consultation.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AiConsultationForm
          form={form}
          isSubmitting={isSubmitting}
          error={error}
          selectedSymptoms={selectedSymptoms}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />

        <AiConsultationResult result={result} />
      </div>
    </div>
  );
}

export default PatientAiConsultation;
