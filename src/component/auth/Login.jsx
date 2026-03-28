import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { IoIosMail } from "react-icons/io";
import { FaLock } from "react-icons/fa";
import { loginAccount } from "../../api/accounts";
import AuthAlert from "../../components/auth/AuthAlert";
import AuthInput from "../../components/auth/AuthInput";
import AuthSubmitButton from "../../components/auth/AuthSubmitButton";
import useAsyncAction from "../../hooks/useAsyncAction";
import { getPostLoginRoute, storeAuthTokens } from "../../services/authSession";
import { getUserRole } from "../../utils/auth";

function Login({ setSuccessMsg }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    error,
    isLoading,
    execute: submitLogin,
    clearError,
  } = useAsyncAction(loginAccount, {
    defaultErrorMessage: "Login failed. Please check your credentials.",
    onSuccess: (data) => {
      storeAuthTokens(data ?? {});
      setSuccessMsg("Login successful!");

      window.setTimeout(() => {
        const role = getUserRole();
        navigate(getPostLoginRoute(role));
      }, 1000);
    },
  });

  const onSubmit = async (values) => {
    clearError();
    try {
      await submitLogin(values);
    } catch {
      return;
    }
  };

  return (
    <div>
      <AuthAlert message={error} type="error" />

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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-700">
              Password
            </label>
            <Link
              to="/forget"
              className="text-xs font-bold text-primary hover:text-primary-hover"
            >
              Forgot password?
            </Link>
          </div>
          <AuthInput
            label=""
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            icon={<FaLock />}
            inputClassName="font-sans"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
            })}
          />
        </div>

        <div className="pt-2">
          <AuthSubmitButton
            isLoading={isLoading}
            label="Sign In"
            loadingLabel="Signing In"
            className="cursor-pointer"
          />
        </div>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-slate-400 font-medium">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-5 w-5"
            />
            <span className="sr-only sm:not-sr-only">Google</span>
          </button>
          <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <img
              src="https://www.svgrepo.com/show/475647/facebook-color.svg"
              alt="Facebook"
              className="h-5 w-5"
            />
            <span className="sr-only sm:not-sr-only">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
