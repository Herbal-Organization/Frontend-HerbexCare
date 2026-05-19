import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { loginAccount, resendConfirmationEmail } from "@api/accounts";
import AuthAlert from "@features/auth/components/AuthAlert";
import AuthInput from "@features/auth/components/AuthInput";
import useAsyncAction from "@hooks/useAsyncAction";
import {
  getPostLoginRoute,
  storeAuthTokens,
} from "@features/auth/services/authSession";
import { getUserRole } from "@utils/auth";
import { useTranslation } from "react-i18next";
import { HiRefresh } from "react-icons/hi";
import { IoIosMail } from "react-icons/io";
import { FaLock, FaSignInAlt } from "react-icons/fa";
import SocialAuthButtons from "./SocialAuthButtons";
// SocialAuthButtons removed as it's not in the image, or we can keep it at the very bottom. Let's keep it just in case, or maybe remove if we strictly follow image. The image doesn't show it. Let's remove it to match exactly.

function Login({ setSuccessMsg }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const emailValue = watch("email");

  const {
    error,
    isLoading,
    execute: submitLogin,
    clearError,
  } = useAsyncAction(loginAccount, {
    defaultErrorMessage: t("auth.login.error"),
    onSuccess: (data) => {
      storeAuthTokens(data ?? {});
      setSuccessMsg(t("auth.login.success"));

      window.setTimeout(() => {
        const role = getUserRole();
        navigate(getPostLoginRoute(role));
      }, 1000);
    },
    onError: (err, message) => {
      if (
        message?.includes("confirm") ||
        message?.includes("confirmation") ||
        message?.toLowerCase().includes("email")
      ) {
        setPendingEmail(emailValue?.trim().toLowerCase());
      }
    },
  });

  const {
    isLoading: isResending,
    execute: submitResendEmail,
    clearError: clearResendError,
  } = useAsyncAction(resendConfirmationEmail, {
    defaultErrorMessage: "Failed to resend email. Please try again.",
    onSuccess: () => {
      setResendSuccess(
        "Confirmation email sent! Please check your inbox and spam folder.",
      );
      setTimeout(() => setResendSuccess(""), 5000);
    },
  });

  const handleResendEmail = async () => {
    clearResendError();
    setResendSuccess("");
    if (pendingEmail) {
      await submitResendEmail({ email: pendingEmail });
    }
  };

  const onSubmit = async (values) => {
    clearError();
    try {
      const payload = {
        email: values.email?.trim().toLowerCase(),
        password: values.password,
      };
      await submitLogin(payload);
    } catch (err) {
      console.error("Login error:", err?.response?.data);
      return;
    }
  };

  return (
    <div className="w-full">
      <AuthAlert message={error} type="error" />
      {resendSuccess && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {resendSuccess}
        </div>
      )}

      {pendingEmail && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="mb-3 text-sm text-blue-700">
            <strong>{t("auth.login.confirmationRequired")}</strong>
            <br />
            {t("auth.login.confirmationSubtitle")}
          </p>
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isResending}
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isResending
              ? t("auth.login.sending")
              : t("auth.login.resendConfirmation")}
          </button>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <AuthInput
          label="Email"
          type="email"
          placeholder="Enter your email"
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
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          inputClassName="font-sans"
          isPassword={true}
          icon={<FaLock />}
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
          })}
        />

        <div className="flex items-center justify-between pt-1 pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-primary focus:ring-primary"
              {...register("rememberMe")}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-400">
              Remember Me
            </span>
          </label>
          <Link
            to="/forget-password"
            className="text-sm font-medium text-primary dark:text-emerald-400 hover:text-primary-hover transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary dark:bg-emerald-600 px-4 py-3.5 text-base font-bold text-white shadow-md shadow-primary/20 dark:shadow-emerald-900/20 transition-all hover:bg-primary-hover dark:hover:bg-emerald-500 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <HiRefresh className="animate-spin text-xl" />
              <span>{t("auth.login.loading", "Logging in...")}</span>
            </>
          ) : (
            <>
              <FaSignInAlt />
              <span>Log In</span>
            </>
          )}
        </button>
      </form>

      <SocialAuthButtons />

      <div className="pt-8 text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="text-primary dark:text-emerald-400 font-bold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
