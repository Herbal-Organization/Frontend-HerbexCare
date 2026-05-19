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
} from "react-icons/fa";

const normalizeStatus = (status) => (status || "").trim().toLowerCase();

const getStatusColor = (status) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case "paid":
    case "confirmed":
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "canceled":
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-slate-50 text-slate-700 border-slate-100";
  }
};

const getStatusIcon = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === "completed" || normalized === "paid") return "✓";
  if (normalized === "pending") return "⏳";
  if (normalized === "canceled" || normalized === "cancelled") return "✕";
  if (normalized === "processing") return "⚙";
  return "○";
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

  const getPaymentIcon = (method) => {
    const m = method.toLowerCase();
    if (m.includes("card") || m.includes("credit")) return <FaCreditCard className="text-blue-500" />;
    if (m.includes("wallet")) return <FaWallet className="text-purple-500" />;
    return <FaMoneyBillWave className="text-emerald-600" />;
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-200">
      <div className="absolute top-0 left-0 h-full w-1.5 bg-emerald-500 transform -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />

      <div className="flex flex-col md:flex-row md:items-center p-5 sm:p-6 gap-6">
        {/* Order Identity & Date */}
        <div className="flex-1 min-w-50">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-black text-slate-900">
              Order #{orderId}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(orderId);
              }}
              disabled={isBusy}
              className={`p-2 transition-all rounded-full hover:bg-rose-50 ${
                isFavorite
                  ? "text-rose-500 scale-110"
                  : "text-slate-300 hover:text-rose-400"
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
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <FaCalendarAlt className="text-slate-400" />
            {formattedDate}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Amount
            </span>
            <span className="text-xl font-black text-slate-900">
              {totalPrice.toFixed(2)}{" "}
              <span className="text-sm font-bold text-slate-500">EGP</span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Payment
            </span>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-100">
              {getPaymentIcon(paymentMethod)}
              <span className="text-xs font-bold text-slate-700">
                {paymentMethod}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Status
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ring-4 ring-white ${getStatusColor(
                status,
              )}`}
            >
              <span className="text-sm leading-none">
                {getStatusIcon(status)}
              </span>{" "}
              {status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end md:ml-auto">
          <Link
            to={`/patient/dashboard/orders/${orderId}`}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200 transition-all hover:bg-emerald-600 hover:shadow-emerald-100 hover:-translate-y-0.5 active:translate-y-0"
          >
            <FaChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientOrderCard;
