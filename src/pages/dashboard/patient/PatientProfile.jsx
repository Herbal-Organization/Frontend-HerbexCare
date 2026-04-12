import { useEffect, useMemo } from "react";
import { FaUser, FaMapMarkerAlt, FaCity, FaHeartbeat, FaStreetView, FaVenusMars, FaBirthdayCake, FaCamera } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import ProfileLayout from "../../../components/shared/ProfileLayout";
import PatientDashboardState from "../../../components/patient/PatientDashboardState";
import usePatientProfileForm from "../../../hooks/usePatientProfileForm";
import {
  DEFAULT_ADDRESS,
  DEFAULT_MEDICAL_HISTORY,
  DEFAULT_PATIENT_INFO,
  MEDICAL_CONDITIONS,
} from "../../../services/patientProfile";

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

function PatientProfile({ user, dashboardData, isLoading, onProfileUpdated }) {
  const initialProfile = useMemo(() => {
    const rawProfile = dashboardData?.profile ?? {
      ...DEFAULT_PATIENT_INFO,
      ...DEFAULT_ADDRESS,
      ...DEFAULT_MEDICAL_HISTORY,
    };

    let formattedBirthDate = rawProfile.birthDate || "";
    if (formattedBirthDate) {
      try {
        const d = new Date(formattedBirthDate);
        if (!isNaN(d.getTime())) {
          formattedBirthDate = d.toISOString().split("T")[0];
        }
      } catch (e) {
        console.error("Invalid birthDate format", e);
      }
    }

    return {
      ...rawProfile,
      birthDate: formattedBirthDate,
    };
  }, [dashboardData?.profile]);

  const {
    profile,
    isSaving,
    saveError,
    setProfile,
    updateField,
    save,
  } = usePatientProfileForm(initialProfile, {
    onSaved: onProfileUpdated,
  });

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile, setProfile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const didSave = await save();

    if (didSave) {
      toast.success("Profile updated successfully!");
      return;
    }

    toast.error(saveError || "Failed to update profile. Please try again.");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData?.profile) {
    return (
      <div className="p-6">
        <PatientDashboardState
          title="Profile data is unavailable"
          description="We couldn't load your address and medical history yet."
        />
      </div>
    );
  }

  return (
    <ProfileLayout
      title="Patient Profile"
      subtitle="Manage your personal information and wellness preferences"
      saving={isSaving}
      onSubmit={handleSubmit}
    >
      {saveError ? (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
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
        {/* Profile photo */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 flex flex-col md:flex-row items-center md:items-center gap-6 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 overflow-hidden flex items-center justify-center text-emerald-500 text-4xl font-bold shadow-inner ring-4 ring-white">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt="Profile photo"
                  className="h-full w-full object-cover"
                />
              ) : (
                (user?.fullName || user?.name || "P").charAt(0).toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-primary cursor-pointer hover:scale-110 hover:bg-emerald-50 transition-transform">
              <FaCamera className="text-sm" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  setProfile((prev) => ({ ...prev, photoUrl: url }));
                }}
              />
            </label>
          </div>
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Profile Picture
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Upload a professional photo to help your doctors identify you easily. JPG or PNG.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <label className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-sm font-semibold transition-colors cursor-pointer">
                Upload New Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setProfile((prev) => ({ ...prev, photoUrl: url }));
                  }}
                />
              </label>
              {profile.photoUrl && (
                <button
                  type="button"
                  onClick={() => setProfile((prev) => ({ ...prev, photoUrl: "" }))}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Login Information (Read-only) */}
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
            <div className="group">
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
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                Phone Number
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-300 transition-all">
                {user?.phone || "N/A"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Patient Information */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-purple-50 text-purple-500 rounded-xl">
              <FaVenusMars className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Patient Details</h2>
              <p className="text-xs text-slate-500 font-medium">Demographic information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
                Birth Date
              </label>
              <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
                  <FaBirthdayCake />
                </div>
                <input
                  type="date"
                  name="birthDate"
                  value={profile.birthDate}
                  onChange={updateField}
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
                Gender
              </label>
              <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
                  <FaVenusMars />
                </div>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={updateField}
                  className="block w-full appearance-none rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300 cursor-pointer"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Address Information */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl">
              <FaMapMarkerAlt className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Address Information</h2>
              <p className="text-xs text-slate-500 font-medium">To help us locate you for appointments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="group md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
                Governorate
              </label>
              <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
                  <FaMapMarkerAlt />
                </div>
                <input
                  type="text"
                  name="governorate"
                  value={profile.governorate}
                  onChange={updateField}
                  placeholder="e.g. Cairo"
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
                City
              </label>
              <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
                  <FaCity />
                </div>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={updateField}
                  placeholder="e.g. Nasr City"
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
                Street Address
              </label>
              <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
                  <FaStreetView />
                </div>
                <input
                  type="text"
                  name="street"
                  value={profile.street}
                  onChange={updateField}
                  placeholder="Enter street and building"
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"  
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Medical history */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
              <FaHeartbeat className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Medical History</h2>
              <p className="text-xs text-slate-500 font-medium">Select any pre-existing conditions</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEDICAL_CONDITIONS.map((condition) => {
              const isChecked = profile[condition.name];
              return (
                <label 
                  key={condition.name} 
                  className={`relative flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 font-medium ${
                    isChecked 
                      ? 'border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20' 
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name={condition.name}
                      checked={isChecked}
                      onChange={updateField}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-0 bg-transparent transition-colors"
                    />
                  </div>
                  <span className="text-sm flex-1">{condition.label}</span>
                </label>
              );
            })}
            
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-4 group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
                Other Notes
              </label>
              <textarea
                name="otherNotes"
                value={profile.otherNotes}
                onChange={updateField}
                placeholder="Describe any other medical conditions, allergies, or relevant notes..."
                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300 resize-none group-hover:shadow-sm"
                rows="4"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ProfileLayout>
  );
}

export default PatientProfile;
