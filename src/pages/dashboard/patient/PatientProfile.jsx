import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaMapMarkerAlt, FaCity, FaHeartbeat, FaStreetView } from "react-icons/fa";
import ProfileLayout from "../ProfileLayout";

const API_BASE_URL =
  "https://herbal-api-v1-geg9dub2brgee4ag.austriaeast-01.azurewebsites.net";

function PatientProfile({ user }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState({
    governorate: "",
    city: "",
    street: "",
    photoUrl: "",
    bio: "",
    wellnessInterests: "",
    hasDiabetes: false,
    hasHypertension: false,
    hasAsthma: false,
    hasHeartDisease: false,
    isSmoker: false,
    hasOtherCondition: false,
    otherCondition: "",
  });

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.put(
        `${API_BASE_URL}/api/Users/update-my-address`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data) {
        setProfileData((prev) => ({
          ...prev,
          governorate: response.data.governorate || "",
          city: response.data.city || "",
          street: response.data.street,
          photoUrl: response.data.photoUrl || response.data.photo || "",
          bio: response.data.bio || "",
          wellnessInterests:
            response.data.wellnessInterests || response.data.interests || "",
          hasDiabetes: response.data.hasDiabetes ?? prev.hasDiabetes,
          hasHypertension:
            response.data.hasHypertension ?? prev.hasHypertension,
          hasAsthma: response.data.hasAsthma ?? prev.hasAsthma,
          hasHeartDisease:
            response.data.hasHeartDisease ?? prev.hasHeartDisease,
          isSmoker: response.data.isSmoker ?? prev.isSmoker,
          hasOtherCondition:
            response.data.hasOtherCondition ?? prev.hasOtherCondition,
          otherCondition: response.data.otherCondition || prev.otherCondition,
        }));
      }
    } catch (err) {
      console.log("No existing profile data or error loading:", err);
      // It's okay if there's no existing data
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      await loadProfileData();
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData({
      ...profileData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        governorate: profileData.governorate,
        city: profileData.city,
        photoUrl: profileData.photoUrl,
        hasDiabetes: profileData.hasDiabetes,
        hasHypertension: profileData.hasHypertension,
        hasAsthma: profileData.hasAsthma,
        hasHeartDisease: profileData.hasHeartDisease,
        isSmoker: profileData.isSmoker,
        hasOtherCondition: profileData.hasOtherCondition,
        otherCondition: profileData.otherCondition,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/Patient/profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess("Profile updated successfully!");
      }
    } catch (err) {
      if (err.response) {
        const data = err.response.data || {};
        setError(
          data.message ||
            data.title ||
            "Failed to update profile. Please try again.",
        );
      } else {
        setError("Network error. Please ensure the backend server is running.");
      }
      console.error(err);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProfileLayout
      title="Patient Profile"
      subtitle="Manage your personal information and wellness preferences"
      error={error}
      success={success}
      saving={saving}
      onSubmit={handleSubmit}
    >
      {/* Profile photo */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-5 flex flex-col md:flex-row items-center md:items-stretch gap-6">
        <div className="flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center text-emerald-500 text-3xl font-semibold shadow-sm">
            {profileData.photoUrl ? (
              // eslint-disable-next-line jsx-a11y/img-redundant-alt
              <img
                src={profileData.photoUrl}
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
                  setProfileData((prev) => ({ ...prev, photoUrl: url }));
                }}
              />
            </label>
            {profileData.photoUrl && (
              <button
                type="button"
                onClick={() =>
                  setProfileData((prev) => ({ ...prev, photoUrl: "" }))
                }
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
                value={profileData.governorate}
                onChange={handleChange}
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
                value={profileData.city}
                onChange={handleChange}
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
                value={profileData.street}
                onChange={handleChange}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              name="hasDiabetes"
              checked={profileData.hasDiabetes}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-800">Diabetes</span>
          </label>
          <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              name="hasHypertension"
              checked={profileData.hasHypertension}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-800">
              Hypertension
            </span>
          </label>
          <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              name="hasAsthma"
              checked={profileData.hasAsthma}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-800">Asthma</span>
          </label>
          <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              name="hasHeartDisease"
              checked={profileData.hasHeartDisease}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-800">
              Heart Disease
            </span>
          </label>
          <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              name="isSmoker"
              checked={profileData.isSmoker}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-800">Smoker</span>
          </label>
          <div className="space-y-3">
            <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 w-full">
              <input
                type="checkbox"
                name="hasOtherCondition"
                checked={profileData.hasOtherCondition}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-slate-800">
                Other condition
              </span>
            </label>
            {profileData.hasOtherCondition && (
              <input
                type="text"
                name="otherCondition"
                value={profileData.otherCondition}
                onChange={handleChange}
                placeholder="Describe other condition"
                className="block w-full rounded-xl border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
              />
            )}
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

export default PatientProfile;
