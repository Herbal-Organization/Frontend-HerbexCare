import { forwardRef, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const AuthInput = forwardRef(function AuthInput(
  {
    label,
    error,
    icon,
    inputClassName = "",
    wrapperClassName = "",
    isPassword = false,
    ...inputProps
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const hasIcon = Boolean(icon);

  const inputType = isPassword && showPassword ? "text" : inputProps.type;

  const baseInputClassName =
    `block w-full rounded-xl border py-3 outline-none focus:ring-1 text-slate-900 text-sm font-medium ${
      hasIcon ? "ps-11" : "px-4"
    } ${isPassword && showPassword ? "pe-11" : isPassword ? "pe-11" : "pe-4"} ${
      error
        ? "border-eed-500 focus:border-eed-500 focus:ring-red-500"
        : "border-slate-200 focus:border-primary focus:ring-primary"
    } ${inputClassName}`.trim();

  return (
    <div className={wrapperClassName}>
      {label ? (
        <label className="mb-2 block text-sm font-bold text-slate-700">
          {label}
        </label>
      ) : null}
      <div className="relative rounded-xl shadow-sm">
        {hasIcon && (
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-slate-400 text-[20px]">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={baseInputClassName}
          {...inputProps}
          type={inputType}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 end-0 flex items-center pe-4 text-slate-400 hover:text-slate-600 text-[20px]"
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
});

export default AuthInput;
