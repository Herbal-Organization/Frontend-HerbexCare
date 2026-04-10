import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { IoIosMail } from "react-icons/io";
import { TiPhone } from "react-icons/ti";
import { FaPerson } from "react-icons/fa6";
import { MdLocalLibrary } from "react-icons/md";
import { loginAccount, registerAccount } from "../../api/accounts";
import { updateMyPatientProfile } from "../../api/patients";
import useAsyncAction from "../../hooks/useAsyncAction";
import AuthAlert from "../../components/auth/AuthAlert";
import AuthInput from "../../components/auth/AuthInput";
import AuthSubmitButton from "../../components/auth/AuthSubmitButton";
import { saveHerbalistProfile } from "../../services/herbalistProfile";
import { clearAuthTokens, storeAuthTokens } from "../../services/authSession";

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
      birthDate: "",
      gender: "",
      bio: "",
      availableFrom: "",
      availableTo: "",
    },
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });
  const availableFrom = useWatch({
    control,
    name: "availableFrom",
    defaultValue: "",
  });
  const {
    error,
    isLoading,
    execute: submitRegistration,
    clearError,
  } = useAsyncAction(registerAccount, {
    defaultErrorMessage: "Registration failed. Please check your details.",
  });

  const submitRoleDetails = async (values) => {
    const loginData = await loginAccount({
      email: values.email,
      password: values.password,
    });
    storeAuthTokens(loginData ?? {});

    try {
      if (role === "Patient") {
        await updateMyPatientProfile({
          birthDate: values.birthDate || null,
          gender: values.gender || null,
        });
        return;
      }

      await saveHerbalistProfile({
        bio: values.bio,
        availableFrom: values.availableFrom,
        availableTo: values.availableTo,
      });
    } finally {
      clearAuthTokens();
    }
  };

  const onSubmit = async (values) => {
    clearError();

    try {
      await submitRegistration({
        fullName: values.fullName,
        userName: values.userName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role,
      });

      let successMessage = "Registration successful! Please log in.";

      try {
        await submitRoleDetails(values);
      } catch {
        successMessage =
          "Registration successful, but profile details could not be saved now. You can complete them later.";
      }

      reset();
      setRole("Patient");
      setSuccessMsg(successMessage);
      window.setTimeout(() => {
        setIsLogin(true);
        setSuccessMsg(null);
      }, 2500);
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

        {role === "Patient" ? (
          <div className="grid grid-cols-2 gap-4">
            <AuthInput
              label="Birth Date"
              type="date"
              autoComplete="bday"
              error={errors.birthDate?.message}
              {...register("birthDate", {
                required: "Birth date is required for patient accounts",
              })}
            />
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Gender
              </label>
              <select
                className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                {...register("gender", {
                  required: "Gender is required for patient accounts",
                })}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender?.message ? (
                <p className="mt-2 text-xs font-semibold text-red-500">
                  {errors.gender.message}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Professional Bio
              </label>
              <textarea
                rows={4}
                placeholder="Tell patients about your herbal practice and expertise"
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                {...register("bio", {
                  required: "Bio is required for herbalist accounts",
                  minLength: {
                    value: 20,
                    message: "Bio should be at least 20 characters",
                  },
                })}
              />
              {errors.bio?.message ? (
                <p className="mt-2 text-xs font-semibold text-red-500">
                  {errors.bio.message}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AuthInput
                label="Available From"
                type="time"
                error={errors.availableFrom?.message}
                {...register("availableFrom", {
                  required: "Start time is required",
                })}
              />
              <AuthInput
                label="Available To"
                type="time"
                error={errors.availableTo?.message}
                {...register("availableTo", {
                  required: "End time is required",
                  validate: (value) => {
                    if (!value || !availableFrom) {
                      return true;
                    }

                    return (
                      value > availableFrom ||
                      "Available to time must be after available from time"
                    );
                  },
                })}
              />
            </div>
          </div>
        )}

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
