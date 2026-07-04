import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { loginAccount, resendConfirmationEmail } from "@api/accounts";
import AuthAlert from "@features/auth/components/AuthAlert";
import AuthInput from "@features/auth/components/AuthInput";
import useAsyncAction from "@hooks/useAsyncAction";
import { handlePostLogin } from "@features/auth/services/authSession";
import { useTranslation } from "react-i18next";
import { HiRefresh } from "react-icons/hi";
import { IoIosMail } from "react-icons/io";
import { FaLock, FaSignInAlt } from "react-icons/fa";
import SocialAuthButtons from "./SocialAuthButtons";

function Login({ setSuccessMsg }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [emailNotConfirmedError, setEmailNotConfirmedError] = useState("");
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
      setEmailNotConfirmedError("");
      const result = handlePostLogin(data, navigate, {
        delay: 1000,
        onBeforeNavigate: () => setSuccessMsg(t("auth.login.success")),
        onEmailNotConfirmed: () => {
          setPendingEmail(emailValue?.trim().toLowerCase());
          setEmailNotConfirmedError(t("auth.login.emailNotConfirmed"));
        },
      });
      if (result?.emailConfirmed === false) {
        setPendingEmail(emailValue?.trim().toLowerCase());
        setEmailNotConfirmedError(t("auth.login.emailNotConfirmed"));
      }
    },
    onError: (err, message) => {
      setEmailNotConfirmedError("");
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
    defaultErrorMessage: t("auth.login.resendError"),
    onSuccess: () => {
      setResendSuccess(t("auth.login.resendSuccess"));
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
      <AuthAlert message={error || emailNotConfirmedError} type="error" />
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
          label={t("auth.login.emailLabel")}
          type="email"
          placeholder={t("auth.login.emailPlaceholder")}
          autoComplete="email"
          icon={<IoIosMail />}
          error={errors.email?.message}
          {...register("email", {
            required: t("auth.login.emailRequired"),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("auth.login.emailInvalid"),
            },
          })}
        />

        <AuthInput
          label={t("auth.login.passwordLabel")}
          type="password"
          placeholder={t("auth.login.passwordPlaceholder")}
          autoComplete="current-password"
          inputClassName="font-sans"
          isPassword={true}
          icon={<FaLock />}
          error={errors.password?.message}
          {...register("password", {
            required: t("auth.login.passwordRequired"),
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
              {t("auth.login.rememberMe")}
            </span>
          </label>
          <Link
            to="/forget-password"
            className="text-sm font-medium text-primary dark:text-emerald-400 hover:text-primary-hover transition-colors"
          >
            {t("auth.login.forgotPassword")}
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
              <span>{t("auth.login.loading")}</span>
            </>
          ) : (
            <>
              <FaSignInAlt />
              <span>{t("auth.login.submit")}</span>
            </>
          )}
        </button>
      </form>

      <SocialAuthButtons />

      <div className="pt-8 text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
          {t("auth.login.dontHaveAccount")}{" "}
          <Link
            to="/auth/register"
            className="text-primary dark:text-emerald-400 font-bold hover:underline"
          >
            {t("auth.login.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
