import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, useWatch } from "react-hook-form";
import { IoIosMail } from "react-icons/io";
import { TiPhone } from "react-icons/ti";
import { FaPerson } from "react-icons/fa6";
import { MdLocalLibrary } from "react-icons/md";
import { loginAccount, registerAccount } from "../../api/accounts";
import useAsyncAction from "../../hooks/useAsyncAction";
import AuthAlert from "../../components/auth/AuthAlert";
import AuthInput from "../../components/auth/AuthInput";
import AuthSubmitButton from "../../components/auth/AuthSubmitButton";
import SocialAuthButtons from "./SocialAuthButtons";

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
  const { t } = useTranslation();
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
    },
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });
  const {
    error,
    isLoading,
    execute: submitRegistration,
    clearError,
  } = useAsyncAction(registerAccount, {
    defaultErrorMessage: t("auth.register.error"),
  });

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

      const successMessage =
        "✓ Registration successful! Please check your email to confirm your account before logging in.";

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
            label={t("auth.register.fullName")}
            type="text"
            placeholder={t("auth.register.fullName")}
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
            label={t("auth.register.username")}
            type="text"
            placeholder={t("auth.register.username")}
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
          label={t("auth.register.email")}
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
            label={t("auth.register.submit")}
            loadingLabel={t("auth.register.loading")}
          />
        </div>
      </form>

      <SocialAuthButtons />
    </div>
  );
}

export default Register;
