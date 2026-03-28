import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaMapMarkerAlt, FaCity, FaHeartbeat, FaStreetView } from "react-icons/fa";
import { toast } from "react-hot-toast";
import ProfileLayout from "../ProfileLayout";

const API_BASE_URL =
  "https://herbal-api-v1-geg9dub2brgee4ag.austriaeast-01.azurewebsites.net";

function PatientProfile({ user }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    governorate: "",
    city: "",
    street: "",
    diabetes: false,
    hypertension: false,
    asthma: false,
    heartDisease: false,
    kidneyDisease: false,
    liverDisease: false,
    smoker: false,
    pregnancy: false,
    otherNotes: "",
  });

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Make sure we have a user ID to fetch user data
      const fetchDataPromises = [];
      
      if (user?.userId || user?.id) {
        const idToFetch = user.userId || user.id;
        fetchDataPromises.push(
          axios.get(`${API_BASE_URL}/api/Users/get/${idToFetch}`, { headers }).catch(e => ({ error: true, data: null }))
        );
      } else {
        fetchDataPromises.push(Promise.resolve({ error: true, data: null })); // Dummy for user
      }

      // Fetch medical history
      fetchDataPromises.push(
        axios.get(`${API_BASE_URL}/api/MedicalHistories/me`, { headers }).catch(e => ({ error: true, data: null }))
      );

      const [userResponse, medicalResponse] = await Promise.all(fetchDataPromises);

      setProfileData((prev) => {
        let newData = { ...prev };
        
        if (!userResponse.error && userResponse.data) {
          newData = {
            ...newData,
            governorate: userResponse.data.governorate || "",
            city: userResponse.data.city || "",
            street: userResponse.data.street || "",
          };
        }

        if (!medicalResponse.error && medicalResponse.data) {
          newData = {
            ...newData,
            diabetes: medicalResponse.data.diabetes || false,
            hypertension: medicalResponse.data.hypertension || false,
            asthma: medicalResponse.data.asthma || false,
            heartDisease: medicalResponse.data.heartDisease || false,
            kidneyDisease: medicalResponse.data.kidneyDisease || false,
            liverDisease: medicalResponse.data.liverDisease || false,
            smoker: medicalResponse.data.smoker || false,
            pregnancy: medicalResponse.data.pregnancy || false,
            otherNotes: medicalResponse.data.otherNotes || "",
          };
        }

        return newData;
      });
    } catch (err) {
      console.log("Error loading profile data:", err);
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
    setSaving(true);

    try {
      const token = localStorage.getItem("accessToken");
      
      const addressPayload = {
        governorate: profileData.governorate,
        city: profileData.city,
        street: profileData.street,
      };

      const medicalHistoryPayload = {
        diabetes: profileData.diabetes,
        hypertension: profileData.hypertension,
        asthma: profileData.asthma,
        heartDisease: profileData.heartDisease,
        kidneyDisease: profileData.kidneyDisease,
        liverDisease: profileData.liverDisease,
        smoker: profileData.smoker,
        pregnancy: profileData.pregnancy,
        otherNotes: profileData.otherNotes,
      };

      // Update address
      await axios.patch(
        `${API_BASE_URL}/api/Users/update-my-address`,
        addressPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Add/Update medical history
      await axios.post(
        `${API_BASE_URL}/api/MedicalHistories/me`,
        medicalHistoryPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Profile updated successfully!");
    } catch (err) {
      if (err.response) {
        const data = err.response.data || {};
        toast.error(
          data.message ||
            data.title ||
            "Failed to update profile. Please try again.",
        );
      } else {
        toast.error("Network error. Please ensure the backend server is running.");
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
      saving={saving}
      onSubmit={handleSubmit}
    >
      {/* Profile photo */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-5 flex flex-col md:flex-row items-center md:items-stretch gap-6">
        <div className="flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center text-emerald-500 text-3xl font-semibold shadow-sm">
            {profileData.photoUrl ? (
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "diabetes", label: "Diabetes" },
            { name: "hypertension", label: "Hypertension" },
            { name: "asthma", label: "Asthma" },
            { name: "heartDisease", label: "Heart Disease" },
            { name: "kidneyDisease", label: "Kidney Disease" },
            { name: "liverDisease", label: "Liver Disease" },
            { name: "smoker", label: "Smoker" },
            { name: "pregnancy", label: "Pregnancy" },
          ].map((condition) => (
            <label key={condition.name} className="inline-flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                name={condition.name}
                checked={profileData[condition.name]}
                onChange={handleChange}
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
              value={profileData.otherNotes}
              onChange={handleChange}
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
