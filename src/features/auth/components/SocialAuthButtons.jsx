import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { googleLoginAccount } from "@api/accounts";
import { storeAuthTokens, getPostLoginRoute } from "@features/auth/services/authSession";
import { getUserRole } from "@utils/auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

function SocialAuthButtons() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    try {
      console.log("Google login success, sending token to backend...");
      
      // Send id_token to backend
      const data = await googleLoginAccount({
        idToken: credentialResponse.credential,
        role: "Patient", // Default role for social login
      });

      if (data) {
        storeAuthTokens(data);
        toast.success(t("auth.login.success"));
        
        const role = getUserRole();
        navigate(getPostLoginRoute(role));
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error(error?.response?.data?.message || t("auth.login.googleError"));
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
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#F9F9F9] px-4 text-slate-400 font-medium">
            {t("auth.login.orContinueWith")}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div className={`w-full max-w-sm ${isGoogleLoading ? "opacity-50 pointer-events-none" : ""}`}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
            shape="circle"
          />
        </div>
      </div>
    </div>
  );
}

export default SocialAuthButtons;
