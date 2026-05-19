import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaBrain,
  FaCheck,
  FaCreditCard,
  FaExclamationCircle,
  FaFlask,
  FaLeaf,
  FaMapMarkerAlt,
  FaReceipt,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";
import { cancelOrder, getOrderById } from "@api/orders";
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
  const location = useLocation();
  const confirmationMessage = location.state?.message;
  const showConfirmation = location.state?.showConfirmation;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const data = await getOrderById(orderId);
      console.log("Order data received:", data);
      console.log("Herbs:", data.herbs);
      console.log("Recipes:", data.recipes);
      console.log("SubOrders:", data.subOrders);
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
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
      navigate("/patient/dashboard/orders");
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

      {showConfirmation && (
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <FaCheck className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900">
                Order Successfully Sent
              </h3>
              <p className="mt-2 text-sm font-medium text-emerald-700">
                {confirmationMessage ||
                  "Your order has been successfully sent to the herbalist for preparation."}
              </p>
              <p className="mt-3 text-xs font-semibold text-emerald-600">
                You can track the status of your order below and will be
                notified when it's ready.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              ID: {orderId}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Order Review
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
            Placed on{" "}
            {new Date(orderDate).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date(orderDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Action buttons could go here (e.g., Download Invoice, Reorder) */}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-extrabold text-slate-900">
              <FaLeaf /> Order Items
            </h2>

            {order.subOrders?.length ? (
              <div className="space-y-8">
                {order.subOrders.map((subOrder, index) => (
                  <div key={subOrder.subOrderId || index} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-bold text-emerald-800">
                        From: {subOrder.herbalistName || "Herbalist"}
                      </h3>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Status: {subOrder.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Herbs in this suborder */}
                      {subOrder.herbs?.map((herb, hIdx) => (
                        <div
                          key={`herb-${herb.herbId}-${hIdx}`}
                          className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100"
                        >
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-2">
                              <FaLeaf className="text-emerald-500 text-sm" />
                              {herb.herbName}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                              {herb.unitPricePerKilo} EGP/kg ×{" "}
                              {herb.quantityPerGram}g
                            </p>
                          </div>
                          <p className="font-bold text-slate-900">
                            {herb.subTotal} EGP
                          </p>
                        </div>
                      ))}

                      {/* Recipes in this suborder */}
                      {subOrder.recipes?.map((recipe, rIdx) => (
                        <div
                          key={`recipe-${recipe.recipeId}-${rIdx}`}
                          className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100"
                        >
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-2">
                              <FaFlask className="text-teal-500 text-sm" />
                              {recipe.recipeName}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                              {recipe.unitPricePerOne} EGP ×{" "}
                              {recipe.quantityPerOne}
                            </p>
                          </div>
                          <p className="font-bold text-slate-900">
                            {recipe.subTotal} EGP
                          </p>
                        </div>
                      ))}

                      {/* AI Recipes in this suborder */}
                      {subOrder.aiRecipes?.map((ai, aIdx) => (
                        <div
                          key={`ai-${ai.aiRecipeId}-${aIdx}`}
                          className="flex items-center justify-between rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100"
                        >
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-2">
                              <FaBrain className="text-indigo-500 text-sm" />
                              {ai.recipeName}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                              {ai.unitPrice} EGP × {ai.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-slate-900">
                            {ai.subTotal} EGP
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <FaLeaf className="mb-4 text-4xl opacity-20" />
                <p>No itemized details available for this order.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-extrabold text-slate-900">
              <FaReceipt /> Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-500">
                  Items Total
                </span>
                <span className="font-bold text-slate-900">
                  {order.itemsTotal || 0} EGP
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-500">
                  Delivery Fee
                </span>
                <span className="font-bold text-slate-900">
                  {order.deliveryFee || 0} EGP
                </span>
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between">
                <span className="text-lg font-extrabold text-slate-900">
                  Total
                </span>
                <span className="text-lg font-extrabold text-emerald-600">
                  {order.totalPrice || order.totalCost || 0} EGP
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-extrabold text-slate-900">
              <FaMapMarkerAlt /> Shipping & Payment
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block font-bold uppercase tracking-widest text-slate-400 text-[10px] mb-1">
                  Address
                </span>
                <p className="font-medium text-slate-700">
                  {order.shippingAddress || "N/A"}
                </p>
              </div>
              <div>
                <span className="block font-bold uppercase tracking-widest text-slate-400 text-[10px] mb-1">
                  Payment Method
                </span>
                <p className="font-medium text-slate-700 capitalize">
                  {order.paymentMethod || "N/A"}
                </p>
              </div>
              <div>
                <span className="block font-bold uppercase tracking-widest text-slate-400 text-[10px] mb-1">
                  Payment Status
                </span>
                <p
                  className={`font-bold ${order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {order.paymentStatus || "Pending"}
                </p>
              </div>
            </div>
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
