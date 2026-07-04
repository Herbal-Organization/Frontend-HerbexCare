import { useEffect, useState } from "react";
import { FaBan, FaSave, FaTimes } from "react-icons/fa";

const INITIAL_HERB_FORM = {
  herbName: "",
  scientificName: "",
  description: "",
  benefits: "",
  dosage: "",
  warnings: "",
  image: null,
};

function HerbFormModal({
  isOpen,
  herb,
  onClose,
  onSubmit,
  isSaving,
  formError,
}) {
  const [form, setForm] = useState(INITIAL_HERB_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(
        herb
          ? {
              herbName: herb.herbName || "",
              scientificName: herb.scientificName || "",
              description: herb.description || "",
              benefits: herb.benefits || "",
              dosage: herb.dosage || "",
              warnings: herb.warnings || "",
              image: null,
            }
          : INITIAL_HERB_FORM,
      );
    }
  }, [isOpen, herb]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] || null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.herbName.trim()) return;
    if (!form.scientificName.trim()) return;
    if (!form.description.trim()) return;
    onSubmit({
      herbName: form.herbName.trim(),
      scientificName: form.scientificName.trim(),
      description: form.description.trim(),
      benefits: form.benefits.trim(),
      dosage: form.dosage.trim(),
      warnings: form.warnings.trim(),
      image: form.image,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
              {herb ? "Edit Herb" : "New Herb"}
            </p>
            <h2 className="mt-2 text-xl font-black text-slate-900">
              {herb ? `Update "${herb.herbName}"` : "Add New Herb"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-700 shrink-0 disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 p-6 space-y-4"
        >
          {formError && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {formError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Herb Name *
              </label>
              <input
                type="text"
                name="herbName"
                value={form.herbName}
                onChange={handleChange}
                required
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Scientific Name *
              </label>
              <input
                type="text"
                name="scientificName"
                value={form.scientificName}
                onChange={handleChange}
                required
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              required
              className="block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Benefits
              </label>
              <textarea
                name="benefits"
                rows={3}
                value={form.benefits}
                onChange={handleChange}
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Warnings
              </label>
              <textarea
                name="warnings"
                rows={3}
                value={form.warnings}
                onChange={handleChange}
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Dosage
              </label>
              <input
                type="text"
                name="dosage"
                value={form.dosage}
                onChange={handleChange}
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-500 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-emerald-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-slate-300 disabled:opacity-50"
            >
              <FaBan className="text-xs" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <FaSave className="text-xs" />
              )}
              {herb ? "Save Changes" : "Create Herb"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HerbFormModal;
