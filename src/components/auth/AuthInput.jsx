import { forwardRef } from "react";

const AuthInput = forwardRef(function AuthInput({
  label,
  error,
  icon,
  inputClassName = "",
  wrapperClassName = "",
  ...inputProps
}, ref) {
  const hasIcon = Boolean(icon);
  const baseInputClassName = `block w-full rounded-xl border py-3 outline-none focus:ring-1 text-slate-900 text-sm font-medium ${
    hasIcon ? "pl-11 pr-4" : "px-4"
  } ${
    error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
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
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 text-[20px]">
            {icon}
          </div>
        )}
        <input ref={ref} className={baseInputClassName} {...inputProps} />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
});

export default AuthInput;
