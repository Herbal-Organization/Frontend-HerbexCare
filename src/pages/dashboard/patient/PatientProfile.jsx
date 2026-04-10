import { useEffect, useMemo } from "react";
import { FaUser, FaMapMarkerAlt, FaCity, FaHeartbeat, FaStreetView, FaVenusMars, FaBirthdayCake } from "react-icons/fa";
import { toast } from "react-hot-toast";
import ProfileLayout from "../ProfileLayout";
import PatientDashboardState from "../../../components/patient/PatientDashboardState";
import usePatientProfileForm from "../../../hooks/usePatientProfileForm";
import {
  DEFAULT_ADDRESS,
  DEFAULT_MEDICAL_HISTORY,
  DEFAULT_PATIENT_INFO,
  MEDICAL_CONDITIONS,
} from "../../../services/patientProfile";

function PatientProfile({ user, dashboardData, isLoading, onProfileUpdated }) {
  const initialProfile = useMemo(
    () =>
      dashboardData?.profile ?? {
        ...DEFAULT_PATIENT_INFO,
        ...DEFAULT_ADDRESS,
        ...DEFAULT_MEDICAL_HISTORY,
      },
    [dashboardData?.profile],
  );

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
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {saveError}
        </div>
      ) : null}

      {/* Profile photo */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-5 flex flex-col md:flex-row items-center md:items-stretch gap-6">
        <div className="flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center text-emerald-500 text-3xl font-semibold shadow-sm">
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
        </div>
        <div className="flex-1 md:flex md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Profile Photo
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              JPG or PNG. Maximum size of 2MB.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
              Upload New
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
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Information (Read-only) */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaUser className="text-primary" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900">
              {user?.fullName || user?.name || "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900">
              {user?.email || "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900">
              {user?.userName || user?.username || "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900">
              {user?.phone || "N/A"}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaVenusMars className="text-primary" />
          Patient Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Birth Date
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <FaBirthdayCake className="text-slate-400 text-lg" />
              </div>
              <input
                type="date"
                name="birthDate"
                value={profile.birthDate}
                onChange={updateField}
                className="block w-full rounded-xl border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gender
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <FaVenusMars className="text-slate-400 text-lg" />
              </div>
              <select
                name="gender"
                value={profile.gender}
                onChange={updateField}
                className="block w-full appearance-none rounded-xl border-slate-200 bg-white py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information (Editable) */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaMapMarkerAlt className="text-primary" />
          Additional Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Governorate
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <FaMapMarkerAlt className="text-slate-400 text-lg" />
              </div>
              <input
                type="text"
                name="governorate"
                value={profile.governorate}
                onChange={updateField}
                placeholder="Enter your address"
                className="block w-full rounded-xl border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              City
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <FaCity className="text-slate-400 text-lg" />
              </div>
              <input
                type="text"
                name="city"
                value={profile.city}
                onChange={updateField}
                placeholder="Enter your city"
                className="block w-full rounded-xl border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Street
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <FaStreetView  className="text-slate-400 text-lg" />
              </div>
              <input
                type="text"
                name="street"
                value={profile.street}
                onChange={updateField}
                placeholder="Enter your street"
                className="block w-full rounded-xl border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"  
              />
            </div>
          </div>
        </div>
      </div>

      {/* Medical history */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaHeartbeat className="text-primary" />
          Medical History
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEDICAL_CONDITIONS.map((condition) => (
            <label key={condition.name} className="inline-flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                name={condition.name}
                checked={profile[condition.name]}
                onChange={updateField}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-slate-800">{condition.label}</span>
            </label>
          ))}
          
          <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Other Notes
            </label>
            <textarea
              name="otherNotes"
              value={profile.otherNotes}
              onChange={updateField}
              placeholder="Describe any other medical conditions or notes"
              className="block w-full rounded-xl border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
              rows="3"
            />
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

export default PatientProfile;
