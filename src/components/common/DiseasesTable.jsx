import React from "react";
import { FaVirus, FaPlus, FaEye } from "react-icons/fa";

const parseSymptoms = (symptomsString) => {
  if (!symptomsString) return [];
  return symptomsString
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

export default function DiseasesTable({
  diseases,
  isLoading,
  onAddClick,
  onViewDetails,
  showAiSupport = false,
}) {
  const renderAiSupport = (disease) => {
    const supportedValue = disease?.isSupportedByAi;
    const isSupported =
      supportedValue === true ||
      supportedValue === "true" ||
      supportedValue === "True" ||
      supportedValue === 1;

    return isSupported ? (
      <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
        AI enabled
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500">
        Not supported
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (diseases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center sm:p-12 lg:p-16">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 rotate-3 sm:h-24 sm:w-24">
          <FaVirus className="h-10 w-10 text-slate-200" />
        </div>
        <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
          No diseases yet
        </h3>
        <p className="mb-8 mt-3 max-w-sm text-sm font-medium text-slate-500 sm:text-base">
          Start by adding your first disease entry to the system. This will help
          you organize and manage recipes better.
        </p>
        <button
          onClick={onAddClick}
          className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/10 hover:-translate-y-1 transition-all"
        >
          <FaPlus /> Add First Disease
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-3 p-3 sm:p-4 lg:hidden">
        {diseases.map((disease) => {
          const symptoms = parseSymptoms(disease.symptoms);
          const visibleSymptoms = symptoms.slice(0, 3);

          return (
            <article
              key={disease.diseaseId}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <FaVirus className="text-sm" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-slate-900">
                      {disease.diseaseName}
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {disease.diseaseType || "General condition"}
                    </p>
                  </div>
                </div>
                {showAiSupport ? renderAiSupport(disease) : null}
              </div>

              <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                {disease.description || "No description"}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {visibleSymptoms.length ? (
                  visibleSymptoms.map((symptom, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700"
                    >
                      {symptom}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-slate-400">
                    No symptoms
                  </span>
                )}
                {symptoms.length > 3 && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    +{symptoms.length - 3}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => onViewDetails?.(disease)}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:border-indigo-500 hover:text-indigo-600"
              >
                <FaEye className="text-[10px]" />
                View Details
              </button>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-wider text-slate-600">
                Disease Name
              </th>
              <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-wider text-slate-600">
                Type
              </th>
              <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-wider text-slate-600">
                Description
              </th>
              <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-wider text-slate-600">
                Symptoms
              </th>
              {showAiSupport && (
                <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-wider text-slate-600">
                  AI Diagnostic
                </th>
              )}
              <th className="px-6 py-4 text-end text-xs font-black uppercase tracking-wider text-slate-600">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {diseases.map((disease) => (
              <tr
                key={disease.diseaseId}
                className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <FaVirus className="text-sm" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {disease.diseaseName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {disease.diseaseType ? (
                    <span className="inline-flex px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700">
                      {disease.diseaseType}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {disease.description || (
                      <span className="text-slate-400 italic">
                        No description
                      </span>
                    )}
                  </p>
                </td>
                <td className="px-6 py-4">
                  {disease.symptoms ? (
                    <div className="flex flex-wrap gap-1.5">
                      {parseSymptoms(disease.symptoms)
                        .slice(0, 3)
                        .map((symptom, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-700"
                          >
                            {symptom}
                          </span>
                        ))}
                      {parseSymptoms(disease.symptoms).length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                          +{parseSymptoms(disease.symptoms).length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      No symptoms
                    </span>
                  )}
                </td>
                {showAiSupport && (
                  <td className="px-6 py-4">{renderAiSupport(disease)}</td>
                )}
                <td className="px-6 py-4 text-end">
                  <button
                    type="button"
                    onClick={() => onViewDetails?.(disease)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:border-indigo-500 hover:text-indigo-600"
                  >
                    <FaEye className="text-[10px]" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
