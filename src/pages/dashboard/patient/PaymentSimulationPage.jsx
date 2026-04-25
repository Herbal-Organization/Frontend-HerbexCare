import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
  FaCreditCard,
  FaExclamationCircle,
} from "react-icons/fa";
import { getOrderById, simulatePayment } from "../../../api/orders";
import { toast } from "react-hot-toast";

const getStatus = (value) => (value || "").toLowerCase();

function PaymentSimulationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        if (!active) {
          return;
        }

        setOrder(data);

        const status = getStatus(data?.status);
        const paymentMethod = getStatus(data?.paymentMethod);
        const isPaid =
          status === "paid" ||
          status === "confirmed" ||
          status === "processing" ||
          status === "completed";

        if (isPaid || status === "cancelled" || status === "canceled") {
          navigate(`/patient/dashboard/orders/${orderId}`, { replace: true });
          return;
        }

        if (paymentMethod !== "wallet" && paymentMethod !== "creditcard") {
          navigate(`/patient/dashboard/orders/${orderId}`, { replace: true });
          return;
        }

        setError("");
        await handleSimulatePayment(false);
      } catch (err) {
        if (!active) {
          return;
        }

        setError(
          err.response?.data?.message ||
            err.response?.data?.title ||
            "Unable to load payment simulation.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    const handleSimulatePayment = async (showToast = true) => {
      setIsSimulating(true);
      try {
        await simulatePayment(orderId);
        if (showToast) {
          toast.success("Payment confirmed successfully");
        }
        navigate(`/patient/dashboard/orders/${orderId}`, { replace: true });
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.title ||
          "Payment simulation failed.";
        setError(message);
        if (showToast) {
          toast.error(message);
        }
      } finally {
        setIsSimulating(false);
      }
    };

    loadOrder();

    return () => {
      active = false;
    };
  }, [navigate, orderId]);

  const handleRetry = async () => {
    setError("");
    setIsSimulating(true);
    try {
      await simulatePayment(orderId);
      toast.success("Payment confirmed successfully");
      navigate(`/patient/dashboard/orders/${orderId}`, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Payment simulation failed.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm">
          <FaSpinner className="animate-spin text-3xl" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-slate-900">
          Preparing payment simulation
        </h1>
        <p className="mt-2 max-w-lg text-sm text-slate-500">
          We are verifying the order and forwarding it through the payment mock.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to={`/patient/dashboard/orders/${orderId}`}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:text-emerald-600"
      >
        <FaArrowLeft /> Back to order
      </Link>

      <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600">
            <FaCreditCard className="text-2xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Payment simulation
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Order #{orderId}
              {order?.paymentMethod ? ` · ${order.paymentMethod}` : ""}
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <div className="flex items-center gap-2">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            The system is simulating an external payment provider call.
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isSimulating}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSimulating ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaCheckCircle />
            )}
            {isSimulating ? "Simulating..." : "Run payment simulation"}
          </button>
          <Link
            to={`/patient/dashboard/orders/${orderId}`}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            View order details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSimulationPage;
