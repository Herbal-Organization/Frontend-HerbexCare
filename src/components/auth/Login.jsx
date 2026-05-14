import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { IoIosMail } from "react-icons/io";
import { FaLock } from "react-icons/fa";
import { loginAccount, resendConfirmationEmail } from "../../api/accounts";
import AuthAlert from "../../components/auth/AuthAlert";
import AuthInput from "../../components/auth/AuthInput";
import AuthSubmitButton from "../../components/auth/AuthSubmitButton";
import useAsyncAction from "../../hooks/useAsyncAction";
import { getPostLoginRoute, storeAuthTokens } from "../../services/authSession";
import { getUserRole } from "../../utils/auth";
import { useTranslation } from "react-i18next";
import SocialAuthButtons from "./SocialAuthButtons";

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
      // Check if error is about email confirmation
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
      // Trim email and password to prevent whitespace issues
      const payload = {
        email: values.email?.trim().toLowerCase(),
        password: values.password,
      };
      console.log("Login attempt with:", { email: payload.email });
      await submitLogin(payload);
    } catch (err) {
      console.error("Login error:", err?.response?.data);
      return;
    }
  };

  return (
    <div>
      <AuthAlert message={error} type="error" />
      {resendSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {resendSuccess}
        </div>
      )}

      {pendingEmail && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
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
            {isResending ? t("auth.login.sending") : t("auth.login.resendConfirmation")}
          </button>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <AuthInput
          label={t("auth.login.emailLabel")}
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-700">
              {t("auth.login.passwordLabel")}
            </label>
            <Link
              to="/forget"
              className="text-xs font-bold text-primary hover:text-primary-hover"
            >
              {t("auth.login.forgotPassword")}
            </Link>
          </div>
          <AuthInput
            label=""
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            icon={<FaLock />}
            inputClassName="font-sans"
            isPassword={true}
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
            })}
          />
        </div>

        <div className="pt-2">
          <AuthSubmitButton
            isLoading={isLoading}
            label={t("auth.login.submit")}
            loadingLabel={t("auth.login.loading")}
            className="cursor-pointer"
          />
        </div>
      </form>

      <SocialAuthButtons />
    </div>
  );
}

export default Login;
