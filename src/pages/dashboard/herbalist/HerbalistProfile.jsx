import { useEffect, useMemo, useState } from "react";
import { FaUser, FaIdCard, FaStar, FaClock } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import ProfileLayout from "../../../components/shared/ProfileLayout";
import { saveHerbalistProfile } from "../../../services/herbalistProfile";

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
    transition: { type: "spring", stiffness: 300, damping: 24 }
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");

    try {
      await saveHerbalistProfile(profile);
      await onProfileUpdated?.();
      toast.success("Profile updated successfully!");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to update herbalist profile.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
          animate={{ opacity: 1, height: 'auto' }} 
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
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
              <FaUser className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500 font-medium">Your primary account details</p>
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
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl">
              <FaIdCard className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Herbalist Record</h2>
              <p className="text-xs text-slate-500 font-medium">Professional identification</p>
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
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl">
              <FaStar className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Professional Bio</h2>
              <p className="text-xs text-slate-500 font-medium">Introduce your practice</p>
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
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-purple-50 text-purple-500 rounded-xl">
              <FaClock className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Availability Schedule</h2>
              <p className="text-xs text-slate-500 font-medium">Manage your daily consultation times</p>
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
      </motion.div>
    </ProfileLayout>
  );
}

export default HerbalistProfile;
