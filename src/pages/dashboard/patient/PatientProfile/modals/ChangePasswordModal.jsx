import { motion, AnimatePresence } from "motion/react";

function ChangePasswordModal({
  isOpen,
  onClose,
  isLoading,
  error,
  onSubmit,
  newPassword,
  register,
  handleSubmit,
  errors,
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
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                Change Password
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Enter your current password and new password
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  readOnly
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("oldPassword", {
                    required: "Current password is required",
                  })}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm font-medium transition-all"
                />
                {errors.oldPassword && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.oldPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    validate: (value) => {
                      if (!value) return true;
                      if (!/[A-Z]/.test(value))
                        return "Must contain at least one uppercase letter";
                      if (!/[a-z]/.test(value))
                        return "Must contain at least one lowercase letter";
                      if (!/[0-9]/.test(value))
                        return "Must contain at least one number";
                      return true;
                    },
                  })}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm font-medium transition-all"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmNewPassword", {
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm font-medium transition-all"
                />
                {errors.confirmNewPassword && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.confirmNewPassword.message}
                  </p>
                )}
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
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm hover:-translate-y-0.5 shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading && (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ChangePasswordModal;
