import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FaPerson } from "react-icons/fa6";
import { MdLocalLibrary } from "react-icons/md";
import { registerAccount } from "@api/accounts";
import useAsyncAction from "@hooks/useAsyncAction";
import AuthAlert from "@features/auth/components/AuthAlert";
import AuthInput from "@features/auth/components/AuthInput";
import { HiRefresh } from "react-icons/hi";
import SocialAuthButtons from "./SocialAuthButtons";
import { IoIosMail } from "react-icons/io";
import { FaLock, FaUser, FaPhone, FaUserPlus } from "react-icons/fa";

function Register({ setSuccessMsg }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [role, setRole] = useState("Patient");
  const [generalError, setGeneralError] = useState("");

  // Map backend field names to friendly field names using translations
  const FIELD_ERROR_MAP = {
    phone: t("auth.register.phone"),
    email: t("auth.register.email"),
    password: t("auth.register.password"),
    userName: t("auth.register.username"),
    fullName: t("auth.register.fullName"),
    confirmPassword: t("auth.register.confirmPassword"),
    role: t("auth.register.accountRole"),
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

      await submitRegistration(payload);

      const successMessage = t("auth.register.successMessage");

      reset();
      setRole("Patient");
      setSuccessMsg(successMessage);
      window.setTimeout(() => {
        navigate("/auth/login");
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
    <div className="w-full">
      <AuthAlert message={error || generalError} type="error" />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <AuthInput
            label={t("auth.register.fullName")}
            type="text"
            placeholder={t("auth.register.fullNamePlaceholder")}
            autoComplete="name"
            icon={<FaUser />}
            error={errors.fullName?.message}
            {...register("fullName", {
              required: t("auth.register.fullNameRequired"),
              minLength: {
                value: 3,
                message: t("auth.register.fullNameMinLength"),
              },
            })}
          />
          <AuthInput
            label={t("auth.register.username")}
            type="text"
            placeholder={t("auth.register.usernamePlaceholder")}
            autoComplete="username"
            icon={<FaUser />}
            error={errors.userName?.message}
            {...register("userName", {
              required: t("auth.register.usernameRequired"),
              minLength: {
                value: 3,
                message: t("auth.register.usernameMinLength"),
              },
            })}
          />
        </div>

        <AuthInput
          label={t("auth.register.email")}
          type="email"
          placeholder={t("auth.register.emailPlaceholder")}
          autoComplete="email"
          icon={<IoIosMail />}
          error={errors.email?.message}
          {...register("email", {
            required: t("auth.register.emailRequired"),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("auth.register.emailInvalid"),
            },
          })}
        />

        <AuthInput
          label={t("auth.register.phone")}
          type="tel"
          placeholder={t("auth.register.phonePlaceholder")}
          autoComplete="tel"
          icon={<FaPhone />}
          error={errors.phone?.message}
          {...register("phone", {
            required: t("auth.register.phoneRequired"),
            minLength: {
              value: 8,
              message: t("auth.register.phoneMinLength"),
            },
            maxLength: {
              value: 15,
              message: t("auth.register.phoneMaxLength"),
            },
            pattern: {
              value: /^[0-9+\-\s()]*$/,
              message: t("auth.register.phoneInvalid"),
            },
            validate: (value) => {
              if (!value) return true;
              const digitsOnly = value.replace(/\D/g, "");
              if (digitsOnly.length < 8) {
                return t("auth.register.phoneMinLength");
              }
              if (digitsOnly.length > 15) {
                return t("auth.register.phoneMaxLength");
              }
              return true;
            },
          })}
        />

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
            {t("auth.register.accountRole")}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex cursor-pointer items-center justify-center gap-3 rounded-xl border py-2.5 transition-colors ${
                role === "Patient"
                  ? "border-primary dark:border-emerald-500 bg-primary/10 dark:bg-emerald-500/10"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50"
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
                  role === "Patient"
                    ? "text-primary dark:text-emerald-400"
                    : "text-slate-400"
                }
              />
              <span
                className={`text-sm font-bold ${
                  role === "Patient"
                    ? "text-primary dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {t("auth.register.patient")}
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-center justify-center gap-3 rounded-xl border py-2.5 transition-colors ${
                role === "Herbalist"
                  ? "border-primary dark:border-emerald-500 bg-primary/10 dark:bg-emerald-500/10"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50"
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
                  role === "Herbalist"
                    ? "text-primary dark:text-emerald-400"
                    : "text-slate-400"
                }
              />
              <span
                className={`text-sm font-bold ${
                  role === "Herbalist"
                    ? "text-primary dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {t("auth.register.herbalist")}
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AuthInput
            label={t("auth.register.password")}
            type="password"
            placeholder={t("auth.register.passwordPlaceholder")}
            autoComplete="new-password"
            inputClassName="font-sans"
            isPassword={true}
            icon={<FaLock />}
            error={errors.password?.message}
            {...register("password", {
              required: t("auth.register.passwordRequired"),
              minLength: {
                value: 8,
                message: t("auth.register.passwordMinLength"),
              },
              validate: (value) => {
                if (!value) return true;
                if (!/[A-Z]/.test(value)) return t("auth.register.passwordUppercase");
                if (!/[a-z]/.test(value)) return t("auth.register.passwordLowercase");
                if (!/[0-9]/.test(value)) return t("auth.register.passwordNumber");
                return true;
              },
            })}
          />
          <AuthInput
            label={t("auth.register.confirmPassword")}
            type="password"
            placeholder={t("auth.register.confirmPasswordPlaceholder")}
            autoComplete="new-password"
            inputClassName="font-sans"
            isPassword={true}
            icon={<FaLock />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: t("auth.register.confirmPasswordRequired"),
              validate: (value) =>
                value === password || t("auth.register.passwordsMismatch"),
            })}
          />
        </div>

        <div className="pt-4">
          <button
            disabled={isLoading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary dark:bg-emerald-600 px-4 py-3.5 text-base font-bold text-white shadow-md shadow-primary/20 dark:shadow-emerald-900/20 transition-all hover:bg-primary-hover dark:hover:bg-emerald-500 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <>
                <HiRefresh className="animate-spin text-xl" />
                <span>{t("auth.register.loading")}</span>
              </>
            ) : (
              <>
                <FaUserPlus />
                <span>{t("auth.register.submit")}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <SocialAuthButtons role={role} />

      <div className="pt-8 text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
          {t("auth.register.alreadyHaveAccount")}{" "}
          <Link
            to="/auth/login"
            className="text-primary dark:text-emerald-400 font-bold hover:underline"
          >
            {t("auth.register.logIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
