import { useEffect, useState, useMemo } from "react";
import {
  FaBox,
  FaExclamationCircle,
  FaShoppingBag,
  FaChevronRight,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { getAllMyOrders, getOrderById, markOrderAsFavorite } from "@api/orders";
import { Pagination, PatientOrderCard } from "@components/common";
import { toast } from "react-hot-toast";

const ORDERS_PER_PAGE = 5;

function extractOrdersArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

function getNumericValue(...values) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return null;
}

function extractPaginationMeta(payload) {
  const totalItems = getNumericValue(
    payload?.totalItems,
    payload?.totalCount,
    payload?.count,
    payload?.data?.totalItems,
    payload?.data?.totalCount,
    // Add logic to calculate if meta missing but totalPages exists
    payload?.totalPages > 0
      ? payload.totalPages * (payload.pageSize || ORDERS_PER_PAGE)
      : null,
  );

  const totalPages = getNumericValue(
    payload?.totalPages,
    payload?.data?.totalPages,
  );

  const pageSize = getNumericValue(
    payload?.pageSize,
    payload?.PageSize,
    payload?.data?.pageSize,
    payload?.data?.PageSize,
  );

  return {
    hasMeta: totalItems !== null || totalPages !== null,
    totalItems,
    totalPages,
    pageSize,
  };
}

const normalizeStatus = (status) => (status || "").trim().toLowerCase();

function PatientOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [busyKeys, setBusyKeys] = useState(new Set());

  // Filters state
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // Debounce the search box before hitting the API.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchValue(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getAllMyOrders({
          pageNumber: currentPage,
          pageSize: ORDERS_PER_PAGE,
          searchValue: searchValue || undefined,
        });

        const extractedOrders = extractOrdersArray(response);

        // Only fetch per-order details when the summary is missing the fields
        // the card needs (payment method, status, itemized sub-orders). When the
        // list endpoint already returns them, this avoids an N+1 request burst.
        const needsDetails = (order) =>
          !order.paymentMethod ||
          !(order.orderStatus || order.status) ||
          !Array.isArray(order.subOrders);

        const detailedOrders = await Promise.all(
          extractedOrders.map(async (order) => {
            if (!needsDetails(order)) return order;
            try {
              const orderId = order.orderId || order.id;
              const details = await getOrderById(orderId);
              return { ...order, ...details };
            } catch (err) {
              console.error(`Failed to fetch details for order:`, err);
              return order;
            }
          }),
        );

        const paginationMeta = extractPaginationMeta(response);

        // API might send paginated object or flat array
        if (paginationMeta.hasMeta) {
          const safeTotalItems =
            paginationMeta.totalItems ?? detailedOrders.length;
          setOrders(detailedOrders);
          setTotalItems(safeTotalItems);
        } else {
          // Client-side fallback if no meta
          setOrders(
            detailedOrders.slice(
              (currentPage - 1) * ORDERS_PER_PAGE,
              currentPage * ORDERS_PER_PAGE,
            ),
          );
          setTotalItems(detailedOrders.length);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.title ||
            "Unable to load orders right now. Please try again later.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, searchValue]);

  const handleToggleFavorite = async (e, orderId) => {
    e.preventDefault();
    e.stopPropagation();

    if (busyKeys.has(orderId)) return;

    setBusyKeys((prev) => new Set(prev).add(orderId));
    try {
      await markOrderAsFavorite(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          (order.orderId || order.id) === orderId
            ? { ...order, isFavorite: !order.isFavorite }
            : order,
        ),
      );
      toast.success("Favorite status updated");
    } catch (err) {
      toast.error("Failed to update favorite status");
    } finally {
      setBusyKeys((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus =
        statusFilter === "all" ||
        normalizeStatus(order.orderStatus) === statusFilter;
      const matchPayment =
        paymentFilter === "all" ||
        String(order.paymentMethod).toLowerCase() ===
          paymentFilter.toLowerCase();
      return matchStatus && matchPayment;
    });
  }, [orders, statusFilter, paymentFilter]);

  const totalPages = Math.max(1, Math.ceil(totalItems / ORDERS_PER_PAGE));
  const hasActiveQuery =
    !!searchValue || statusFilter !== "all" || paymentFilter !== "all";

  // Full-page spinner only on the very first load; debounced searches keep the
  // controls mounted and swap the grid for skeletons instead.
  if (isLoading && orders.length === 0 && !hasActiveQuery) {
    return (
      <div className="mx-auto max-w-7xl w-full flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500 shadow-sm" />
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Loading Orders
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl w-full flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <FaExclamationCircle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-center text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0 && !hasActiveQuery) {
    return (
      <div className="mx-auto max-w-7xl w-full flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <FaShoppingBag className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">No orders found</p>
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
            Start shopping to create your first order
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm transition-transform hover:scale-105">
            <FaBox className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              My Orders
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Track and manage your recent purchases
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            {totalItems} total orders
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search orders by id, item, or status..."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-10 flex flex-col gap-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm lg:flex-row lg:items-center lg:px-8">
        <div className="items-center gap-3 text-slate-500 dark:text-slate-400 mr-4 border-b dark:border-slate-700 pb-4 lg:border-b-0 lg:pb-0 lg:border-r lg:border-slate-100 dark:lg:border-slate-700 lg:pr-6 hidden sm:flex">
          <FaFilter className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-bold uppercase tracking-wider">
            Filters
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 w-full sm:grid-cols-2 lg:flex lg:items-end lg:gap-8">
          {/* Status Filter */}
          <div className="flex flex-col gap-2 flex-1">
            <label
              htmlFor="status"
              className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1"
            >
              Order Status
            </label>
            <div className="relative group">
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 py-3 pl-4 pr-10 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none transition-all hover:bg-slate-50 dark:hover:bg-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="partiallyshipped">Partially Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="partiallydelivered">Partially Delivered</option>
                <option value="partiallycancelled">Partially Cancelled</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors">
                <FaChevronRight className="h-3 w-3 rotate-90" />
              </div>
            </div>
          </div>

          {/* Payment Filter */}
          <div className="flex flex-col gap-2 flex-1">
            <label
              htmlFor="payment"
              className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1"
            >
              Payment Method
            </label>
            <div className="relative group">
              <select
                id="payment"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 py-3 pl-4 pr-10 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none transition-all hover:bg-slate-50 dark:hover:bg-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="all">Any Payment</option>
                <option value="cash">Cash</option>
                <option value="wallet">Wallet</option>
                <option value="credit">Credit Card</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors">
                <FaChevronRight className="h-3 w-3 rotate-90" />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(statusFilter !== "all" || paymentFilter !== "all") && (
            <button
              onClick={() => {
                setStatusFilter("all");
                setPaymentFilter("all");
              }}
              className="mt-2 h-11 px-4 flex items-center justify-center text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors lg:pb-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex h-full items-center gap-6 p-6">
                <div className="h-16 w-40 rounded-xl bg-slate-100 dark:bg-slate-700" />
                <div className="hidden flex-1 gap-8 sm:flex">
                  <div className="h-12 w-24 rounded-xl bg-slate-100 dark:bg-slate-700" />
                  <div className="h-12 w-24 rounded-xl bg-slate-100 dark:bg-slate-700" />
                  <div className="h-12 w-24 rounded-xl bg-slate-100 dark:bg-slate-700" />
                </div>
                <div className="ml-auto h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex h-80 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 px-4 text-center">
          <div className="mb-6 rounded-full bg-slate-100 dark:bg-slate-800 p-6">
            <FaFilter className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            No matching orders
          </h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            We couldn't find any orders that match your search or filters. Try
            different criteria.
          </p>
          <button
            onClick={() => {
              setStatusFilter("all");
              setPaymentFilter("all");
              setSearchInput("");
            }}
            className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => {
            const orderId = order.orderId || order.id;
            return (
              <PatientOrderCard
                key={orderId}
                order={order}
                isBusy={busyKeys.has(orderId)}
                onToggleFavorite={(id) =>
                  handleToggleFavorite(
                    { stopPropagation: () => {}, preventDefault: () => {} },
                    id,
                  )
                }
              />
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={ORDERS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

export default PatientOrders;
