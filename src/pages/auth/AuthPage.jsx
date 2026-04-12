import { useState } from "react";
import { Link } from "react-router-dom";
import Login from "../../components/auth/Login";
import Register from "../../components/auth/Register";
import { FaCircleCheck } from "react-icons/fa6";
import AuthPageLayout from "../../components/auth/AuthPageLayout";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [successMsg, setSuccessMsg] = useState(null);

  return (
    <AuthPageLayout
      title={isLogin ? "Welcome back" : "Create an account"}
      subtitle={
        isLogin
          ? "Please enter your details to continue"
          : "Join us to start your natural wellness journey"
      }
    >
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
      >
        <span aria-hidden="true">←</span>
        Back to Home
      </Link>

      <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8">
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isLogin ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(false);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isLogin ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
        >
          Create Account
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3 text-primary">
          <FaCircleCheck className="text-primary" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      <div className="mt-2">
        {isLogin ? (
          <Login setSuccessMsg={setSuccessMsg} />
        ) : (
          <Register setIsLogin={setIsLogin} setSuccessMsg={setSuccessMsg} />
        )}
      </div>
    </AuthPageLayout>
  );
}

export default AuthPage;
