import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { IoIosMail } from "react-icons/io";
import { TiPhone } from "react-icons/ti";
import { FaPerson } from "react-icons/fa6";
import { MdLocalLibrary } from "react-icons/md";
import { loginAccount, registerAccount } from "../../api/accounts";
import { updateMyProfile } from "../../api/patients";
import useAsyncAction from "../../hooks/useAsyncAction";
import AuthAlert from "../../components/auth/AuthAlert";
import AuthInput from "../../components/auth/AuthInput";
import AuthSubmitButton from "../../components/auth/AuthSubmitButton";
import { saveHerbalistProfile } from "../../services/herbalistProfile";
import { clearAuthTokens, storeAuthTokens } from "../../services/authSession";

const buildTimeOptions = () => {
  const options = [];

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 30) {
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0",
      )}`;
      const labelHour = hour % 12 === 0 ? 12 : hour % 12;
      const labelMinute = minute === 0 ? "00" : "30";
      const period = hour < 12 ? "AM" : "PM";

      options.push({ value, label: `${labelHour}:${labelMinute} ${period}` });
    }
  }

  return options;
};

const TIME_OPTIONS = buildTimeOptions();

// Map backend field names to friendly field names
const FIELD_ERROR_MAP = {
  phone: "Phone Number",
  email: "Email Address",
  password: "Password",
  userName: "Username",
  fullName: "Full Name",
  confirmPassword: "Confirm Password",
  role: "Role",
};

// Parse backend validation errors and convert to readable messages
const parseBackendErrors = (errorResponse) => {
  const errors = errorResponse?.response?.data?.errors;
  if (!errors || typeof errors !== "object") {
    return null;
  }

  const messages = [];
  Object.entries(errors).forEach(([field, fieldErrors]) => {
    const fieldName = FIELD_ERROR_MAP[field] || field;
    if (Array.isArray(fieldErrors)) {
      fieldErrors.forEach((error) => {
        messages.push(`${fieldName}: ${error}`);
      });
    } else if (typeof fieldErrors === "string") {
      messages.push(`${fieldName}: ${fieldErrors}`);
    }
  });

  return messages.length > 0 ? messages.join(" | ") : null;
};

function Register({ setIsLogin, setSuccessMsg }) {
  const [role, setRole] = useState("Patient");
  const [generalError, setGeneralError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      userName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      gender: "",
      bio: "",
      availableFrom: "",
      availableTo: "",
    },
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });
  const availableFrom = useWatch({
    control,
    name: "availableFrom",
    defaultValue: "",
  });
  const {
    error,
    isLoading,
    execute: submitRegistration,
    clearError,
  } = useAsyncAction(registerAccount, {
    defaultErrorMessage: "Registration failed. Please check your details.",
  });

  const submitRoleDetails = async (values) => {
    try {
      const loginData = await loginAccount({
        email: values.email?.trim().toLowerCase(),
        password: values.password,
      });
      storeAuthTokens(loginData ?? {});

      if (role === "Patient") {
        await updateMyProfile({
          birthDate: values.birthDate || null,
          gender: values.gender || null,
        });
        return;
      }

      await saveHerbalistProfile({
        bio: values.bio,
        availableFrom: values.availableFrom,
        availableTo: values.availableTo,
      });
    } catch (err) {
      // If email confirmation is required, just skip role details for now
      // User will complete it after confirming their email
      if (
        err?.response?.data?.message?.includes("confirm") ||
        err?.response?.data?.message?.includes("email")
      ) {
        console.log("Email confirmation required - skipping role details");
        return;
      }
      throw err;
    } finally {
      clearAuthTokens();
    }
  };

  const onSubmit = async (values) => {
    clearError();
    setGeneralError("");

    try {
      // Validate phone format before sending
      const phoneDigits = values.phone?.replace(/\D/g, "") || "";
      if (phoneDigits.length < 8 || phoneDigits.length > 15) {
        return;
      }

      // Trim whitespace and prepare payload
      const payload = {
        fullName: values.fullName?.trim(),
        userName: values.userName?.trim(),
        email: values.email?.trim().toLowerCase(),
        phone: values.phone?.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
        role,
      };

      // Log payload for debugging
      console.log("Registration payload:", payload);

      await submitRegistration(payload);
      console.log("Registration successful!");

      let successMessage =
        "✓ Registration successful! Please check your email to confirm your account before logging in.";

      try {
        await submitRoleDetails(values);
      } catch {
        successMessage =
          "✓ Registration successful! Please check your email to confirm your account before logging in.\n(Profile details can be completed later)";
      }

      reset();
      setRole("Patient");
      setSuccessMsg(successMessage);
      window.setTimeout(() => {
        setIsLogin(true);
        setSuccessMsg(null);
      }, 4000);
    } catch (err) {
      // Try to parse backend validation errors
      const backendErrors = parseBackendErrors(err);
      if (backendErrors) {
        setGeneralError(backendErrors);
        console.error("Backend validation errors:", backendErrors);
      }
      return;
    }
  };

  return (
    <div>
      <AuthAlert message={error || generalError} type="error" />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <AuthInput
            label="Full Name"
            type="text"
            placeholder="Full name"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register("fullName", {
              required: "Full name is required",
              minLength: {
                value: 3,
                message: "Full name must be at least 3 characters",
              },
            })}
          />
          <AuthInput
            label="Username"
            type="text"
            placeholder="Username"
            autoComplete="username"
            error={errors.userName?.message}
            {...register("userName", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
            })}
          />
        </div>

        <AuthInput
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          icon={<IoIosMail />}
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
        />

        <AuthInput
          label="Phone Number"
          type="tel"
          placeholder="01203564652"
          autoComplete="tel"
          icon={<TiPhone />}
          error={errors.phone?.message}
          {...register("phone", {
            required: "Phone number is required",
            minLength: {
              value: 8,
              message: "Phone number must be at least 8 digits",
            },
            maxLength: {
              value: 15,
              message: "Phone number must not exceed 15 digits",
            },
            pattern: {
              value: /^[0-9+\-\s()]*$/,
              message:
                "Phone number contains invalid characters (only 0-9, +, -, spaces, and parentheses allowed)",
            },
            validate: (value) => {
              if (!value) return true;
              const digitsOnly = value.replace(/\D/g, "");
              if (digitsOnly.length < 8) {
                return "Phone number must contain at least 8 digits";
              }
              if (digitsOnly.length > 15) {
                return "Phone number must not exceed 15 digits";
              }
              return true;
            },
          })}
        />

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            I am registering as a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                role === "Patient"
                  ? "border-primary bg-primary-light/30"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="Patient"
                className="sr-only"
                checked={role === "Patient"}
                onChange={() => setRole("Patient")}
              />
              <FaPerson
                className={
                  role === "Patient" ? "text-primary" : "text-slate-400"
                }
              />
              <span
                className={`text-sm font-bold ${
                  role === "Patient" ? "text-primary" : "text-slate-600"
                }`}
              >
                Patient
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                role === "Herbalist"
                  ? "border-primary bg-primary-light/30"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="Herbalist"
                className="sr-only"
                checked={role === "Herbalist"}
                onChange={() => setRole("Herbalist")}
              />
              <MdLocalLibrary
                className={
                  role === "Herbalist" ? "text-primary" : "text-slate-400"
                }
              />
              <span
                className={`text-sm font-bold ${
                  role === "Herbalist" ? "text-primary" : "text-slate-600"
                }`}
              >
                Herbalist
              </span>
            </label>
          </div>
        </div>

        {role === "Patient" ? (
          <div className="grid grid-cols-2 gap-4">
            <AuthInput
              label="Birth Date"
              type="date"
              autoComplete="bday"
              error={errors.birthDate?.message}
              {...register("birthDate", {
                required: "Birth date is required for patient accounts",
              })}
            />
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Gender
              </label>
              <select
                className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                {...register("gender", {
                  required: "Gender is required for patient accounts",
                })}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender?.message ? (
                <p className="mt-2 text-xs font-semibold text-red-500">
                  {errors.gender.message}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Professional Bio
              </label>
              <textarea
                rows={4}
                placeholder="Tell patients about your herbal practice and expertise"
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                {...register("bio", {
                  required: "Bio is required for herbalist accounts",
                  minLength: {
                    value: 20,
                    message: "Bio should be at least 20 characters",
                  },
                })}
              />
              {errors.bio?.message ? (
                <p className="mt-2 text-xs font-semibold text-red-500">
                  {errors.bio.message}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Available From
                </label>
                <select
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  {...register("availableFrom", {
                    required: "Start time is required",
                  })}
                >
                  <option value="">Select start time</option>
                  {TIME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.availableFrom?.message ? (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {errors.availableFrom.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Available To
                </label>
                <select
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  {...register("availableTo", {
                    required: "End time is required",
                    validate: (value) => {
                      if (!value || !availableFrom) {
                        return true;
                      }

                      return (
                        value > availableFrom ||
                        "Available to time must be after available from time"
                      );
                    },
                  })}
                >
                  <option value="">Select end time</option>
                  {TIME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.availableTo?.message ? (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {errors.availableTo.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            inputClassName="font-sans"
            isPassword={true}
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              validate: (value) => {
                if (!value) return true;
                if (!/[A-Z]/.test(value))
                  return "Password must contain at least one uppercase letter";
                if (!/[a-z]/.test(value))
                  return "Password must contain at least one lowercase letter";
                if (!/[0-9]/.test(value))
                  return "Password must contain at least one number";
                return true;
              },
            })}
          />
          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            inputClassName="font-sans"
            isPassword={true}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
        </div>

        <div className="pt-2">
          <AuthSubmitButton
            isLoading={isLoading}
            label="Create Account"
            loadingLabel="Creating Account"
          />
        </div>
      </form>
    </div>
  );
}

export default Register;
