import React from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaHeart,
  FaRegHeart,
  FaCreditCard,
  FaMoneyBillWave,
  FaChevronRight,
  FaWallet,
  FaBoxOpen,
  FaStore,
} from "react-icons/fa";
import StatusBadge from "./StatusBadge";

const countOrderContents = (order) => {
  const subOrders = Array.isArray(order.subOrders) ? order.subOrders : [];
  if (subOrders.length > 0) {
    const items = subOrders.reduce(
      (sum, so) =>
        sum +
        (so.herbs?.length || 0) +
        (so.recipes?.length || 0) +
        (so.aiRecipes?.length || 0),
      0,
    );
    return { items, herbalists: subOrders.length };
  }
  const items =
    (order.herbs?.length || 0) +
    (order.recipes?.length || 0) +
    (order.aiRecipes?.length || 0);
  return { items, herbalists: items > 0 ? 1 : 0 };
};

const PatientOrderCard = ({ order, isBusy, onToggleFavorite }) => {
  const orderId = order.orderId || order.id;
  const orderDate = new Date(order.orderDate || order.createdAt);
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const totalPrice = order.totalPrice || order.total || 0;
  const status = order.orderStatus || order.status || "Pending";
  const paymentMethod = order.paymentMethod || "Not Specified";
  const isFavorite = !!order.isFavorite;
  const { items: itemCount, herbalists: herbalistCount } =
    countOrderContents(order);

  const getPaymentIcon = (method) => {
    const m = method.toLowerCase();
    if (m.includes("card") || m.includes("credit"))
      return <FaCreditCard className="text-blue-500" />;
    if (m.includes("wallet")) return <FaWallet className="text-purple-500" />;
    return <FaMoneyBillWave className="text-emerald-600" />;
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-700">
      <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-emerald-400 to-emerald-600" />

      <div className="flex flex-col lg:flex-row lg:items-center p-5 sm:p-6 gap-6">
        {/* Order Identity & Date */}
        <div className="lg:flex-1 min-w-50 lg:border-r lg:border-slate-100 dark:lg:border-slate-700 pr-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-black text-slate-900 dark:text-slate-100">
              Order #{orderId}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(orderId);
              }}
              disabled={isBusy}
              className={`p-2 transition-all rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 ${
                isFavorite
                  ? "text-rose-500 scale-110"
                  : "text-slate-300 dark:text-slate-600 hover:text-rose-400"
              }`}
            >
              {isBusy ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
              ) : isFavorite ? (
                <FaHeart className="h-4 w-4" />
              ) : (
                <FaRegHeart className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <FaCalendarAlt className="text-slate-400 dark:text-slate-500" />
            {formattedDate}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <FaBoxOpen className="h-3 w-3" />
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            {herbalistCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                <FaStore className="h-3 w-3" />
                {herbalistCount}{" "}
                {herbalistCount === 1 ? "herbalist" : "herbalists"}
              </span>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center lg:gap-10">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Amount
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-slate-100">
              {totalPrice.toFixed(2)}{" "}
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">EGP</span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Payment
            </span>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-900 px-2 py-1.5 border border-slate-100 dark:border-slate-700 sm:px-3">
              {getPaymentIcon(paymentMethod)}
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 sm:text-xs">
                {paymentMethod}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Status
            </span>
            <StatusBadge status={status} size="sm" className="w-fit" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end lg:ml-auto w-full lg:w-auto border-t border-slate-100 dark:border-slate-700 pt-4 lg:border-0 lg:pt-0">
          <Link
            to={`/patient/dashboard/orders/${orderId}`}
            className="flex h-11 w-full lg:w-11 items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-700 px-4 text-white shadow-lg shadow-slate-200 dark:shadow-slate-900/50 transition-all hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:shadow-emerald-100 dark:hover:shadow-emerald-900/30 hover:-translate-y-0.5 active:translate-y-0 lg:px-0"
          >
            <span className="text-sm font-bold lg:hidden">View Details</span>
            <FaChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientOrderCard;
