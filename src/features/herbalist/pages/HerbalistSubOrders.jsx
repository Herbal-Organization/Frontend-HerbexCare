import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBoxOpen,
  FaExclamationCircle,
  FaFilter,
  FaSearch,
  FaShoppingBag,
} from "react-icons/fa";
import { motion } from "motion/react";
import useHerbalistOrders, {
  ORDERS_PER_PAGE,
} from "../hooks/useHerbalistOrders";
import { SUB_ORDER_STATUS } from "../constants/subOrderStatus";
import HerbalistOrderCard from "@components/common/HerbalistOrderCard";
import Pagination from "@components/common/Pagination";
import { Button } from "@components/ui/button";
import { cn } from "@utils/cn";

const STATUS_FILTERS = [
  { key: "all", value: "all" },
  { key: "pending", value: SUB_ORDER_STATUS.PENDING },
  { key: "preparing", value: SUB_ORDER_STATUS.PREPARING },
  { key: "shipped", value: SUB_ORDER_STATUS.SHIPPED },
  { key: "delivered", value: SUB_ORDER_STATUS.DELIVERED },
  { key: "cancelled", value: SUB_ORDER_STATUS.CANCELLED },
];

function OrdersSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800/50"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="mt-4 h-14 rounded-lg bg-slate-100 dark:bg-slate-900" />
        </div>
      ))}
    </div>
  );
}

function HerbalistSubOrders() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchValue(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { orders, isLoading, error, updatingId, totalItems, allOrdersCount, totalPages, approve, reject, updateStatus, fetchOrders } =
    useHerbalistOrders({
      pageNumber: currentPage,
      pageSize: ORDERS_PER_PAGE,
      searchValue,
      statusFilter,
    });

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const hasActiveFilters = searchValue.length > 0 || statusFilter !== "all";

  const statusTabs = useMemo(
    () =>
      STATUS_FILTERS.map((item) => ({
        ...item,
        label: t(`herbalistOrders.status.${item.key}`),
      })),
    [t],
  );

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchValue("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-400">
            <FaShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {t("herbalistOrders.title")}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("herbalistOrders.subtitle")}
            </p>
          </div>
        </div>
        {!isLoading && allOrdersCount > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {t("herbalistOrders.total", { count: allOrdersCount })}
          </div>
        ) : null}
      </header>

      <div className="relative">
        <FaSearch className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t("herbalistOrders.searchPlaceholder")}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 ps-12 pe-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500"
        />
        {isLoading ? (
          <div className="absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
        ) : null}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50 sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <FaFilter className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {t("herbalistOrders.filters")}
          </span>
        </div>
        <div
          role="tablist"
          className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-900/60"
        >
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={statusFilter === tab.value}
              onClick={() => handleStatusChange(tab.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                statusFilter === tab.value
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          <FaExclamationCircle className="me-2 inline" />
          {t("herbalistOrders.error")}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ms-3"
            onClick={fetchOrders}
          >
            {t("dashboard.states.retry", "Retry")}
          </Button>
        </div>
      ) : null}

      {isLoading && orders.length === 0 ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
            {hasActiveFilters ? (
              <FaFilter className="h-8 w-8 text-slate-400" />
            ) : (
              <FaBoxOpen className="h-8 w-8 text-slate-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            {hasActiveFilters
              ? t("herbalistOrders.emptyFilterTitle")
              : t("herbalistOrders.emptyTitle")}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {hasActiveFilters
              ? t("herbalistOrders.emptyFilterDescription")
              : t("herbalistOrders.emptyDescription")}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={clearFilters}
            >
              {t("herbalistOrders.clearFilters")}
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {orders.map((order) => (
              <HerbalistOrderCard
                key={order.id}
                order={order}
                onApprove={approve}
                onReject={reject}
                onUpdateStatus={updateStatus}
                isUpdating={updatingId === order.id}
              />
            ))}
          </motion.div>

          {totalPages > 1 ? (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={ORDERS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default HerbalistSubOrders;
