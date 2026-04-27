import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaEdit,
  FaPlus,
  FaTimes,
  FaDollarSign,
  FaChevronRight,
  FaTrashAlt,
  FaSave
} from "react-icons/fa";

export default function RecipeForm({
  show,
  editingRecipeId,
  description,
  instructions,
  price,
  selectedHerbs,
  selectedDiseaseIds,
  herbs,
  diseases,
  error,
  isSaving,
  isDeleting,
  addHerbRow,
  removeHerbRow,
  updateHerbRow,
  toggleDisease,
  resetForm,
  handleSubmit,
}) {
  if (!show) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.form
        key="recipe-form"
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl">
              {editingRecipeId ? <FaEdit /> : <FaPlus />}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {editingRecipeId ? "Update Recipe" : "Recipe Builder"}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Step-by-step Configuration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-12">
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

            {/* 1. Basic Details */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  General Information
                </h3>
              </div>

              <div className="grid gap-6">
                <div className="group">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary transition-colors">
                    Description
                  </label>
                  <input
                    value={description}
                    onChange={() => {}}
                    className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-sm border font-bold transition-all hover:bg-white"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary transition-colors">
                    Instructions
                  </label>
                  <textarea
                    value={instructions}
                    onChange={() => {}}
                    className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-sm border font-medium transition-all hover:bg-white resize-none min-h-[140px]"
                  />
                </div>

                <div className="group md:max-w-xs">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary transition-colors">
                    Price
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 group-focus-within:text-primary transition-colors">
                      <FaDollarSign />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={() => {}}
                      className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-4 pl-12 pr-16 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-lg border font-black transition-all hover:bg-white"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 border-l border-slate-200 ml-4 pl-4 uppercase text-[10px] font-black text-slate-400">
                      EGP
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Composition */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Herbs Ingredients
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addHerbRow}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
                >
                  <FaPlus /> Add Herb
                </button>
              </div>

              <div className="grid gap-3">
                {selectedHerbs.map((item, index) => (
                  <div
                    key={`herb-row-${index}`}
                    className="group flex flex-col md:flex-row gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all items-center"
                  >
                    <div className="relative flex-1 w-full">
                      <select
                        value={item.herbId}
                        onChange={() => {}}
                        className="block w-full rounded-xl border-slate-200 bg-white py-3 pl-4 pr-10 outline-none focus:border-primary text-slate-900 text-sm border font-bold cursor-pointer appearance-none shadow-sm"
                      >
                        <option value="">Select an ingredient...</option>
                        {herbs.map((h) => (
                          <option key={h.herbId} value={h.herbId}>
                            {h.herbName}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                        <FaChevronRight className="rotate-90 text-[10px]" />
                      </div>
                    </div>

                    <div className="relative w-full md:w-32">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={() => {}}
                        placeholder="Qty"
                        className="block w-full rounded-xl border-slate-200 bg-white py-3 px-4 outline-none focus:border-primary text-slate-900 text-sm border font-black shadow-sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeHerbRow(index)}
                      className="flex-none h-11 w-11 flex items-center justify-center rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Diseases */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                  3
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Target Diseases
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {diseases.map((disease) => {
                  const isSelected = selectedDiseaseIds.includes(
                    disease.diseaseId,
                  );
                  return (
                    <button
                      key={disease.diseaseId}
                      type="button"
                      onClick={() => toggleDisease(disease.diseaseId)}
                      className={`relative text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-24 ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300"}`}
                    >
                      <span
                        className={`text-xs font-extrabold line-clamp-2 ${isSelected ? "text-primary" : "text-slate-900"}`}
                      >
                        {disease.diseaseName}
                      </span>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                        {disease.diseaseType}
                      </span>
                      {isSelected && (
                        <span className="absolute top-3 right-3 text-primary text-sm">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-2xl px-8 py-4 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Discard Changes
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-2xl bg-primary px-10 py-4 text-sm font-black text-white hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent" />
            ) : (
              <FaSave className="text-base" />
            )}
            {editingRecipeId ? "Commit Updates" : "Publish Recipe"}
          </button>
        </div>
      </motion.form>
    </AnimatePresence>
  );
}
