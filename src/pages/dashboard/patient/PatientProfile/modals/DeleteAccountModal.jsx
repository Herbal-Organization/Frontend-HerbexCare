import { motion, AnimatePresence } from "motion/react";

function DeleteAccountModal({
  isOpen,
  onClose,
  isLoading,
  error,
  onSubmit,
  deleteEmailConfirm,
  onEmailChange,
  user,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => !isLoading && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-red-200 bg-red-50 px-6 py-4">
              <h3 className="text-lg font-bold text-red-900">Delete Account</h3>
              <p className="text-sm text-red-800 mt-1">
                This action cannot be undone
              </p>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <p className="text-sm text-slate-700">
                ⚠️ Deleting your account will permanently remove all your data,
                including medical history, orders, and preferences. This action
                cannot be undone.
              </p>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Type your email to confirm:{" "}
                  <span className="text-red-600">{user?.email}</span>
                </label>
                <input
                  type="text"
                  placeholder={`Enter ${user?.email} to confirm`}
                  value={deleteEmailConfirm}
                  onChange={onEmailChange}
                  disabled={isLoading}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-slate-900 text-sm font-medium transition-all disabled:opacity-50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isLoading || deleteEmailConfirm !== user?.email}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:-translate-y-0.5 shadow-red-600/30 hover:shadow-red-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 hover:bg-red-700"
                >
                  {isLoading && (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isLoading ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DeleteAccountModal;
