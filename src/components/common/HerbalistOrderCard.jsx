import React from "react";
import { Link } from "react-router-dom";
import {
  FaBox,
  FaCheck,
  FaChevronRight,
  FaHome,
  FaSpinner,
  FaTimes,
  FaTruck,
  FaUser,
} from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import { SUB_ORDER_STATUS } from "@features/herbalist/constants/subOrderStatus";

const HerbalistOrderCard = ({
  order,
  onApprove,
  onReject,
  onUpdateStatus,
  isUpdating = false,
}) => {
  const status = order.status || SUB_ORDER_STATUS.PENDING;
  const isPending = status === SUB_ORDER_STATUS.PENDING;
  const isPreparing = status === SUB_ORDER_STATUS.PREPARING;
  const isShipped = status === SUB_ORDER_STATUS.SHIPPED;
  const canAcceptOrDecline = isPending && (onApprove || onReject);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <FaBox />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Order #{order.id}
            </p>
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <FaUser />
              {order.customer.name}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total</p>
          <p className="font-bold text-slate-800 dark:text-slate-200">{order.subTotal} EGP</p>
        </div>
        <Link
          to={`/herbalist/dashboard/orders/${order.id}`}
          className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
        >
          Details
          <FaChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {canAcceptOrDecline && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onApprove?.(order.id)}
            disabled={isUpdating}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? (
              <FaSpinner className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FaCheck className="h-3.5 w-3.5" />
            )}
            Accept &amp; Prepare
          </button>
          <button
            type="button"
            onClick={() => onReject?.(order.id)}
            disabled={isUpdating}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-100 dark:hover:bg-rose-950/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaTimes className="h-3.5 w-3.5" />
            Decline
          </button>
        </div>
      )}

      {isPreparing && onUpdateStatus && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, SUB_ORDER_STATUS.SHIPPED)}
            disabled={isUpdating}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-sky-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? (
              <FaSpinner className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FaTruck className="h-3.5 w-3.5" />
            )}
            Mark as Shipped
          </button>
        </div>
      )}

      {isShipped && onUpdateStatus && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, SUB_ORDER_STATUS.DELIVERED)}
            disabled={isUpdating}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? (
              <FaSpinner className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FaHome className="h-3.5 w-3.5" />
            )}
            Mark as Delivered
          </button>
        </div>
      )}
    </div>
  );
};

export default HerbalistOrderCard;
