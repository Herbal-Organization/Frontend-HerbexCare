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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="relative bg-emerald-900 px-6 py-8 text-white">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <FaTimes className="text-sm" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-emerald-500/20 p-2 border border-emerald-500/30">
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

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
            {/* Disease Type */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaTags className="text-emerald-600 text-xs" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Disease Type
                </h3>
              </div>
              <p className="inline-flex rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                {disease.diseaseType || "General Condition"}
              </p>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaInfoCircle className="text-emerald-600 text-xs" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Description
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {disease.description ||
                  "No description available for this condition."}
              </p>
            </div>

            {/* Symptoms */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaStethoscope className="text-emerald-600 text-xs" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Symptoms
                </h3>
              </div>
              {disease.symptoms ? (
                <div className="flex flex-wrap gap-2">
                  {parseSymptoms(disease.symptoms).map((symptom, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                  <p className="text-sm leading-relaxed text-emerald-900 font-medium">
                    Commonly recognized symptoms for this condition.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-6 bg-slate-50 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
