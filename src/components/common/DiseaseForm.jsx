import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FaPlus, FaTimes, FaSave } from "react-icons/fa";

export default function DiseaseForm({
  show,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  showAiSupport = false,
}) {
  const initialFormData = {
    diseaseName: "",
    diseaseType: "",
    description: "",
    symptoms: "",
    isSupportedByAi: false,
  };

  const [formData, setFormData] = useState({
    ...initialFormData,
  });

  useEffect(() => {
    if (!show) {
      setFormData(initialFormData);
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.diseaseName.trim();

    if (!trimmedName) {
      return;
    }

    const payload = {
      diseaseName: trimmedName,
      diseaseType: formData.diseaseType.trim() || null,
      description: formData.description.trim() || null,
      symptoms: formData.symptoms.trim() || null,
      isSupportedByAi: formData.isSupportedByAi,
    };

    await onSubmit(payload);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  if (!show) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-700 dark:bg-slate-900/50 md:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <FaPlus />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Add Disease
                </h2>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Create a new disease entry
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 md:p-8">
            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="group">
                <label className="mb-2 block px-1 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Disease Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="diseaseName"
                  value={formData.diseaseName}
                  onChange={handleChange}
                  placeholder="e.g., Diabetes, Hypertension"
                  required
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition-all hover:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-800"
                />
              </div>

              <div className="group">
                <label className="mb-2 block px-1 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Disease Type
                </label>
                <input
                  type="text"
                  name="diseaseType"
                  value={formData.diseaseType}
                  onChange={handleChange}
                  placeholder="e.g., Metabolic, Cardiovascular"
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition-all hover:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-800"
                />
              </div>

              <div className="group">
                <label className="mb-2 block px-1 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the disease..."
                  rows={3}
                  className="block w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition-all hover:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-800"
                />
              </div>

              <div className="group">
                <label className="mb-2 block px-1 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Symptoms
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Common symptoms associated with this disease..."
                  rows={3}
                  className="block w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition-all hover:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-800"
                />
              </div>

              {showAiSupport && (
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm text-slate-600 transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    name="isSupportedByAi"
                    checked={formData.isSupportedByAi}
                    onChange={handleCheckboxChange}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 dark:border-slate-600"
                  />
                  <span>
                    <span className="block font-bold text-slate-900 dark:text-slate-100">
                      Supported by AI
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Mark this disease as available for AI diagnostics.
                    </span>
                  </span>
                </label>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-6 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-2xl px-6 py-4 text-sm font-bold text-slate-500 transition-colors hover:text-slate-700 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.diseaseName.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <FaSave />
                )}
                {isSubmitting ? "Creating..." : "Create Disease"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
