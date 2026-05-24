import { useOutletContext, Link } from "react-router-dom";
import { FaClock, FaEye, FaPlus, FaTimes } from "react-icons/fa";

const parseSymptoms = (symptomsString) => {
  if (!symptomsString) return [];

  return symptomsString
    .replaceAll(String.fromCharCode(10), ",")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
};

function PendingCard({ disease, disabled, onView, onApprove, onReject }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              {disease.diseaseName}
            </h3>
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
              Pending review
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {disease.diseaseType || "No disease type provided"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onView(disease)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 transition-colors hover:border-emerald-500 hover:text-emerald-700"
        >
          <FaEye className="text-[10px]" />
          View
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <p className="text-sm leading-6 text-slate-600">
          {disease.description || "No description provided."}
        </p>

        {disease.symptoms ? (
          <div className="flex flex-wrap gap-2">
            {parseSymptoms(disease.symptoms)
              .slice(0, 4)
              .map((symptom) => (
                <span
                  key={symptom}
                  className="inline-flex rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-700"
                >
                  {symptom}
                </span>
              ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => onApprove(disease)}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disabled ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FaPlus className="text-xs" />
            )}
            Approve
          </button>
          <button
            type="button"
            onClick={() => onReject(disease)}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:border-rose-400 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaTimes className="text-xs" />
            Reject
          </button>
        </div>
      </div>
    </article>
  );
}

function AdminDiseasesPendingPage() {
  const {
    pendingDiseases,
    isLoading,
    error,
    processingDiseaseIds,
    isProcessing,
    runPendingAction,
    handleOpenDetails,
  } = useOutletContext();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2">
            <Link
              to=".."
              relative="path"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <span aria-hidden="true">←</span>
              Back to Registry
            </Link>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Pending approvals</h2>
          <p className="mt-1 text-sm text-slate-500">
            Approve or reject diseases that are waiting for moderation.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
          <FaClock className="text-[10px]" />
          {pendingDiseases.length} awaiting review
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
        </div>
      ) : pendingDiseases.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          No diseases are waiting for approval.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {pendingDiseases.map((disease) => {
            const disabled = isProcessing(disease.diseaseId);
            return (
              <PendingCard
                key={disease.diseaseId}
                disease={disease}
                disabled={disabled || processingDiseaseIds.length > 0}
                onView={handleOpenDetails}
                onApprove={(item) => runPendingAction(item, approveDisease)}
                onReject={(item) => runPendingAction(item, rejectDisease)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AdminDiseasesPendingPage;