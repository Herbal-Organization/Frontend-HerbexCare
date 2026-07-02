import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { googleLoginAccount } from "@api/accounts";
import { handlePostLogin } from "@features/auth/services/authSession";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

function SocialAuthButtons({ role = "Patient" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    try {
      const data = await googleLoginAccount({
        idToken: credentialResponse.credential,
        role,
      });

      if (data) {
        console.log("Google Login Response:", data);
        handlePostLogin(data, navigate, {
          delay: 1000,
          onBeforeNavigate: () => toast.success(t("auth.login.success")),
        });
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error(
        error?.response?.data?.message || t("auth.login.googleError"),
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleError = () => {
    console.error("Google Login Failed");
    toast.error(t("auth.login.googleError"));
  };

  return (
    <div className="mt-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#F9F9F9] dark:bg-slate-900 px-4 text-slate-400 dark:text-slate-500 font-medium transition-colors duration-300">
            {t("auth.login.orContinueWith")}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div
          className={`w-full max-w-sm ${
            isGoogleLoading ? "opacity-50 pointer-events-none" : ""
          } flex justify-center items-center rounded-full overflow-hidden`}
        >
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            theme="filled_blue"
            size="large"
            width="320px"
            text="continue_with"
            shape="pill"
          />
        </div>
      </div>
    </div>
  );
}

export default SocialAuthButtons;
