import { useEffect, useMemo, useState } from "react";
import {
  FaUser,
  FaIdCard,
  FaStar,
  FaClock,
  FaLock,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ProfileLayout from "../../../components/shared/ProfileLayout";
import { saveHerbalistProfile } from "../../../services/herbalistProfile";
import {
  deleteHerbalistAccount,
  resetHerbalistAccount,
} from "../../../services/accountSettings";

import { AnimatePresence, motion } from "motion/react";

const DEFAULT_PROFILE = {
  userId: "",
  licenseNumber: "",
  averageRating: "",
  bio: "",
  availableFrom: "",
  availableTo: "",
};

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function HerbalistProfile({
  user,
  dashboardData,
  isLoading,
  onProfileUpdated,
}) {
  const navigate = useNavigate();
  const initialProfile = useMemo(
    () => ({
      ...DEFAULT_PROFILE,
      ...(dashboardData?.herbalistProfile || {}),
    }),
    [dashboardData?.herbalistProfile],
  );

  const [profile, setProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resetError, setResetError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");
  const [resetForm, setResetForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const herbalistUserId = useMemo(
    () => user?.userId || user?.id || null,
    [user?.id, user?.userId],
  );

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleResetFormChange = (event) => {
    const { name, value } = event.target;
    setResetForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetError("");

    if (!user?.email) {
      setResetError("Unable to resolve account email.");
      return;
    }

    if (!resetForm.oldPassword) {
      setResetError("Current password is required.");
      return;
    }

    if (!resetForm.newPassword || resetForm.newPassword.length < 8) {
      setResetError("New password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(resetForm.newPassword)) {
      setResetError("New password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(resetForm.newPassword)) {
      setResetError("New password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(resetForm.newPassword)) {
      setResetError("New password must contain at least one number.");
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmNewPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setIsResetting(true);
    try {
      await resetHerbalistAccount(
        user.email,
        resetForm.oldPassword,
        resetForm.newPassword,
      );
      toast.success("Password updated successfully!");
      setShowResetModal(false);
      setResetForm({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to reset password.";
      setResetError(message);
      toast.error(message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (!herbalistUserId) {
      setDeleteError("Unable to resolve account id.");
      return;
    }

    if (!user?.email || deleteEmailConfirm !== user.email) {
      setDeleteError("Please type your exact email to confirm deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteHerbalistAccount(herbalistUserId);
      toast.success("Account deleted successfully.");
      navigate("/auth", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to delete account.";
      setDeleteError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");

    try {
      await saveHerbalistProfile(profile);
      await onProfileUpdated?.();
      toast.success("Profile updated successfully!");
    } catch (err) {
      const data = err.response?.data;
      console.error("Herbalist profile update error:", data || err);

      let message =
        data?.message || data?.title || "Failed to update herbalist profile.";

      if (data?.errors && typeof data.errors === "object") {
        // flatten errors object into readable messages
        const details = Object.values(data.errors)
          .flat()
          .filter(Boolean)
          .map((m) => String(m));

        if (details.length > 0) {
          message = details.join("; ");
        }
      }

      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProfileLayout
      title="Herbalist Profile"
      subtitle="Manage your professional information and availability"
      saving={isSaving}
      onSubmit={handleSubmit}
    >
      {saveError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {saveError}
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Personal Information (Read-only) */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
              <FaUser className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Personal Information
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Your primary account details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="group md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Full Name
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-300 transition-all">
                {user?.fullName || user?.name || "N/A"}
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Email Address
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-300 transition-all">
                {user?.email || "N/A"}
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Username
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-300 transition-all">
                {user?.userName || user?.username || "N/A"}
              </div>
            </div>
            <div className="group md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Phone Number
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-300 transition-all">
                {user?.phone || "N/A"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Herbalist Record */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl">
              <FaIdCard className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Herbalist Record
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Professional identification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                License Number
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-300 transition-all">
                {profile.licenseNumber || "N/A"}
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Average Rating
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-300 transition-all">
                {profile.averageRating != null && profile.averageRating !== ""
                  ? String(profile.averageRating)
                  : "Not rated yet"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl">
              <FaStar className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Professional Bio
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Introduce your practice
              </p>
            </div>
          </div>

          <div className="group mt-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
              About You
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Introduce your herbal practice, experience, and approach."
              className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300 resize-none group-hover:shadow-sm"
              rows="5"
            />
          </div>
        </motion.div>

        {/* Availability */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-purple-50 text-purple-500 rounded-xl">
              <FaClock className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Availability Schedule
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Manage your daily consultation times
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
                Available From
              </label>
              <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
                  <FaClock />
                </div>
                <input
                  type="time"
                  name="availableFrom"
                  value={profile.availableFrom || ""}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
                Available To
              </label>
              <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
                  <FaClock />
                </div>
                <input
                  type="time"
                  name="availableTo"
                  value={profile.availableTo || ""}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
              <FaLock className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Reset Password
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Update your account password securely
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setResetError("");
              setShowResetModal(true);
            }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90"
          >
            Reset Password
          </button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-red-200 bg-red-50 p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
              <FaTrash className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-900">Delete Account</h2>
              <p className="text-xs text-red-700 font-medium">
                Permanently remove this herbalist account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteError("");
              setDeleteEmailConfirm("");
              setShowDeleteModal(true);
            }}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700"
          >
            Delete Account
          </button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => !isResetting && setShowResetModal(false)}
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
                  Reset Password
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Enter your current password and a new one.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                {resetError ? (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {resetError}
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
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
                    name="oldPassword"
                    value={resetForm.oldPassword}
                    onChange={handleResetFormChange}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={resetForm.newPassword}
                    onChange={handleResetFormChange}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={resetForm.confirmNewPassword}
                    onChange={handleResetFormChange}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    disabled={isResetting}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-70"
                  >
                    {isResetting ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-red-200 bg-red-50 px-6 py-4">
                <h3 className="text-lg font-bold text-red-900">
                  Delete Account
                </h3>
                <p className="text-sm text-red-800 mt-1">
                  This action cannot be undone.
                </p>
              </div>

              <div className="p-6 space-y-4">
                {deleteError ? (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {deleteError}
                  </div>
                ) : null}

                <p className="text-sm text-slate-700">
                  Deleting your account removes your herbalist profile and
                  related data permanently.
                </p>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Type your email to confirm:{" "}
                    <span className="text-red-600">{user?.email}</span>
                  </label>
                  <input
                    type="text"
                    value={deleteEmailConfirm}
                    onChange={(event) =>
                      setDeleteEmailConfirm(event.target.value)
                    }
                    placeholder={`Enter ${user?.email}`}
                    className="block w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-slate-900 text-sm font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteEmailConfirm !== user?.email}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProfileLayout>
  );
}

export default HerbalistProfile;
