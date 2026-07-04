import { FaTimes } from "react-icons/fa";

function HerbDetailsModal({ isOpen, herb, onClose }) {
  if (!isOpen || !herb) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
              Herb Details
            </p>
            <h2 className="mt-2 truncate text-xl font-black text-slate-900">
              {herb.herbName || "Herb"}
            </h2>
            {herb.scientificName && (
              <p className="mt-1 text-sm italic text-slate-500">
                {herb.scientificName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-700 shrink-0"
          >
            <FaTimes />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {herb.imageUrl && (
            <img
              src={herb.imageUrl}
              alt={herb.herbName}
              className="w-full max-h-48 object-cover rounded-2xl"
            />
          )}
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-600">Description</p>
            <p className="mt-1 text-sm text-slate-700">
              {herb.description || "N/A"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-600">Benefits</p>
            <p className="mt-1 text-sm text-slate-700">
              {herb.benefits || "N/A"}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">Dosage</p>
              <p className="mt-1 text-sm text-slate-700">
                {herb.dosage || "N/A"}
              </p>
            </div>
            <div className="rounded-2xl bg-rose-50/60 px-4 py-3">
              <p className="text-xs font-bold text-rose-700">Warnings</p>
              <p className="mt-1 text-sm text-rose-900/80">
                {herb.warnings || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HerbDetailsModal;
