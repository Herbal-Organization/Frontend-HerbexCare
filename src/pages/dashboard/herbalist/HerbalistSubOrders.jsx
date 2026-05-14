import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaBoxOpen,
  FaCalendarAlt,
  FaChevronRight,
  FaExclamationCircle,
  FaLeaf,
  FaRedo,
  FaSpinner,
  FaUser,
} from "react-icons/fa";
import useSubOrders from "../../../hooks/useSubOrders";
import { getSubOrderById } from "../../../api/subOrders";
import {
  getCustomerContact,
  getCustomerName,
  getItemName,
  getItemQuantityLabel,
  getItemSubtotal,
  getOrderDate,
  getOrderId,
  getOrderItems,
  getOrderTotal,
  getPaymentStatus,
  normalizeStatusLabel,
  ORDER_STATUSES,
} from "../../../utils/orderWorkflow";

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} EGP`;

const statusClasses = {
  Pending:
    "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100",
  Confirmed:
    "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100",
  Preparing:
    "border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100",
  Ready:
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100",
  Delivered:
    "border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200",
  Cancelled:
    "border-eose-200 bg-rose-50 text-rose-700 hover:border-eose-300 hover:bg-rose-100",
};

const statusBadgeClasses = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Confirmed: "bg-sky-100 text-sky-800 border-sky-200",
  Preparing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Delivered: "bg-slate-100 text-slate-700 border-slate-200",
  Cancelled: "bg-rose-100 text-rose-800 border-eose-200",
};

function HerbalistSubOrders() {
  const { data, isLoading, error, refresh, setStatus } = useSubOrders();
  const [hydratedOrders, setHydratedOrders] = useState([]);
  const [isHydrating, setIsHydrating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateOrders = async () => {
      if (!data.length) {
        setHydratedOrders([]);
        return;
      }

      setIsHydrating(true);
      const detailedOrders = await Promise.all(
        data.map(async (order) => {
          const id = getOrderId(order);
          if (!id) return order;

          try {
            const details = await getSubOrderById(id);
            return {
              ...order,
              ...(details || {}),
              order: {
                ...(order.order || {}),
                ...(details?.order || {}),
              },
              parentOrder: {
                ...(order.parentOrder || {}),
                ...(details?.parentOrder || {}),
              },
            };
          } catch (err) {
            console.error("Failed to hydrate suborder details:", {
              id,
              status: err.response?.status,
              data: err.response?.data,
              message: err.message,
            });
            return order;
          }
        }),
      );

      if (isMounted) {
        setHydratedOrders(detailedOrders);
        setIsHydrating(false);
      }
    };

    hydrateOrders();

    return () => {
      isMounted = false;
    };
  }, [data]);

  const visibleOrders = useMemo(
    () => (hydratedOrders.length ? hydratedOrders : data),
    [data, hydratedOrders],
  );

  const handleStatusChange = async (order, nextStatus) => {
    const id = getOrderId(order);
    if (!id) {
      toast.error("Cannot update this order because its id is missing.");
      return;
    }

    try {
      await setStatus(id, nextStatus);
      toast.success(`Order #${id} moved to ${nextStatus}.`);
    } catch (err) {
      console.error("Failed to update suborder status:", {
        id,
        nextStatus,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to update order status.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Orders / Preparation Tasks
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Manage customer herb orders from intake through delivery.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || isHydrating ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaRedo />
          )}
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-eose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700 shadow-sm animate-pulse">
          <FaExclamationCircle className="me-2 inline" />
          {error}
        </div>
      ) : null}

      {isLoading && !visibleOrders.length ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-lg">
          <FaSpinner className="text-3xl text-emerald-600 animate-spin" />
          <p className="mt-4 text-sm font-bold uppercase tracking-widest text-slate-400">
            Loading orders
          </p>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 text-center shadow-sm">
          <FaBoxOpen className="text-5xl text-slate-300" />
          <h3 className="mt-4 text-xl font-extrabold text-slate-800">
            No orders yet
          </h3>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            New customer orders assigned to your inventory will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          {isHydrating ? (
            <div className="flex items-center gap-2 border-b border-slate-100 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-700">
              <FaSpinner className="animate-spin" />
              Loading order details...
            </div>
          ) : null}

          {/* Desktop Table Header */}
          <div className="hidden border-b border-slate-100 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.1fr_1fr_0.8fr_0.8fr_0.9fr_0.9fr_120px]">
            <span className="hidden lg:block">Order</span>
            <span className="hidden lg:block">Customer</span>
            <span className="hidden md:block">Total</span>
            <span className="hidden lg:block">Payment</span>
            <span className="block">Status</span>
            <span className="hidden md:block">Date</span>
            <span className="hidden lg:block">Details</span>
          </div>

          <div className="divide-y divide-slate-100">
            {visibleOrders.map((order, index) => {
              const id = getOrderId(order) || index + 1;
              const status = normalizeStatusLabel(
                order.preparationStatus || order.status,
              );
              const items = getOrderItems(order);
              const date = getOrderDate(order);
              const calculatedTotal = items.reduce(
                (sum, item) => sum + getItemSubtotal(item),
                0,
              );

              return (
                <div
                  key={`${id}-${index}`}
                  className="group transition-all duration-200 hover:bg-slate-50"
                >
                  {/* Mobile Card View */}
                  <div className="p-4 sm:hidden">
                    {/* Header: Order # + Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-extrabold text-slate-900 text-lg">
                          Order #{id}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {date
                            ? new Date(date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "Date not available"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                          statusBadgeClasses[status] ||
                          statusBadgeClasses.Pending
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Patient Info - Prominent */}
                    <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Patient
                      </p>
                      <p className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <FaUser className="text-emerald-600" />
                        {getCustomerName(order)}
                      </p>
                      {getCustomerContact(order) && (
                        <p className="mt-1 text-sm text-slate-600">
                          {getCustomerContact(order)}
                        </p>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-3">
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

                    {/* Total & Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          Total
                        </p>
                        <p className="text-lg font-black text-emerald-700">
                          {formatCurrency(
                            getOrderTotal(order) || calculatedTotal,
                          )}
                        </p>
                      </div>
                      <Link
                        to={`/herbalist/dashboard/orders/${id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
                      >
                        Details <FaChevronRight />
                      </Link>
                    </div>
                  </div>

                  {/* Desktop Grid View */}
                  <div className="hidden px-5 py-4 lg:grid lg:grid-cols-[1.1fr_1fr_0.8fr_0.8fr_0.9fr_0.9fr_120px] lg:items-center lg:gap-4">
                    <div>
                      <p className="font-extrabold text-slate-900">
                        Order #{id}
                      </p>
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
                      {formatCurrency(getOrderTotal(order) || calculatedTotal)}
                    </p>

                    <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                      {getPaymentStatus(order)}
                    </span>

                    <select
                      value={
                        ORDER_STATUSES.includes(status) ? status : "Pending"
                      }
                      onChange={(event) =>
                        handleStatusChange(order, event.target.value)
                      }
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-black outline-none transition-all duration-200 focus:ring-4 focus:ring-emerald-500/20 ${
                        statusClasses[status] || statusClasses.Pending
                      }`}
                      disabled={isLoading}
                    >
                      {ORDER_STATUSES.map((option) => (
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
                      <p className="font-extrabold text-slate-900">
                        Order #{id}
                      </p>
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
                        {formatCurrency(
                          getOrderTotal(order) || calculatedTotal,
                        )}
                      </p>
                    </div>

                    <div className="col-span-2 md:col-span-1 flex items-center justify-between">
                      <select
                        value={
                          ORDER_STATUSES.includes(status) ? status : "Pending"
                        }
                        onChange={(event) =>
                          handleStatusChange(order, event.target.value)
                        }
                        className={`w-full rounded-xl border px-3 py-2 text-xs font-black outline-none transition-all duration-200 focus:ring-4 focus:ring-emerald-500/20 ${
                          statusClasses[status] || statusClasses.Pending
                        }`}
                        disabled={isLoading}
                      >
                        {ORDER_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <Link
                        to={`/herbalist/dashboard/orders/${id}`}
                        className="ms-2 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
                      >
                        <FaChevronRight />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default HerbalistSubOrders;
