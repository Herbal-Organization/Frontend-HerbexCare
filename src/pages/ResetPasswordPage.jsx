import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { IoIosMail } from "react-icons/io";
import { FaLock } from "react-icons/fa";
import { resetPasswordAccount } from "../api/accounts";
import AuthAlert from "../components/auth/AuthAlert";
import AuthInput from "../components/auth/AuthInput";
import AuthPageLayout from "../components/auth/AuthPageLayout";
import AuthSubmitButton from "../components/auth/AuthSubmitButton";
import useAsyncAction from "../hooks/useAsyncAction";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPassword = useWatch({
    control,
    name: "newPassword",
    defaultValue: "",
  });

  const {
    error,
    isLoading,
    execute: submitResetPassword,
    clearError,
  } = useAsyncAction(resetPasswordAccount, {
    defaultErrorMessage: "Password reset failed. Please try again.",
    onSuccess: () => {
      setSuccessMessage(
        "Password updated successfully. Please sign in with your new password.",
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
      await submitResetPassword({
        email: values.email,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
    } catch {
      return;
    }
  };

  return (
    <AuthPageLayout
      title="Reset Password"
      subtitle="Update your password securely using your current credentials."
      sideDescription="Keep your herbal care account secure by updating your password whenever you need."
    >
      <AuthAlert message={error} type="error" />
      <AuthAlert message={successMessage} type="success" />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
          label="Current Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          icon={<FaLock />}
          inputClassName="font-sans"
          error={errors.oldPassword?.message}
          {...register("oldPassword", {
            required: "Current password is required",
          })}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AuthInput
            label="New Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            icon={<FaLock />}
            inputClassName="font-sans"
            error={errors.newPassword?.message}
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "New password must be at least 8 characters",
              },
            })}
          />

          <AuthInput
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            icon={<FaLock />}
            inputClassName="font-sans"
            error={errors.confirmNewPassword?.message}
            {...register("confirmNewPassword", {
              required: "Please confirm your new password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          This endpoint requires your current password, so it works best as a
          change-password flow for existing users.
        </div>

        <div className="pt-2">
          <AuthSubmitButton
            isLoading={isLoading}
            label="Update Password"
            loadingLabel="Updating Password"
          />
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
    </AuthPageLayout>
  );
}

export default ResetPasswordPage;
