import { FiTrash2, FiX } from "react-icons/fi";

function AdminDeleteUserModal({
  isOpen,
  user,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close delete confirmation"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-rose-100 bg-rose-50 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-600">
              Confirm Deletion
            </p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">
              Delete user?
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-white text-slate-600 transition-colors hover:bg-rose-50"
            aria-label="Close delete confirmation"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <FiTrash2 />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {user?.fullName || "Selected user"}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email || user?.userName || "No contact details"}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-600">
            Are you sure you want to delete this user account? All related data
            linked to this user will remain subject to backend rules, but the
            account itself will be removed.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <FiTrash2 />
              )}
              {isDeleting ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDeleteUserModal;
