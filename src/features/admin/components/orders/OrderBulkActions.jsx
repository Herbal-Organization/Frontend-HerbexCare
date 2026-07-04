import { FaCheck, FaTimes, FaTrash, FaDownload } from "react-icons/fa";

function OrderBulkActions({
  selectedCount,
  onApprove,
  onReject,
  onDelete,
  onExportSelected,
  onClearSelection,
  isProcessing,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
      <span className="text-sm font-bold text-emerald-700">
        {selectedCount} order{selectedCount !== 1 ? "s" : ""} selected
      </span>

      <div className="ms-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExportSelected}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
        >
          <FaDownload className="text-[10px]" />
          Export
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaCheck className="text-[10px]" />
          Approve
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:border-rose-400 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaTimes className="text-[10px]" />
          Reject
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:border-rose-400 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaTrash className="text-[10px]" />
          Delete
        </button>
        <button
          type="button"
          onClick={onClearSelection}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:text-slate-700"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default OrderBulkActions;
