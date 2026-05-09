import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaPlus, FaTimes, FaSave } from "react-icons/fa";

export default function DiseaseForm({
  show,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}) {
  const [formData, setFormData] = useState({
    diseaseName: "",
    diseaseType: "",
    description: "",
    symptoms: "",
  });

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
      isSupportedByAi: false,
    };

    await onSubmit(payload);

    if (!error) {
      setFormData({
        diseaseName: "",
        diseaseType: "",
        description: "",
        symptoms: "",
      });
    }
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
          className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden"
        >
          <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                <FaPlus />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Add Disease
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Create a new disease entry
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600 flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Disease Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="diseaseName"
                  value={formData.diseaseName}
                  onChange={handleChange}
                  placeholder="e.g., Diabetes, Hypertension"
                  required
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-sm font-medium transition-all hover:bg-white"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Disease Type
                </label>
                <input
                  type="text"
                  name="diseaseType"
                  value={formData.diseaseType}
                  onChange={handleChange}
                  placeholder="e.g., Metabolic, Cardiovascular"
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-sm font-medium transition-all hover:bg-white"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the disease..."
                  rows={3}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-sm font-medium transition-all hover:bg-white resize-none"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Symptoms
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Common symptoms associated with this disease..."
                  rows={3}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-sm font-medium transition-all hover:bg-white resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-2xl px-6 py-4 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.diseaseName.trim()}
                className="flex-1 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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
