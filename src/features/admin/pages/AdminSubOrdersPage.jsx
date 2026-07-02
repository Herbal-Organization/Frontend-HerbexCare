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
  FaTruck,
} from "react-icons/fa";
import { getAdminSubOrders, getAdminSubOrderStatistics } from "@api/subOrders";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Completed", label: "Completed" },
];

const statusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed" || s === "approved")
    return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400";
  if (s === "pending")
    return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400";
  if (s === "rejected" || s === "cancelled")
    return "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400";
  return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
};

function StatCard({ label, value, icon, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">{value ?? "—"}</p>
        </div>
        <div className={`rounded-2xl border p-3 ${tones[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

function SubOrderDetailsModal({ isOpen, subOrder, onClose }) {
  if (!isOpen || !subOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
              Sub-Order
            </p>
            <h2 className="mt-2 text-xl font-black text-slate-900">
              #{subOrder.subOrderId ?? subOrder.id}
            </h2>
            <span
              className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusColor(subOrder.status || subOrder.subOrderStatus)}`}
            >
              {subOrder.status || subOrder.subOrderStatus || "—"}
            </span>
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
              <p className="text-xs font-bold text-slate-600">Herbalist</p>
              <p className="mt-1 text-sm text-slate-700">
                {subOrder.herbalistName || subOrder.herbalistUserName || "N/A"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">Total</p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                {subOrder.totalPrice != null
                  ? `$${Number(subOrder.totalPrice).toFixed(2)}`
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">Order ID</p>
              <p className="mt-1 text-sm text-slate-700">
                {subOrder.orderId || "N/A"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">Date</p>
              <p className="mt-1 text-sm text-slate-700">
                {subOrder.createdAt
                  ? new Date(subOrder.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSubOrdersPage() {
  const { t } = useTranslation();
  const [subOrders, setSubOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadData = async ({ nextPage = pageNumber, nextSize = pageSize } = {}) => {
    setIsLoading(true);
    setError("");

    try {
      const params = { PageNumber: nextPage, PageSize: nextSize };
      if (statusFilter) params.Status = statusFilter;
      if (searchValue.trim()) params.SearchValue = searchValue.trim();

      const [ordersRes, statsRes] = await Promise.allSettled([
        getAdminSubOrders(params),
        getAdminSubOrderStatistics(),
      ]);

      if (ordersRes.status === "fulfilled") {
        const items = Array.isArray(ordersRes.value?.items)
          ? ordersRes.value.items
          : Array.isArray(ordersRes.value)
            ? ordersRes.value
            : [];
        setSubOrders(items);
        setTotalPages(Math.max(1, ordersRes.value?.totalPages ?? 1));
        setPageNumber(ordersRes.value?.pageNumber ?? nextPage);
      }

      if (statsRes.status === "fulfilled") {
        setStatistics(statsRes.value);
      }

      const rejection = [ordersRes, statsRes].find((r) => r.status === "rejected");
      if (rejection) {
        const msg = rejection.reason?.response?.data?.message || "Unable to load sub-orders.";
        setError(msg);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load sub-orders.");
      toast.error("Unable to load sub-orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData({ nextPage: 1, nextSize: pageSize });
  }, [pageSize, statusFilter]);

  useEffect(() => {
    loadData({ nextPage: pageNumber, nextSize: pageSize });
  }, [pageNumber]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <FaTruck className="text-sm" />
              Sub-Orders
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminSubOrders.title", "All Sub-Orders")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t("adminSubOrders.subtitle", "View sub-orders assigned to herbalists across all orders.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadData({ nextPage: pageNumber, nextSize: pageSize })}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
          >
            <FaSyncAlt className="text-sm" />
            Refresh
          </button>
        </div>
      </section>

      {statistics && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total" value={statistics.totalSubOrders ?? statistics.total} icon={<FaTruck className="text-2xl" />} tone="emerald" />
          <StatCard label="Pending" value={statistics.pendingCount ?? statistics.pending} icon={<FaTruck className="text-2xl" />} tone="amber" />
          <StatCard label="Approved" value={statistics.approvedCount ?? statistics.approved} icon={<FaTruck className="text-2xl" />} tone="emerald" />
          <StatCard label="Rejected" value={statistics.rejectedCount ?? statistics.rejected} icon={<FaTruck className="text-2xl" />} tone="rose" />
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sub-orders list</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Page {pageNumber} of {totalPages}.</p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-72">
              <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400"><FaSearch className="text-sm" /></div>
              <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") loadData({ nextPage: 1, nextSize: pageSize }); }} placeholder="Search..." className="block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 py-3 ps-11 pe-4 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <FaFilter className="text-slate-400" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPageNumber(1); }} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none">
                {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="text-slate-500">Size</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value) || DEFAULT_PAGE_SIZE); setPageNumber(1); }} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none">
                {PAGE_SIZE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
          </div>
        ) : subOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">No sub-orders found.</div>
        ) : (
          <div className="pt-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">ID</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Herbalist</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Total</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {subOrders.map((item) => {
                      const id = item.subOrderId ?? item.id;
                      return (
                        <tr key={id} onClick={() => { setSelectedItem(item); setIsDetailsOpen(true); }} className="cursor-pointer transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20">
                          <td className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">#{id}</td>
                          <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">{item.herbalistName || item.herbalistUserName || "—"}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusColor(item.status || item.subOrderStatus)}`}>
                              {item.status || item.subOrderStatus || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{item.totalPrice != null ? `$${Number(item.totalPrice).toFixed(2)}` : "—"}</td>
                          <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">#{item.orderId || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2">
                <button type="button" onClick={() => setPageNumber((p) => Math.max(1, p - 1))} disabled={pageNumber <= 1 || isLoading} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><FaChevronLeft /></button>
                <span className="px-3 text-sm font-bold text-slate-700 dark:text-slate-300">{pageNumber} / {totalPages}</span>
                <button type="button" onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))} disabled={pageNumber >= totalPages || isLoading} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><FaChevronRight /></button>
              </div>
            )}
          </div>
        )}
      </section>

      <SubOrderDetailsModal
        isOpen={isDetailsOpen}
        subOrder={selectedItem}
        onClose={() => { setIsDetailsOpen(false); setSelectedItem(null); }}
      />
    </div>
  );
}

export default AdminSubOrdersPage;
