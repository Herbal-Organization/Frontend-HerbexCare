import { motion, AnimatePresence } from "motion/react";
import { FaTimes, FaStethoscope, FaInfoCircle, FaTags } from "react-icons/fa";

const parseSymptoms = (symptomsString) => {
  if (!symptomsString) return [];
  return symptomsString
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

export default function DiseaseDetailsModal({ disease, isOpen, onClose }) {
  if (!isOpen || !disease) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="relative bg-emerald-900 px-6 py-8 text-white">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <FaTimes className="text-sm" />
            </button>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 p-2">
                <FaStethoscope className="text-xl text-emerald-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Disease Details
              </span>
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight">
              {disease.diseaseName}
            </h2>
          </div>

          <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FaTags className="text-xs text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Disease Type
                </h3>
              </div>
              <p className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                {disease.diseaseType || "General Condition"}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-xs text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Description
                </h3>
              </div>
              <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                {disease.description ||
                  "No description available for this condition."}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <FaStethoscope className="text-xs text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Symptoms
                </h3>
              </div>
              {disease.symptoms ? (
                <div className="flex flex-wrap gap-2">
                  {parseSymptoms(disease.symptoms).map((symptom, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-100/50 bg-emerald-50/50 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
                  <p className="text-sm font-medium leading-relaxed text-emerald-900 dark:text-emerald-300">
                    Commonly recognized symptoms for this condition.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/50">
            <button
              onClick={onClose}
              className="active:scale-95 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
