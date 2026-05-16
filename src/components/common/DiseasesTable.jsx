import React from "react";
import { motion } from "motion/react";
import { FaVirus, FaPlus } from "react-icons/fa";

export default function DiseasesTable({ diseases, isLoading, onAddClick }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (diseases.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center flex flex-col items-center justify-center">
        <div className="h-24 w-24 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 rotate-3">
          <FaVirus className="h-10 w-10 text-slate-200" />
        </div>
        <h3 className="text-2xl font-black text-slate-900">No diseases yet</h3>
        <p className="text-slate-500 font-medium max-w-sm mt-3 mb-8">
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm"
    >
      <div className="overflow-x-auto">
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
            </tr>
          </thead>
          <tbody>
            {diseases.map((disease, index) => (
              <motion.tr
                key={disease.diseaseId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
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
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
