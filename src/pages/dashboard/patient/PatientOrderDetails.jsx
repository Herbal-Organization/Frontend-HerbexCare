import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCreditCard,
  FaExclamationCircle,
  FaFlask,
  FaLeaf,
  FaMapMarkerAlt,
  FaReceipt,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";
import { cancelOrder, getOrderById } from "../../../api/orders";
import { toast } from "react-hot-toast";

const normalizeStatus = (status) => (status || "").trim().toLowerCase();

const isPaidStatus = (status) => {
  const normalized = normalizeStatus(status);
  return (
    normalized === "paid" ||
    normalized === "confirmed" ||
    normalized === "processing" ||
    normalized === "completed"
  );
};

const isCanceledStatus = (status) => {
  const normalized = normalizeStatus(status);
  return normalized === "canceled" || normalized === "cancelled";
};

const canContinuePayment = (order) => {
  const status = normalizeStatus(order?.status);
  const paymentMethod = normalizeStatus(order?.paymentMethod);

  return (
    status === "pending" &&
    (paymentMethod === "wallet" || paymentMethod === "creditcard")
  );
};

function PatientOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Unable to load order details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsCanceling(true);
    try {
      await cancelOrder(orderId);
      toast.success("Order canceled successfully");
      await fetchOrderDetails();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to cancel order.",
      );
    } finally {
      setIsCanceling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">
          Loading order details
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          to="/patient/dashboard/orders"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-emerald-600"
        >
          <FaArrowLeft /> Back to orders
        </Link>
        <div className="rounded-[3rem] border border-red-100 bg-red-50 p-16 text-center shadow-sm">
          <FaExclamationCircle className="mx-auto mb-6 text-5xl text-red-400" />
          <h2 className="text-2xl font-bold text-red-800">
            Unable to load order
          </h2>
          <p className="mt-2 font-medium text-red-600">
            {error || "Requested order could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const status = order.status || "Pending";
  const normalizedStatus = normalizeStatus(status);
  const isCanceled = isCanceledStatus(status);
  const isPaid = isPaidStatus(status);
  const orderDate = order.orderDate || order.createdAt;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/patient/dashboard/orders"
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-500 shadow-sm transition-colors hover:text-emerald-600"
      >
        <FaArrowLeft /> Back to orders
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900">
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-3 text-slate-600 shadow-inner">
              <FaReceipt className="text-xl" />
            </div>
            Order #{String(orderId).slice(0, 8)}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
            Placed {new Date(orderDate).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex rounded-full border px-5 py-2 text-xs font-black uppercase tracking-widest shadow-sm ${
              isCanceled
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : isPaid
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : normalizedStatus === "processing"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-extrabold text-slate-900">
              <FaLeaf /> Order Items
            </h2>

            {order.herbs?.length ? (
              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <FaLeaf /> Herbs
                </h3>
                <div className="space-y-3">
                  {order.herbs.map((herb, index) => (
                    <div
                      key={`${herb.herbId || index}`}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {herb.herbName || `Herb #${herb.herbId}`}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">
                          Herbalist #{herb.herbalistId}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 shadow-sm">
                          {herb.quantityPerGram} grams
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {order.recipes?.length ? (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <FaFlask /> Recipes
                </h3>
                <div className="space-y-3">
                  {order.recipes.map((recipe, index) => (
                    <div
                      key={`${recipe.recipeId || index}`}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {recipe.recipeName || `Recipe #${recipe.recipeId}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 shadow-sm">
                          Quantity: {recipe.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {!order.herbs?.length && !order.recipes?.length ? (
              <p className="italic text-slate-500">
                No items are attached to this order.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-extrabold text-slate-900">
              Order Details
            </h2>

            <div className="space-y-6">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <FaMapMarkerAlt /> Shipping Address
                </p>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="whitespace-pre-wrap text-sm font-semibold leading-relaxed text-slate-700">
                    {order.shippingAddress || "No shipping address provided"}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <FaCreditCard /> Payment Method
                </p>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    {order.paymentMethod || "Not selected"}
                  </p>
                </div>
              </div>
            </div>

            {order.totalCost != null ? (
              <div className="mt-8 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <span className="text-sm font-bold uppercase tracking-widest text-emerald-800">
                  Total
                </span>
                <span className="text-xl font-black text-emerald-600">
                  {order.totalCost} EGP
                </span>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            {canContinuePayment(order) ? (
              <Link
                to={`/patient/dashboard/orders/${orderId}/payment`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:-translate-y-0.5"
              >
                <FaCreditCard className="text-emerald-400" /> Continue Payment
              </Link>
            ) : null}

            {!isCanceled && !isPaid ? (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCanceling}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-5 py-4 text-sm font-bold text-rose-600 shadow-sm transition-all hover:bg-rose-50 disabled:opacity-50"
              >
                {isCanceling ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTimesCircle />
                )}
                Cancel Order
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientOrderDetails;
