import { useState } from "react";
import { useLocation } from "react-router-dom";
import Login from "@features/auth/components/Login";
import Register from "@features/auth/components/Register";
import AuthPageLayout from "@features/auth/components/AuthPageLayout";
import { useTranslation } from "react-i18next";
import { FaCircleCheck } from "react-icons/fa6";

function AuthPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const isLogin = location.pathname === "/auth/login";
  const [successMsg, setSuccessMsg] = useState(null);

  // We can pass these down or handle them inside the form components.
  // The image shows "Welcome back" / "Sign in to your Herbalist AI account"
  return (
    <AuthPageLayout
      isLogin={isLogin}
      title={isLogin ? t("auth.login.title", "Welcome back") : t("auth.register.title", "Create an account")}
      subtitle={
        isLogin
          ? t("auth.login.subtitle", "Sign in to your Herbalist AI account")
          : t("auth.register.subtitle", "Join Herbalist AI to start your wellness journey")
      }
    >
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3 text-[#00E62E]">
          <FaCircleCheck className="text-[#00E62E]" />
          <p className="text-sm font-medium text-slate-800">{successMsg}</p>
        </div>
      )}

      {isLogin ? (
        <Login setSuccessMsg={setSuccessMsg} />
      ) : (
        <Register setSuccessMsg={setSuccessMsg} />
      )}
    </AuthPageLayout>
  );
}

export default AuthPage;
