import { useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaUserTag,
} from "react-icons/fa";
import AuthInput from "@features/auth/components/AuthInput";
import { ADMIN_USER_ROLES } from "@features/admin/services/adminUsers";

const USER_CREATION_ROLES = ADMIN_USER_ROLES.filter(
  (role) => role !== "SuperAdmin",
);

const DEFAULT_FORM = {
  fullName: "",
  userName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "Patient",
  phone: "",
  governorate: "",
  city: "",
  street: "",
};

const createInitialForm = (source = {}) => ({
  fullName: source?.fullName || "",
  userName: source?.userName || "",
  email: source?.email || "",
  password: "",
  confirmPassword: "",
  role: source?.role || "Patient",
  phone: source?.phone || "",
  governorate: source?.governorate || "",
  city: source?.city || "",
  street: source?.street || "",
});

function AdminUserModal({
  isOpen,
  mode,
  initialValue,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}) {
  const [form, setForm] = useState(() => createInitialForm(initialValue));
  const [formError, setFormError] = useState("");

  const isEditMode = mode === "edit";

  const title = useMemo(
    () => (isEditMode ? "Edit User" : "Add New User"),
    [isEditMode],
  );

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.userName.trim()) return "Username is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.phone.trim()) return "Phone is required.";
    if (!form.role.trim()) return "Role is required.";

    if (!isEditMode || form.password.trim()) {
      if (!form.password.trim()) return "Password is required.";
      if (form.password.length < 8)
        return "Password must be at least 8 characters.";
      if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password))
        return "Password must contain at least one letter and one number.";
      if (form.password !== form.confirmPassword)
        return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validate();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      userName: form.userName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    };

    if (isEditMode) {
      payload.governorate = form.governorate.trim();
      payload.city = form.city.trim();
      payload.street = form.street.trim();
    } else {
      payload.role = form.role;
    }

    if (!isEditMode || form.password.trim()) {
      payload.password = form.password;
      if (!isEditMode) {
        payload.confirmPassword = form.confirmPassword;
      }
    }

    await onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close user form"
      />

      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-4xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
              {isEditMode ? "Update user account" : "Create user account"}
            </p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? "Update account details and permissions for the selected user."
                : "Add a new user and set the role directly from the admin panel."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
            aria-label="Close modal"
          >
            <FiX />
          </button>
        </div>

        <form className="space-y-5 px-6 py-6" onSubmit={handleSubmit}>
          {(error || formError) && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error || formError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <AuthInput
              label="Full Name"
              type="text"
              placeholder="John Doe"
              icon={<FaUser />}
              value={form.fullName}
              onChange={(event) => handleChange("fullName", event.target.value)}
            />
            <AuthInput
              label="Username"
              type="text"
              placeholder="johndoe"
              icon={<FaUserTag />}
              value={form.userName}
              onChange={(event) => handleChange("userName", event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AuthInput
              label="Email"
              type="email"
              placeholder="name@example.com"
              icon={<FaUser />}
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
            />
            <AuthInput
              label="Phone"
              type="tel"
              placeholder="01000000000"
              icon={<FaPhone />}
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
            />
          </div>

          {isEditMode ? (
            <div className="grid gap-4 md:grid-cols-3">
              <AuthInput
                label="Governorate"
                type="text"
                placeholder="Cairo"
                icon={<FaMapMarkerAlt />}
                value={form.governorate}
                onChange={(event) =>
                  handleChange("governorate", event.target.value)
                }
              />
              <AuthInput
                label="City"
                type="text"
                placeholder="Nasr City"
                icon={<FaMapMarkerAlt />}
                value={form.city}
                onChange={(event) => handleChange("city", event.target.value)}
              />
              <AuthInput
                label="Street"
                type="text"
                placeholder="Street 10"
                icon={<FaMapMarkerAlt />}
                value={form.street}
                onChange={(event) => handleChange("street", event.target.value)}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(event) => handleChange("role", event.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-500"
                >
                  {USER_CREATION_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {!isEditMode && (
            <div className="grid gap-4 md:grid-cols-2">
              <AuthInput
                label="Password"
                type="password"
                placeholder="••••••••"
                isPassword
                icon={<FaLock />}
                value={form.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
              />
              <AuthInput
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                isPassword
                icon={<FaLock />}
                value={form.confirmPassword}
                onChange={(event) =>
                  handleChange("confirmPassword", event.target.value)
                }
              />
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Update User"
                  : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUserModal;
