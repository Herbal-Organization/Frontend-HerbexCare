function AiConsultationResult({ result }) {
  return (
    <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-4 text-lg font-extrabold text-slate-900">
        Consultation Result
      </h2>

      {!result ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500">
          Submit the consultation form to view AI recommendations.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            Consultation generated successfully.
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <pre className="max-h-112 overflow-auto whitespace-pre-wrap wrap-break-word text-xs font-semibold text-slate-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}

export default AiConsultationResult;
