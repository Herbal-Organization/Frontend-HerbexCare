import React from "react";

// Colors keyed to the backend OrderStatus + SubOrderStatus enums.
const statusClasses = {
  // Shared / early lifecycle
  Pending:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  AwaitingPayment:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  Processing:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  Preparing:
    "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  // Fulfilment
  Shipped:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800",
  PartiallyShipped:
    "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
  Delivered:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  PartiallyDelivered:
    "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  // Cancellation
  PartiallyCancelled:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  Cancelled:
    "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
};

// "AwaitingPayment" -> "Awaiting Payment", "PartiallyShipped" -> "Partially Shipped"
const formatStatusLabel = (status) =>
  (status || "").replace(/([a-z])([A-Z])/g, "$1 $2");

const StatusBadge = ({ status, size = "sm", className = "" }) => {
  const baseClasses =
    "inline-flex rounded-full border font-bold transition-colors";
  const sizeClasses = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-3 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  // Tolerate "Canceled" (single-l) and other casings by matching the known keys.
  const key =
    Object.keys(statusClasses).find(
      (k) => k.toLowerCase() === (status || "").trim().toLowerCase(),
    ) || "Pending";
  const statusClass = statusClasses[key];
  const sizeClass = sizeClasses[size] || sizeClasses.sm;

  return (
    <span
      className={`${baseClasses} ${statusClass} ${sizeClass} ${className}`}
      role="status"
      aria-label={`Order status: ${status}`}
    >
      {formatStatusLabel(status) || "Pending"}
    </span>
  );
};

export default StatusBadge;
