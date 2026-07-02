import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaCreditCard,
  FaExclamationCircle,
  FaHome,
  FaLeaf,
  FaMapMarkerAlt,
  FaSpinner,
  FaTimes,
  FaTruck,
  FaUser,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import useHerbalistOrder from "../hooks/useHerbalistOrder";
import HerbOrderItem from "../components/HerbOrderItem";
import RecipeOrderItem from "../components/RecipeOrderItem";
import StatusBadge from "@components/common/StatusBadge";
import { SUB_ORDER_STATUS } from "../constants/subOrderStatus";

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} EGP`;

function SubOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { order, isLoading, isUpdating, error, updateStatus } = useHerbalistOrder(id);
  const herbItems = Array.isArray(order?.items)
    ? order.items.filter((item) => item.herbId)
    : [];
  const recipeItems = Array.isArray(order?.items)
    ? order.items.filter((item) => item.recipeId)
    : [];

  const handleStatusUpdate = async (status, successMessage) => {
    try {
      await updateStatus(status);
      toast.success(successMessage);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to update order status.",
      );
    }
  };

  const status = order?.status || SUB_ORDER_STATUS.PENDING;

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
        <FaSpinner className="animate-spin text-3xl text-emerald-600" />
        <p className="mt-4 text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Loading order
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 p-10 text-center shadow-sm">
        <FaExclamationCircle className="mx-auto text-4xl text-rose-500" />
        <p className="mt-4 font-semibold text-rose-700 dark:text-rose-400">
          {error ? "Failed to load order." : "Order not found."}
        </p>
        <button
          onClick={() => navigate("/herbalist/dashboard/orders")}
          className="mt-4 text-sm font-bold text-emerald-600 underline"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/herbalist/dashboard/orders")}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 dark:text-slate-400 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-sm"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-3xl">
            Order #{order.id}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <FaCalendarAlt />
            {new Date(order.date).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4 text-lg font-extrabold text-slate-900 dark:text-slate-100">
              <FaLeaf /> Ordered Herbs
            </h2>
            {herbItems.length > 0 ? (
              <div className="space-y-3">
                {herbItems.map((item, index) => (
                  <HerbOrderItem key={index} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-6 text-center">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  No herbs in the order.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4 text-lg font-extrabold text-slate-900 dark:text-slate-100">
              <FaLeaf /> Ordered Recipes
            </h2>
            {recipeItems.length > 0 ? (
              <div className="space-y-3">
                {recipeItems.map((item, index) => (
                  <RecipeOrderItem key={index} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-6 text-center">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  No recipes in the order.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4 text-lg font-extrabold text-slate-900 dark:text-slate-100">
              <FaUser /> Customer
            </h2>
            <p className="font-bold text-slate-900 dark:text-slate-100">{order.customer.name}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {order.customer.contact}
            </p>
            <div className="mt-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <FaMapMarkerAlt /> Shipping
              </p>
              <p className="whitespace-pre-wrap text-sm font-semibold text-slate-700 dark:text-slate-300">
                {order.customer.address}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4 text-lg font-extrabold text-slate-900 dark:text-slate-100">
              <FaCreditCard /> Payment
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Status</span>
              <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1 text-xs font-black text-slate-700 dark:text-slate-300">
                {order.paymentStatus}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 p-4">
              <span className="text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                Total
              </span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                {formatCurrency(order.subTotal)}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {status === SUB_ORDER_STATUS.PENDING && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() =>
                      handleStatusUpdate(
                        SUB_ORDER_STATUS.PREPARING,
                        "Order accepted and moved to preparing.",
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {isUpdating ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() =>
                      handleStatusUpdate(
                        SUB_ORDER_STATUS.CANCELLED,
                        "Order declined.",
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
                  >
                    <FaTimes />
                    Decline
                  </button>
                </div>
              )}

              {status === SUB_ORDER_STATUS.PREPARING && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() =>
                    handleStatusUpdate(
                      SUB_ORDER_STATUS.SHIPPED,
                      "Order marked as shipped.",
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
                >
                  {isUpdating ? <FaSpinner className="animate-spin" /> : <FaTruck />}
                  Mark as Shipped
                </button>
              )}

              {status === SUB_ORDER_STATUS.SHIPPED && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() =>
                    handleStatusUpdate(
                      SUB_ORDER_STATUS.DELIVERED,
                      "Order marked as delivered.",
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isUpdating ? <FaSpinner className="animate-spin" /> : <FaHome />}
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubOrderDetails;
