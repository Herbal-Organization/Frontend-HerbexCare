import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const message =
    location.state?.message ||
    "Your order has been successfully sent to the herbalist.";

  const handleClose = () => {
    navigate("/patient/dashboard/orders", { replace: true });
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm"
      >
        <p className="text-sm font-semibold text-slate-700">{message}</p>
        <button
          type="button"
          onClick={handleClose}
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
