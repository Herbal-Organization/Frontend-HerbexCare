import { HiRefresh } from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa";

function AuthSubmitButton({ isLoading, label, loadingLabel, className = "" }) {
  return (
    <button
      disabled={isLoading}
      type="submit"
      className={`flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-primary/50 shadow-primary/30 disabled:opacity-70 disabled:hover:translate-y-0 ${className}`}
    >
      {isLoading ? (
        <>
          <HiRefresh className="animate-spin" />
          <span>{loadingLabel ?? label}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <FaArrowRight className="text-[18px]" />
        </>
      )}
    </button>
  );
}

export default AuthSubmitButton;
