import { useEffect, useMemo, useState } from "react";
import {
  FaUser,
  FaIdCard,
  FaStar,
  FaClock,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import ProfileLayout from "../ProfileLayout";
import { saveHerbalistProfile } from "../../../services/herbalistProfile";

const DEFAULT_PROFILE = {
  userId: "",
  licenseNumber: "",
  averageRating: "",
  bio: "",
  availableFrom: "",
  availableTo: "",
};

function InfoField({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <div className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
        {value || "N/A"}
      </div>
    </div>
  );
}

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
      toast.success("Herbalist profile updated successfully!");
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
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProfileLayout
      title="Herbalist Profile"
      subtitle="View your registered account details and manage your professional availability."
      saving={isSaving}
      onSubmit={handleSubmit}
    >
      {saveError ? (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {saveError}
        </div>
      ) : null}

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaUser className="text-primary" />
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Full Name" value={user?.fullName || user?.name} />
          <InfoField label="Email Address" value={user?.email} />
          <InfoField label="Username" value={user?.userName || user?.username} />
          <InfoField label="Phone Number" value={user?.phone} />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaIdCard className="text-primary" />
          Herbalist Record
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="License Number" value={profile.licenseNumber} />
          <InfoField
            label="Average Rating"
            value={profile.averageRating != null && profile.averageRating !== ""
              ? String(profile.averageRating)
              : "Not rated yet"}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaStar className="text-primary" />
          Professional Bio
        </h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Introduce your herbal practice, experience, and approach."
            className="block w-full rounded-xl border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium min-h-30"
          />
        </div>
      </div>

      <div className="mb-2">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaClock className="text-primary" />
          Availability
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Available From
            </label>
            <input
              type="time"
              name="availableFrom"
              value={profile.availableFrom}
              onChange={handleChange}
              className="block w-full rounded-xl border-slate-200 py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Available To
            </label>
            <input
              type="time"
              name="availableTo"
              value={profile.availableTo}
              onChange={handleChange}
              className="block w-full rounded-xl border-slate-200 py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
            />
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

export default HerbalistProfile;
