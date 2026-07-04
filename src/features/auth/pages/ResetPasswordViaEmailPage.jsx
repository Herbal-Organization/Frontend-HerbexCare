import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { FaLock } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import {
  validateResetToken,
  resetPasswordViaEmail,
} from "@api/accounts";
import AuthAlert from "@features/auth/components/AuthAlert";
import AuthInput from "@features/auth/components/AuthInput";
import AuthPageLayout from "@features/auth/components/AuthPageLayout";
import AuthSubmitButton from "@features/auth/components/AuthSubmitButton";
import useAsyncAction from "@hooks/useAsyncAction";

function ResetPasswordViaEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const hasValidParams = Boolean(email && token);

  const [tokenStatus, setTokenStatus] = useState(hasValidParams ? "loading" : "error");
  const [tokenMessage, setTokenMessage] = useState(
    hasValidParams ? "" : "Missing email or token. Please use the link from your email.",
  );
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPassword = useWatch({ control, name: "newPassword", defaultValue: "" });

  useEffect(() => {
    if (!hasValidParams) return;

    let isActive = true;

    const validateToken = async () => {
      try {
        await validateResetToken(email, token);
        if (!isActive) return;
        setTokenStatus("valid");
      } catch (err) {
        if (!isActive) return;
        setTokenStatus("error");
        setTokenMessage(
          err?.response?.data?.message ||
            "Invalid or expired reset link. Please request a new one.",
        );
      }
    };

    validateToken();

    return () => {
      isActive = false;
    };
  }, [email, token, hasValidParams]);

  const {
    error,
    isLoading,
    execute: submitReset,
    clearError,
  } = useAsyncAction(resetPasswordViaEmail, {
    defaultErrorMessage: "Password reset failed. Please try again.",
    onSuccess: () => {
      setSuccessMessage("Password updated successfully. You can now sign in.");
      reset();
      window.setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    },
  });

  const onSubmit = async (values) => {
    clearError();
    setSuccessMessage("");
    try {
      await submitReset({
        email,
        token,
        newPassword: values.newPassword,
      });
    } catch {
      return;
    }
  };

  if (tokenStatus === "loading") {
    return (
      <AuthPageLayout
        title="Reset Password"
        subtitle="Validating your reset link..."
      >
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500">Please wait...</p>
        </div>
      </AuthPageLayout>
    );
  }

  if (tokenStatus === "error") {
    return (
      <AuthPageLayout
        title="Reset Password"
        subtitle="Link validation failed"
      >
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <MdErrorOutline className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Invalid Link
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {tokenMessage}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/forget-password"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            Request a New Reset Link
          </Link>
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title="Set New Password"
      subtitle="Enter your new password below."
    >
      <AuthAlert message={error} type="error" />
      <AuthAlert message={successMessage} type="success" />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <AuthInput
          label="New Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          icon={<FaLock />}
          inputClassName="font-sans"
          isPassword={true}
          error={errors.newPassword?.message}
          {...register("newPassword", {
            required: "New password is required",
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
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          icon={<FaLock />}
          inputClassName="font-sans"
          isPassword={true}
          error={errors.confirmNewPassword?.message}
          {...register("confirmNewPassword", {
            required: "Please confirm your new password",
            validate: (value) =>
              value === newPassword || "Passwords do not match",
          })}
        />

        <div className="pt-2">
          <AuthSubmitButton
            isLoading={isLoading}
            label="Reset Password"
            loadingLabel="Resetting Password"
          />
        </div>
      </form>

      <div className="mt-8 text-center">
        <Link
          to="/auth/login"
          className="text-sm font-bold text-primary hover:text-primary-hover"
        >
          Back to Sign In
        </Link>
      </div>
    </AuthPageLayout>
  );
}

export default ResetPasswordViaEmailPage;
