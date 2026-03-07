import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://unmonotonous-unregainable-ronnie.ngrok-free.dev";

function Register({ setIsLogin, setSuccessMsg }) {
  const [role, setRole] = useState("Patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const validateField = (name, value, currentFormData) => {
    let error = "";
    if (name === "password" && value.length > 0 && value.length < 8) {
      error = "Password must be at least 8 characters";
    } else if (
      name === "confirmPassword" &&
      value.length > 0 &&
      value !== currentFormData.password
    ) {
      error = "Passwords do not match";
    } else if (name === "userName" && value.trim() === "") {
      error = "Username is required";
    } else if (name === "phone" && value.trim() === "") {
      error = "Phone number is required";
    } else if (name === "email" && value.trim() === "") {
      error = "Email is required";
    }

    setFormErrors((prev) => {
      const newErrors = { ...prev, [name]: error };
      if (name === "password" && currentFormData.confirmPassword) {
        newErrors.confirmPassword =
          value !== currentFormData.confirmPassword
            ? "Passwords do not match"
            : "";
      }
      return newErrors;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    validateField(name, value, newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (Object.values(formErrors).some((err) => err)) {
      setError("Please fix the validation errors before submitting.");
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const payload = {
      fullName: formData.fullName,
      userName: formData.userName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: role,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/Accounts/register`,
        payload,
      );

      if (response.status === 200 || response.status === 201) {
        console.log(response.data);

        setSuccessMsg("Registration successful! Please log in.");
        setFormData({
          fullName: "",
          userName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMsg(null);
        }, 2000);
      }
    } catch (err) {
      if (err.response) {
        const data = err.response.data || {};
        setError(
          data.message ||
            data.title ||
            "Registration failed. Please check your details.",
        );
      } else {
        setError("Network error. Please ensure the backend server is running.");
      }
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700">
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Full Name
            </label>
            <input
              required
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Fullname"
              className="block w-full rounded-xl border-slate-200 py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Username
            </label>
            <input
              required
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Username"
              className={`block w-full rounded-xl border py-3 px-4 outline-none focus:ring-1 text-slate-900 text-sm font-medium ${formErrors.userName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-primary focus:ring-primary"}`}
            />
            {formErrors.userName && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {formErrors.userName}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Email Address
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">
                mail
              </span>
            </div>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className={`block w-full rounded-xl border py-3 pl-11 outline-none focus:ring-1 text-slate-900 text-sm font-medium ${formErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-primary focus:ring-primary"}`}
            />
          </div>
          {formErrors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {formErrors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Phone Number
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">
                call
              </span>
            </div>
            <input
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01203564652"
              className={`block w-full rounded-xl border py-3 pl-11 outline-none focus:ring-1 text-slate-900 text-sm font-medium ${formErrors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-primary focus:ring-primary"}`}
            />
          </div>
          {formErrors.phone && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {formErrors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            I am registering as a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-colors ${role === "Patient" ? "border-primary bg-primary-light/30" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <input
                type="radio"
                name="role"
                value="Patient"
                className="sr-only"
                checked={role === "Patient"}
                onChange={() => setRole("Patient")}
              />
              <span
                className={`material-symbols-outlined ${role === "Patient" ? "text-primary" : "text-slate-400"}`}
              >
                person
              </span>
              <span
                className={`text-sm font-bold ${role === "Patient" ? "text-primary" : "text-slate-600"}`}
              >
                Patient
              </span>
            </label>
            <label
              className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-colors ${role === "Herbalist" ? "border-primary bg-primary-light/30" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <input
                type="radio"
                name="role"
                value="Herbalist"
                className="sr-only"
                checked={role === "Herbalist"}
                onChange={() => setRole("Herbalist")}
              />
              <span
                className={`material-symbols-outlined ${role === "Herbalist" ? "text-primary" : "text-slate-400"}`}
              >
                local_library
              </span>
              <span
                className={`text-sm font-bold ${role === "Herbalist" ? "text-primary" : "text-slate-600"}`}
              >
                Herbalist
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Password
            </label>
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`block w-full rounded-xl border py-3 px-4 outline-none focus:ring-1 text-slate-900 text-sm font-medium font-sans ${formErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-primary focus:ring-primary"}`}
            />
            {formErrors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {formErrors.password}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Confirm Password
            </label>
            <input
              required
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`block w-full rounded-xl border py-3 px-4 outline-none focus:ring-1 text-slate-900 text-sm font-medium font-sans ${formErrors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-primary focus:ring-primary"}`}
            />
            {formErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            disabled={loading}
            type="submit"
            className="flex w-full justify-center items-center gap-2 rounded-xl bg-primary px-3 py-3.5 text-sm font-bold text-white shadow-sm hover:-translate-y-0.5 shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">
                refresh
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
