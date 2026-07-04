import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaDownload,
  FaShoppingCart,
  FaSyncAlt,
  FaTimes,
  FaDollarSign,
  FaCalendarCheck,
  FaBan,
} from "react-icons/fa";
import {
  getAdminAllOrders,
  getPendingUnapprovedOrders,
  cancelOrder,
} from "@api/orders";
import OrderStatsCard from "@features/admin/components/orders/OrderStatsCard";
import OrderDetailsModal from "@features/admin/components/orders/OrderDetailsModal";
import OrderFilters from "@features/admin/components/orders/OrderFilters";
import OrderBulkActions from "@features/admin/components/orders/OrderBulkActions";
import AdminPagination from "@features/admin/components/users/AdminPagination";

const DEFAULT_PAGE_SIZE = 10;

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

function exportToCSV(orders, filename = "orders") {
  if (!orders.length) {
    toast.error("No orders to export.");
    return;
  }

  const headers = ["Order ID", "Patient", "Status", "Total Cost", "Date", "Sub-Orders"];
  const rows = orders.map((o) => [
    o.orderId ?? o.id,
    o.patientName || o.patientUserName || "",
    o.status || o.orderStatus || "",
    o.totalCost != null ? Number(o.totalCost).toFixed(2) : "",
    o.createdAt || o.orderDate
      ? new Date(o.createdAt || o.orderDate).toLocaleDateString()
      : "",
    Array.isArray(o.subOrders) ? o.subOrders.length : 0,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success("CSV exported successfully.");
}

function AdminOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const loadOrders = async (page = 1, size = pageSize) => {
    setIsLoading(true);
    setError("");

    try {
      const params = { PageNumber: page, PageSize: size };
      if (searchValue.trim()) params.SearchValue = searchValue.trim();
      if (statusFilter) params.Status = statusFilter;
      if (dateFrom) params.DateFrom = dateFrom;
      if (dateTo) params.DateTo = dateTo;

      const response = await getAdminAllOrders(params);
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : [];
      setOrders(items);
      setTotalPages(Math.max(1, response?.totalPages ?? 1));
      setTotalItems(response?.totalCount ?? items.length);
      setCurrentPage(response?.pageNumber ?? page);
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

  const loadPendingOrders = async () => {
    setPendingLoading(true);
    try {
      const response = await getPendingUnapprovedOrders({
        PageNumber: 1,
        PageSize: 50,
      });
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : [];
      setPendingOrders(items);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to load pending orders.";
      toast.error(message);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1, pageSize);
  }, []);

  useEffect(() => {
    if (activeTab === "pending") {
      loadPendingOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    setSelectedIds([]);
  }, [statusFilter, searchValue, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const allItems = activeTab === "all" ? orders : pendingOrders;
    const total = allItems.length;
    const pending = allItems.filter(
      (o) => (o.status || o.orderStatus || "").toLowerCase() === "pending",
    ).length;
    const completed = allItems.filter(
      (o) => (o.status || o.orderStatus || "").toLowerCase() === "completed",
    ).length;
    const revenue = allItems
      .filter(
        (o) => (o.status || o.orderStatus || "").toLowerCase() === "completed",
      )
      .reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0);
    return { total, pending, completed, revenue };
  }, [orders, pendingOrders, activeTab]);

  const formatDate = (dateString) => {
    if (!dateString) return "\u2014";
    return new Date(dateString).toLocaleDateString();
  };

  const isAllSelected =
    orders.length > 0 && selectedIds.length === orders.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < orders.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => String(o.orderId ?? o.id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    );
  };

  const handleBulkReject = async () => {
    if (!selectedIds.length) return;
    if (
      !window.confirm(
        `Cancel ${selectedIds.length} order(s)? This action cannot be undone.`,
      )
    )
      return;

    setIsProcessing(true);
    try {
      await Promise.allSettled(selectedIds.map((id) => cancelOrder(id)));
      toast.success(`${selectedIds.length} order(s) cancelled.`);
      setSelectedIds([]);
      await loadOrders(currentPage);
    } catch {
      toast.error("Failed to cancel some orders.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportAll = () => {
    exportToCSV(orders, "admin_orders");
  };

  const handleExportSelected = () => {
    const selected = orders.filter((o) =>
      selectedIds.includes(String(o.orderId ?? o.id)),
    );
    exportToCSV(selected, "admin_orders_selected");
  };

  const handleExportPending = () => {
    exportToCSV(pendingOrders, "admin_orders_pending");
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <FaShoppingCart className="text-sm" />
              {t("adminSidebar.orders", "Orders")}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminOrders.title", "Manage Orders")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t(
                "adminOrders.subtitle",
                "View, filter, and manage all patient orders across the platform.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportAll}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <FaDownload className="text-sm" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => loadOrders(currentPage)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <FaSyncAlt className="text-sm" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OrderStatsCard
          label="Total Orders"
          value={stats.total}
          hint="Orders in current view."
          icon={<FaShoppingCart className="text-2xl" />}
          tone="emerald"
        />
        <OrderStatsCard
          label="Pending"
          value={stats.pending}
          hint="Awaiting processing."
          icon={<FaClock className="text-2xl" />}
          tone="amber"
        />
        <OrderStatsCard
          label="Completed"
          value={stats.completed}
          hint="Successfully delivered."
          icon={<FaCalendarCheck className="text-2xl" />}
          tone="blue"
        />
        <OrderStatsCard
          label="Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          hint="From completed orders."
          icon={<FaDollarSign className="text-2xl" />}
          tone="emerald"
        />
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-sm w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all ${
            activeTab === "all"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FaShoppingCart className="text-[10px]" />
          All Orders
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all ${
            activeTab === "pending"
              ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FaClock className="text-[10px]" />
          Pending Approval
          {pendingOrders.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
              {pendingOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Bulk Actions */}
      {activeTab === "all" && (
        <OrderBulkActions
          selectedCount={selectedIds.length}
          onApprove={() => toast.info("Bulk approve coming soon.")}
          onReject={handleBulkReject}
          onDelete={() => toast.info("Bulk delete coming soon.")}
          onExportSelected={handleExportSelected}
          onClearSelection={() => setSelectedIds([])}
          isProcessing={isProcessing}
        />
      )}

      {/* Pending Tab */}
      {activeTab === "pending" ? (
        <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Pending Unapproved Orders
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Orders waiting for admin review.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportPending}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FaDownload className="text-sm" />
                Export
              </button>
              <button
                type="button"
                onClick={loadPendingOrders}
                disabled={pendingLoading}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <FaSyncAlt className="text-sm" />
                Refresh
              </button>
            </div>
          </div>

          {pendingLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <FaCalendarCheck className="text-2xl" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                All caught up!
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                No orders are waiting for approval.
              </p>
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
                      {pendingOrders.map((order) => {
                        const id = order.orderId ?? order.id;
                        return (
                          <tr
                            key={id}
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailsOpen(true);
                            }}
                            className="cursor-pointer transition-colors hover:bg-amber-50/40 dark:hover:bg-amber-900/20"
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                #{id}
                              </p>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                              {order.patientName ||
                                order.patientUserName ||
                                "\u2014"}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusColor(order.status || order.orderStatus)}`}
                              >
                                {order.status || order.orderStatus || "\u2014"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {order.totalCost != null
                                ? `$${Number(order.totalCost).toFixed(2)}`
                                : "\u2014"}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                              {formatDate(order.createdAt || order.orderDate)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                Showing {pendingOrders.length} order
                {pendingOrders.length !== 1 ? "s" : ""} pending approval.
              </p>
            </div>
          )}
        </section>
      ) : (
        /* All Orders Tab */
        <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Orders List
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {totalItems} orders total. Page {currentPage} of {totalPages}.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="text-slate-500">Size</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value) || DEFAULT_PAGE_SIZE);
                  setCurrentPage(1);
                  loadOrders(1, Number(e.target.value) || DEFAULT_PAGE_SIZE);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                {[10, 20, 50].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <OrderFilters
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onSearchEnter={() => {
                setCurrentPage(1);
                loadOrders(1);
              }}
              statusFilter={statusFilter}
              onStatusChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
                loadOrders(1);
              }}
              dateFrom={dateFrom}
              onDateFromChange={(val) => {
                setDateFrom(val);
                setCurrentPage(1);
                loadOrders(1);
              }}
              dateTo={dateTo}
              onDateToChange={(val) => {
                setDateTo(val);
                setCurrentPage(1);
                loadOrders(1);
              }}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <FaBan className="text-2xl" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                No orders found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {searchValue || statusFilter || dateFrom || dateTo
                  ? "Try adjusting your filters."
                  : "No orders have been placed yet."}
              </p>
            </div>
          ) : (
            <div className="pt-5">
              <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = isIndeterminate;
                            }}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </th>
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
                        <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                      {orders.map((order) => {
                        const id = String(order.orderId ?? order.id);
                        const isSelected = selectedIds.includes(id);
                        return (
                          <tr
                            key={id}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-emerald-50/60 dark:bg-emerald-900/20"
                                : "hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20"
                            }`}
                          >
                            <td className="px-5 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(id)}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                            </td>
                            <td
                              className="px-5 py-4"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                #{id}
                              </p>
                            </td>
                            <td
                              className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsOpen(true);
                              }}
                            >
                              {order.patientName ||
                                order.patientUserName ||
                                "\u2014"}
                            </td>
                            <td
                              className="px-5 py-4"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusColor(order.status || order.orderStatus)}`}
                              >
                                {order.status || order.orderStatus || "\u2014"}
                              </span>
                            </td>
                            <td
                              className="px-5 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsOpen(true);
                              }}
                            >
                              {order.totalCost != null
                                ? `$${Number(order.totalCost).toFixed(2)}`
                                : "\u2014"}
                            </td>
                            <td
                              className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsOpen(true);
                              }}
                            >
                              {formatDate(order.createdAt || order.orderDate)}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info("Approve coming soon.");
                                  }}
                                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
                                >
                                  <FaCheck className="text-[10px]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (
                                      !window.confirm(
                                        `Cancel order #${id}?`,
                                      )
                                    )
                                      return;
                                    try {
                                      await cancelOrder(id);
                                      toast.success(`Order #${id} cancelled.`);
                                      await loadOrders(currentPage);
                                    } catch {
                                      toast.error("Failed to cancel order.");
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50"
                                >
                                  <FaTimes className="text-[10px]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5">
                <AdminPagination
                  totalItems={totalItems}
                  itemsPerPage={pageSize}
                  currentPage={currentPage}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    loadOrders(page);
                  }}
                />
              </div>
            </div>
          )}
        </section>
      )}

      <OrderDetailsModal
        isOpen={isDetailsOpen}
        order={selectedOrder}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
}

export default AdminOrdersPage;
