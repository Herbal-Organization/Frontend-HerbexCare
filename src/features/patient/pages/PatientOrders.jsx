import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBox,
  FaExclamationCircle,
  FaShoppingBag,
  FaChevronRight,
  FaHeart,
  FaRegHeart,
  FaCalendarAlt,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import { getAllMyOrders, getOrderById, markOrderAsFavorite } from "@api/orders";
import { Pagination } from "@components/common";
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

const isCanceledStatus = (status) => {
  const normalized = normalizeStatus(status);
  return normalized === "canceled" || normalized === "cancelled";
};

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

function PatientOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [busyKeys, setBusyKeys] = useState(new Set());

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getAllMyOrders({
          pageNumber: currentPage,
          pageSize: ORDERS_PER_PAGE,
        });

        const extractedOrders = extractOrdersArray(response).filter(
          (order) => !isCanceledStatus(order.status),
        );

        // Fetch detailed info for each order to get paymentMethod
        const detailedOrders = await Promise.all(
          extractedOrders.map(async (order) => {
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
  }, [currentPage]);

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

  const totalPages = Math.max(1, Math.ceil(totalItems / ORDERS_PER_PAGE));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 shadow-sm" />
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">
            Loading Orders
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <FaExclamationCircle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-center text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <FaShoppingBag className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">No orders found</p>
          <p className="mt-2 text-sm text-slate-400">
            Start shopping to create your first order
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm transition-transform hover:scale-105">
            <FaBox className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">My Orders</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Track and manage your recent purchases</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-sm border border-slate-200">
          <div className="px-4 py-2 text-sm font-bold text-slate-700">
            {totalItems} total orders
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        {orders.map((order) => {
          const orderId = order.orderId || order.id;
          const orderDate = new Date(order.orderDate || order.createdAt);
          const formattedDate = orderDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const totalPrice = order.totalPrice || order.total || 0;
          const status = order.status || "Pending";
          const paymentMethod = order.paymentMethod || "Not Specified";
          const isFavorite = !!order.isFavorite;
          const isBusy = busyKeys.has(orderId);

          return (
            <div
              key={orderId}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-200"
            >
              <div className="absolute top-0 left-0 h-full w-1.5 bg-emerald-500 transform -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
              
              <div className="flex flex-col md:flex-row md:items-center p-5 sm:p-6 gap-6">
                {/* Order Identity & Date */}
                <div className="flex-1 min-w-50">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-black text-slate-900">Order #{orderId}</span>
                    <button
                      onClick={(e) => handleToggleFavorite(e, orderId)}
                      disabled={isBusy}
                      className={`p-2 transition-all rounded-full hover:bg-rose-50 ${
                        isFavorite ? "text-rose-500 scale-110" : "text-slate-300 hover:text-rose-400"
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</span>
                    <span className="text-xl font-black text-slate-900">{totalPrice.toFixed(2)} <span className="text-sm font-bold text-slate-500">EGP</span></span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment</span>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-100">
                      {paymentMethod.toLowerCase().includes('card') ? (
                        <FaCreditCard className="text-blue-500" />
                      ) : (
                        <FaMoneyBillWave className="text-emerald-600" />
                      )}
                      <span className="text-xs font-bold text-slate-700">{paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ring-4 ring-white ${getStatusColor(status)}`}
                    >
                      <span className="text-sm leading-none">{getStatusIcon(status)}</span> {status}
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
        })}
      </div>

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
