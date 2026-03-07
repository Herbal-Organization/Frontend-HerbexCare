import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://unmonotonous-unregainable-ronnie.ngrok-free.dev";

function Login({ setSuccessMsg }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };
      const response = await axios.post(
        `${API_BASE_URL}/api/Accounts/login`,
        payload,
        
      );

      if (response.status === 200 && response.data) {
        console.log(response.data);
        const { accessToken, refreshToken } = response.data;

        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

        setSuccessMsg("Login successful!");

        setTimeout(() => {
          // Redirect or update app state here
          // window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (err) {
      if (err.response) {
        const data = err.response.data || {};
        setError(
          data.message ||
            data.title ||
            "Login failed. Please check your credentials.",
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
              className="block w-full rounded-xl border-slate-200 py-3 pl-11 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-700">
              Password
            </label>
            <a
              href="#"
              className="text-xs font-bold text-primary hover:text-primary-hover"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">
                lock
              </span>
            </div>
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="block w-full rounded-xl border-slate-200 py-3 pl-11 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium font-sans"
            />
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
              "Sign In"
            )}
            {!loading && (
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-slate-400 font-medium">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-5 w-5"
            />
            <span className="sr-only sm:not-sr-only">Google</span>
          </button>
          <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <img
              src="https://www.svgrepo.com/show/475647/facebook-color.svg"
              alt="Facebook"
              className="h-5 w-5"
            />
            <span className="sr-only sm:not-sr-only">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
