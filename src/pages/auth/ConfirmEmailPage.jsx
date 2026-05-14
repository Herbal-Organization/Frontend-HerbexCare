import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaCircleCheck } from "react-icons/fa6";
import { MdErrorOutline, MdMailOutline } from "react-icons/md";
import { confirmEmail } from "../../api/accounts";
import AuthAlert from "../../components/auth/AuthAlert";
import AuthPageLayout from "../../components/auth/AuthPageLayout";
import { useTranslation } from "react-i18next";

function ConfirmEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      setStatus("error");
      setMessage(t("auth.confirmEmail.missingParams"));
      return;
    }

    let isActive = true;

    const verifyEmail = async () => {
      try {
        const data = await confirmEmail(email, token);
        if (!isActive) return;

        setStatus("success");
        setMessage(data?.message || t("auth.confirmEmail.successMessage"));
      } catch (error) {
        if (!isActive) return;

        setStatus("error");
        setMessage(
          error?.response?.data?.message || t("auth.confirmEmail.errorMessage"),
        );
      }
    };

    verifyEmail();

    return () => {
      isActive = false;
    };
  }, [searchParams, t]);

  const isSuccess = status === "success";
  const isLoading = status === "loading";

  return (
    <AuthPageLayout
      title={t("auth.confirmEmail.title")}
      subtitle={t("auth.confirmEmail.subtitle")}
      sideDescription={t("auth.confirmEmail.sideDescription")}
    >
      <div
        className={`rounded-2xl border p-6 shadow-sm ${
          isSuccess
            ? "border-green-100 bg-green-50"
            : status === "error"
              ? "border-red-100 bg-red-50"
              : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              isSuccess
                ? "bg-green-100 text-green-600"
                : status === "error"
                  ? "bg-red-100 text-red-600"
                  : "bg-primary-light/30 text-primary"
            }`}
          >
            {isSuccess ? (
              <FaCircleCheck className="text-xl" />
            ) : status === "error" ? (
              <MdErrorOutline className="text-2xl" />
            ) : (
              <MdMailOutline className="text-2xl animate-pulse" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-900">
              {isLoading
                ? t("auth.confirmEmail.loadingTitle")
                : isSuccess
                  ? t("auth.confirmEmail.successTitle")
                  : t("auth.confirmEmail.errorTitle")}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isLoading ? t("auth.confirmEmail.loadingMessage") : message}
            </p>

            {isSuccess && (
              <p className="mt-3 text-sm font-medium text-green-700">
                {t("auth.confirmEmail.successHint")}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/auth"
            className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition-colors ${
              isSuccess
                ? "bg-green-600 text-white hover:bg-green-700"
                : status === "error"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-primary text-white hover:bg-primary-hover"
            }`}
          >
            {t("auth.confirmEmail.backToLogin")}
          </Link>
          {status === "error" && (
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t("auth.confirmEmail.tryAgain")}
            </Link>
          )}
        </div>
      </div>

      <AuthAlert
        message={
          isSuccess
            ? t("auth.confirmEmail.successAlert")
            : status === "error"
              ? t("auth.confirmEmail.errorAlert")
              : ""
        }
        type={isSuccess ? "success" : "error"}
      />
    </AuthPageLayout>
  );
}

export default ConfirmEmailPage;
