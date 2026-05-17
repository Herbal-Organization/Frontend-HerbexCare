import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { IoIosMail } from "react-icons/io";
import { forgotPasswordAccount } from "@api/accounts";
import AuthAlert from "@features/auth/components/AuthAlert";
import AuthInput from "@features/auth/components/AuthInput";
import AuthPageLayout from "@features/auth/components/AuthPageLayout";
import AuthSubmitButton from "@features/auth/components/AuthSubmitButton";
import useAsyncAction from "@hooks/useAsyncAction";
import { useTranslation } from "react-i18next";

function ForgetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const {
    error,
    isLoading,
    execute: submitForgotPassword,
    clearError,
  } = useAsyncAction(forgotPasswordAccount, {
    defaultErrorMessage: t("auth.forgotPassword.error"),
    onSuccess: () => {
      setSuccessMessage(
        "Password reset successful. You can now sign in using your new password.",
      );
      reset();
      window.setTimeout(() => {
        navigate("/auth");
      }, 1500);
    },
  });

  const onSubmit = async (values) => {
    clearError();
    setSuccessMessage("");
    try {
      await submitForgotPassword({
        email: values.email,
      });
    } catch {
      return;
    }
  };

  return (
    <AuthPageLayout
      title={t("auth.forgotPassword.title")}
      subtitle={t("auth.forgotPassword.subtitle")}
      sideDescription={t("auth.forgotPassword.sideDescription")}
    >
      <AuthAlert message={error} type="error" />
      <AuthAlert message={successMessage} type="success" />

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



        {/* <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This API currently asks for a new password directly. If the backend is
          updated later to use email OTP or reset links, we should update this
          screen to match that safer flow.
        </div> */}

        <div className="pt-2">
          <AuthSubmitButton
            isLoading={isLoading}
            label={t("auth.forgotPassword.submit")}
            loadingLabel={t("auth.forgotPassword.loading")}
            className="cursor-pointer"
          />
        </div>
      </form>

      <div className="mt-8 text-center">
        <Link
          to="/auth/login"
          className="text-sm font-bold text-primary hover:text-primary-hover"
        >
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </div>
    </AuthPageLayout>
  );
}

export default ForgetPassword;
