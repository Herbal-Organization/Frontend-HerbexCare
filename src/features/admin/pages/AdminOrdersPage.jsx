import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaShoppingCart,
} from "react-icons/fa";
import { getAdminAllOrders } from "@api/orders";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const statusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed")
    return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400";
  if (s === "approved")
    return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400";
  if (s === "pending")
    return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400";
  if (s === "rejected" || s === "cancelled")
    return "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400";
  return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
};

function OrderDetailsModal({ isOpen, order, onClose, t }) {
  if (!isOpen || !order) return null;

  const subOrders = Array.isArray(order.subOrders) ? order.subOrders : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
              Order Details
            </p>
            <h2 className="mt-2 truncate text-xl font-black text-slate-900">
              Order #{order.orderId ?? order.id}
            </h2>
            <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-500">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusColor(order.status || order.orderStatus)}`}
              >
                {order.status || order.orderStatus || "Unknown"}
              </span>
              {order.totalCost != null && (
                <span className="font-semibold">
                  Total: ${Number(order.totalCost).toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-700 shrink-0"
          >
            <FaTimes />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">Patient</p>
              <p className="mt-1 text-sm text-slate-700">
                {order.patientName || order.patientUserName || "N/A"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">Date</p>
              <p className="mt-1 text-sm text-slate-700">
                {order.createdAt || order.orderDate
                  ? new Date(
                      order.createdAt || order.orderDate,
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">
                Shipping Address
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {order.shippingAddress}
              </p>
            </div>
          )}

          {subOrders.length > 0 && (
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-600 mb-3">
                Sub-Orders ({subOrders.length})
              </p>
              <div className="space-y-3">
                {subOrders.map((sub, i) => (
                  <div
                    key={sub.subOrderId || i}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {sub.herbalistName ||
                          sub.herbalistUserName ||
                          `Sub-order #${sub.subOrderId || i + 1}`}
                      </p>
                      <span
                        className={`inline-flex mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(sub.status || sub.subOrderStatus)}`}
                      >
                        {sub.status || sub.subOrderStatus || "—"}
                      </span>
                    </div>
                    {sub.totalPrice != null && (
                      <p className="text-sm font-bold text-slate-700">
                        ${Number(sub.totalPrice).toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadOrders = async ({
    nextPage = pageNumber,
    nextSize = pageSize,
  } = {}) => {
    setIsLoading(true);
    setError("");

    try {
      const params = {
        PageNumber: nextPage,
        PageSize: nextSize,
      };
      if (searchValue.trim()) params.SearchValue = searchValue.trim();
      if (statusFilter) params.Status = statusFilter;

      const response = await getAdminAllOrders(params);
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : [];
      setOrders(items);
      setPageNumber(response?.pageNumber ?? nextPage);
      setTotalPages(Math.max(1, response?.totalPages ?? 1));
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to load orders.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders({ nextPage: 1, nextSize: pageSize });
  }, [pageSize, statusFilter]);

  useEffect(() => {
    loadOrders({ nextPage: pageNumber, nextSize: pageSize });
  }, [pageNumber]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <FaShoppingCart className="text-sm" />
              Orders
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminOrders.title", "All Orders")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t(
                "adminOrders.subtitle",
                "View and manage all patient orders across the platform.",
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadOrders({ nextPage: pageNumber, nextSize: pageSize })}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
          >
            <FaSyncAlt className="text-sm" />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Orders list
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Page {pageNumber} of {totalPages}.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-72">
              <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400">
                <FaSearch className="text-sm" />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    loadOrders({ nextPage: 1, nextSize: pageSize });
                }}
                placeholder="Search orders..."
                className="block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 py-3 ps-11 pe-4 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <FaFilter className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageNumber(1);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="text-slate-500">Size</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value) || DEFAULT_PAGE_SIZE);
                  setPageNumber(1);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No orders found.
          </div>
        ) : (
          <div className="pt-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Order ID
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Patient
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Total
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {orders.map((order) => {
                      const id = order.orderId ?? order.id;
                      return (
                        <tr
                          key={id}
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailsOpen(true);
                          }}
                          className="cursor-pointer transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              #{id}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {order.patientName ||
                              order.patientUserName ||
                              "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusColor(order.status || order.orderStatus)}`}
                            >
                              {order.status || order.orderStatus || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {order.totalCost != null
                              ? `$${Number(order.totalCost).toFixed(2)}`
                              : "—"}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(
                              order.createdAt || order.orderDate,
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1 || isLoading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronLeft />
                </button>
                <span className="px-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                  {pageNumber} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPageNumber((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={pageNumber >= totalPages || isLoading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <OrderDetailsModal
        isOpen={isDetailsOpen}
        order={selectedOrder}
        t={t}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
}

export default AdminOrdersPage;
