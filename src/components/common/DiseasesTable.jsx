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
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 dark:border-slate-700" />
      </div>
    );
  }

  if (diseases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800 sm:p-12 lg:p-16">
        <div className="mb-6 flex h-20 w-20 rotate-3 items-center justify-center rounded-3xl bg-slate-50 sm:h-24 sm:w-24 dark:bg-slate-900">
          <FaVirus className="h-10 w-10 text-slate-200 dark:text-slate-600" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 sm:text-2xl">
          No diseases yet
        </h3>
        <p className="mb-8 mt-3 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-base">
          Start by adding your first disease entry to the system. This will help
          you organize and manage recipes better.
        </p>
        <button
          onClick={onAddClick}
          className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-1 dark:bg-slate-700"
        >
          <FaPlus /> Add First Disease
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="space-y-3 p-3 sm:p-4 lg:hidden">
        {diseases.map((disease) => {
          const symptoms = parseSymptoms(disease.symptoms);
          const visibleSymptoms = symptoms.slice(0, 3);

          return (
            <article
              key={disease.diseaseId}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <FaVirus className="text-sm" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-slate-900 dark:text-slate-100">
                      {disease.diseaseName}
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {disease.diseaseType || "General condition"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                {disease.description || "No description"}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {visibleSymptoms.length ? (
                  visibleSymptoms.map((symptom, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    >
                      {symptom}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-slate-400 dark:text-slate-500">
                    No symptoms
                  </span>
                )}
                {symptoms.length > 3 && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    +{symptoms.length - 3}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => onViewDetails?.(disease)}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
            <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Disease Name
              </th>
              <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Type
              </th>
              <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Description
              </th>
              <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Symptoms
              </th>
              <th className="px-6 py-4 text-end text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {diseases.map((disease) => (
              <tr
                key={disease.diseaseId}
                className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-700/30"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <FaVirus className="text-sm" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {disease.diseaseName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {disease.diseaseType ? (
                    <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {disease.diseaseType}
                    </span>
                  ) : (
                    <span className="text-xs italic text-slate-400 dark:text-slate-500">
                      —
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                    {disease.description || (
                      <span className="italic text-slate-400 dark:text-slate-500">
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
                            className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          >
                            {symptom}
                          </span>
                        ))}
                      {parseSymptoms(disease.symptoms).length > 3 && (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                          +{parseSymptoms(disease.symptoms).length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs italic text-slate-400 dark:text-slate-500">
                      No symptoms
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-end">
                  <button
                    type="button"
                    onClick={() => onViewDetails?.(disease)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
