import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { IoIosMail } from "react-icons/io";
import { TiPhone } from "react-icons/ti";
import { FaPerson } from "react-icons/fa6";
import { MdLocalLibrary } from "react-icons/md";
import { registerAccount } from "../../api/accounts";
import useAsyncAction from "../../hooks/useAsyncAction";
import AuthAlert from "../../components/auth/AuthAlert";
import AuthInput from "../../components/auth/AuthInput";
import AuthSubmitButton from "../../components/auth/AuthSubmitButton";

function Register({ setIsLogin, setSuccessMsg }) {
  const [role, setRole] = useState("Patient");
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      userName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });
  const {
    error,
    isLoading,
    execute: submitRegistration,
    clearError,
  } = useAsyncAction(registerAccount, {
    defaultErrorMessage: "Registration failed. Please check your details.",
    onSuccess: () => {
      reset();
      setRole("Patient");
      setSuccessMsg("Registration successful! Please log in.");
      window.setTimeout(() => {
        setIsLogin(true);
        setSuccessMsg(null);
      }, 2000);
    },
  });

  const onSubmit = async (values) => {
    clearError();

    try {
      await submitRegistration({
        ...values,
        role,
      });
    } catch {
      return;
    }
  };

  return (
    <div>
      <AuthAlert message={error} type="error" />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <AuthInput
            label="Full Name"
            type="text"
            placeholder="Full name"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register("fullName", {
              required: "Full name is required",
              minLength: {
                value: 3,
                message: "Full name must be at least 3 characters",
              },
            })}
          />
          <AuthInput
            label="Username"
            type="text"
            placeholder="Username"
            autoComplete="username"
            error={errors.userName?.message}
            {...register("userName", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
            })}
          />
        </div>

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
          label="Phone Number"
          type="tel"
          placeholder="01203564652"
          autoComplete="tel"
          icon={<TiPhone />}
          error={errors.phone?.message}
          {...register("phone", {
            required: "Phone number is required",
            minLength: {
              value: 8,
              message: "Phone number must be at least 8 digits",
            },
          })}
        />

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            I am registering as a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                role === "Patient"
                  ? "border-primary bg-primary-light/30"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="Patient"
                className="sr-only"
                checked={role === "Patient"}
                onChange={() => setRole("Patient")}
              />
              <FaPerson
                className={role === "Patient" ? "text-primary" : "text-slate-400"}
              />
              <span
                className={`text-sm font-bold ${
                  role === "Patient" ? "text-primary" : "text-slate-600"
                }`}
              >
                Patient
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                role === "Herbalist"
                  ? "border-primary bg-primary-light/30"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="Herbalist"
                className="sr-only"
                checked={role === "Herbalist"}
                onChange={() => setRole("Herbalist")}
              />
              <MdLocalLibrary
                className={role === "Herbalist" ? "text-primary" : "text-slate-400"}
              />
              <span
                className={`text-sm font-bold ${
                  role === "Herbalist" ? "text-primary" : "text-slate-600"
                }`}
              >
                Herbalist
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            inputClassName="font-sans"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            inputClassName="font-sans"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
        </div>

        <div className="pt-2">
          <AuthSubmitButton
            isLoading={isLoading}
            label="Create Account"
            loadingLabel="Creating Account"
          />
        </div>
      </form>
    </div>
  );
}

export default Register;
