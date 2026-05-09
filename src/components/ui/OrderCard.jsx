import React from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaLeaf, FaUser, FaChevronRight } from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import {
  getCustomerName,
  getCustomerContact,
  getItemName,
  getItemQuantityLabel,
  getItemSubtotal,
  getOrderDate,
  getOrderItems,
  getOrderTotal,
} from "../../utils/orderWorkflow";

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} EGP`;

const OrderCard = ({
  order,
  index,
  onStatusChange,
  statusOptions = [],
  isLoading = false,
  compact = false,
}) => {
  const id = order?.subOrderId || order?.id || order?.orderId || index + 1;
  const status = order?.preparationStatus || order?.status || "Pending";
  const items = getOrderItems(order);
  const date = getOrderDate(order);
  const calculatedTotal = items.reduce(
    (sum, item) => sum + getItemSubtotal(item),
    0,
  );
  const total = getOrderTotal(order) || calculatedTotal;

  if (compact) {
    return (
      <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="font-extrabold text-slate-900 text-lg">Order #{id}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {date
                ? new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Not available"}
            </p>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <FaUser className="text-slate-400" />
            {getCustomerName(order)}
          </div>

          <div className="space-y-1">
            {items.slice(0, 2).map((item, itemIndex) => (
              <p
                key={`${id}-item-${itemIndex}`}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600"
              >
                <FaLeaf className="text-emerald-600" />
                {getItemName(item)} · {getItemQuantityLabel(item)}
              </p>
            ))}
            {items.length > 2 ? (
              <p className="text-xs font-semibold text-slate-400">
                +{items.length - 2} more items
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-sm font-black text-slate-900">
              {formatCurrency(total)}
            </p>
            <Link
              to={`/herbalist/dashboard/orders/${id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
            >
              Details <FaChevronRight />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group transition-all duration-200 hover:bg-slate-50">
      <div className="hidden px-5 py-4 lg:grid lg:grid-cols-[1.1fr_1fr_0.8fr_0.8fr_0.9fr_0.9fr_120px] lg:items-center lg:gap-4">
        <div>
          <p className="font-extrabold text-slate-900">Order #{id}</p>
          <div className="mt-2 space-y-1">
            {items.slice(0, 3).map((item, itemIndex) => (
              <p
                key={`${id}-item-${itemIndex}`}
                className="flex items-center gap-2 text-xs font-semibold text-slate-500"
              >
                <FaLeaf className="text-emerald-600" />
                {getItemName(item)} · {getItemQuantityLabel(item)}
              </p>
            ))}
            {items.length > 3 ? (
              <p className="text-xs font-semibold text-slate-400">
                +{items.length - 3} more items
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <FaUser className="text-slate-400" />
            {getCustomerName(order)}
          </p>
          {getCustomerContact(order) ? (
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {getCustomerContact(order)}
            </p>
          ) : null}
        </div>

        <p className="text-sm font-black text-slate-900">
          {formatCurrency(total)}
        </p>

        <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
          {order?.paymentStatus || "Pending"}
        </span>

        <select
          value={statusOptions.includes(status) ? status : "Pending"}
          onChange={(event) => onStatusChange?.(order, event.target.value)}
          className="w-full rounded-xl border px-3 py-2 text-xs font-black outline-none transition-all duration-200 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50"
          disabled={isLoading}
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <FaCalendarAlt className="text-slate-400" />
          {date
            ? new Date(date).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Not available"}
        </p>

        <Link
          to={`/herbalist/dashboard/orders/${id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
        >
          Open <FaChevronRight />
        </Link>
      </div>

      {/* Tablet Grid View */}
      <div className="hidden px-5 py-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:hidden gap-4">
        <div className="col-span-2 md:col-span-1">
          <p className="font-extrabold text-slate-900">Order #{id}</p>
          <div className="mt-2 space-y-1">
            {items.slice(0, 2).map((item, itemIndex) => (
              <p
                key={`${id}-item-${itemIndex}`}
                className="flex items-center gap-2 text-xs font-semibold text-slate-500"
              >
                <FaLeaf className="text-emerald-600" />
                {getItemName(item)} · {getItemQuantityLabel(item)}
              </p>
            ))}
            {items.length > 2 ? (
              <p className="text-xs font-semibold text-slate-400">
                +{items.length - 2} more
              </p>
            ) : null}
          </div>
        </div>

        <div className="md:col-span-1">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <FaUser className="text-slate-400" />
            {getCustomerName(order)}
          </p>
          <p className="mt-1 text-sm font-black text-slate-900">
            {formatCurrency(total)}
          </p>
        </div>

        <div className="col-span-2 md:col-span-1 flex items-center justify-between">
          <select
            value={statusOptions.includes(status) ? status : "Pending"}
            onChange={(event) => onStatusChange?.(order, event.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-xs font-black outline-none transition-all duration-200 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50"
            disabled={isLoading}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Link
            to={`/herbalist/dashboard/orders/${id}`}
            className="ml-2 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
          >
            <FaChevronRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
