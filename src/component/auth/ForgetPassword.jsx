import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoIosMail } from "react-icons/io";
import { FaArrowRight, FaLock } from "react-icons/fa";

const API_BASE_URL = "https://unmonotonous-unregainable-ronnie.ngrok-free.dev";

function ForgetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        newPassword: formData.newPassword,
      };
      const response = await axios.post(
        `${API_BASE_URL}/api/Accounts/reset-password`, // Assuming this endpoint
        payload,
      );

      if (response.status === 200) {
        setSuccess("Password reset successful! You can now log in with your new password.");
        setFormData({ email: "", newPassword: "" });
      }
    } catch (err) {
      if (err.response) {
        const data = err.response.data || {};
        setError(
          data.message ||
            data.title ||
            "Password reset failed. Please try again.",
        );
      } else {
        setError("Network error. Please ensure the backend server is running.");
      }
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex flex-col justify-center items-center w-5/12 bg-primary-light/50 relative overflow-hidden p-12">
        <img
          src="/auth_leaf_bg.png"
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply"
          alt="Leaf Background"
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <Link to="/">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-primary mb-6 shadow-sm hover:scale-110 transition-transform">
              <span className="text-3xl">🌿</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
            Herbal Care
          </h1>
          <p className="text-slate-700 text-base max-w-sm leading-relaxed mb-12 font-medium">
            Reset your password to continue your natural wellness journey.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.05)] relative z-20 w-full lg:w-7/12 overflow-y-auto">
        <div className="mx-auto w-full max-w-md lg:w-[md]">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your email and new password to reset your account
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700">
                <span className="material-symbols-outlined text-red-500">error</span>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3 text-primary">
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <IoIosMail className="text-slate-400 text-[20px]" />
                  </div>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="block w-full rounded-xl border-slate-200 py-3 pl-11 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FaLock className="text-slate-400 text-[20px]" />
                  </div>
                  <input
                    required
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border-slate-200 py-3 pl-11 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  disabled={loading}
                  type="submit"
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-primary px-3 py-3.5 text-sm font-bold text-white shadow-sm hover:-translate-y-0.5 shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">
                      refresh
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                  {!loading && (
                    <span className="material-symbols-outlined text-[18px]">
                      <FaArrowRight />
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/auth"
                className="text-sm font-bold text-primary hover:text-primary-hover"
              >
                Back to Sign In
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center text-xs text-slate-400 font-medium pb-8 lg:pb-0">
            <p>
              &copy; {new Date().getFullYear()} Karim Safan. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
