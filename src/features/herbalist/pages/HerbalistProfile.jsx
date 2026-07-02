import { useEffect, useMemo, useState } from "react";
import { FaUser, FaIdCard, FaStar, FaClock } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import ProfileLayout from "@components/common/ProfileLayout";
import {
  loadHerbalistProfile,
  normalizeHerbalistProfile,
  saveHerbalistProfile,
} from "@features/herbalist/services/herbalistProfile";

const DEFAULT_PROFILE = {
  herbalistId: "",
  userId: "",
  licenseNumber: "",
  averageRating: "",
  bio: "",
  availableFrom: "",
  availableTo: "",
};

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
  const initialProfile = useMemo(
    () => ({
      ...DEFAULT_PROFILE,
      ...(dashboardData?.herbalistProfile || {}),
    }),
    [dashboardData?.herbalistProfile],
  );

  const [profile, setProfile] = useState(initialProfile);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setIsProfileLoading(true);
      setProfileLoadError("");

      try {
        const data = await loadHerbalistProfile();
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.title ||
          "Failed to load herbalist profile.";
        setProfileLoadError(message);
        if (dashboardData?.herbalistProfile) {
          setProfile(
            normalizeHerbalistProfile(dashboardData.herbalistProfile),
          );
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [dashboardData?.herbalistProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");

    try {
      const updated = await saveHerbalistProfile(profile);
      setProfile(updated);
      await onProfileUpdated?.();
      toast.success("Profile updated successfully!");
    } catch (err) {
      const data = err.response?.data;
      console.error("Herbalist profile update error:", data || err);

      let message =
        data?.message || data?.title || "Failed to update herbalist profile.";

      if (data?.errors && typeof data.errors === "object") {
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

  if (isLoading || isProfileLoading) {
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
      {profileLoadError ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 rounded-2xl border border-amber-100 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-300"
        >
          {profileLoadError}
        </motion.div>
      ) : null}

      {saveError ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-400"
        >
          {saveError}
        </motion.div>
      ) : null}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-xl">
              <FaUser className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Personal Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Your primary account details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="group md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Full Name
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all">
                {user?.fullName || user?.name || "N/A"}
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Email Address
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all">
                {user?.email || "N/A"}
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Username
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all">
                {user?.userName || user?.username || "N/A"}
              </div>
            </div>
            <div className="group md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Phone Number
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all">
                {user?.phone || "N/A"}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 rounded-xl">
              <FaIdCard className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Herbalist Record
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Professional identification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Herbalist ID
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium">
                {profile.herbalistId || profile.id || "N/A"}
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                User ID
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium">
                {profile.userId || user?.userId || user?.id || "N/A"}
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                License Number
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all">
                {profile.licenseNumber || "N/A"}
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Average Rating
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all">
                {profile.averageRating != null && profile.averageRating !== ""
                  ? String(profile.averageRating)
                  : "Not rated yet"}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-xl">
              <FaStar className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Professional Bio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
              className="block w-full rounded-xl border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/50 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-slate-100 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300 resize-none group-hover:shadow-sm"
              rows="5"
            />
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 rounded-xl">
              <FaClock className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Availability Schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Manage your daily consultation times
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
                Available From
              </label>
              <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400 group-focus-within:text-primary transition-colors">
                  <FaClock />
                </div>
                <input
                  type="time"
                  name="availableFrom"
                  value={profile.availableFrom || ""}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/50 py-3 ps-11 pe-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-slate-100 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
                Available To
              </label>
              <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400 group-focus-within:text-primary transition-colors">
                  <FaClock />
                </div>
                <input
                  type="time"
                  name="availableTo"
                  value={profile.availableTo || ""}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/50 py-3 ps-11 pe-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-slate-100 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ProfileLayout>
  );
}

export default HerbalistProfile;
