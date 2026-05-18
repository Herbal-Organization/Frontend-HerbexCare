import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBox,
  FaExclamationCircle,
  FaShoppingBag,
  FaChevronRight,
} from "react-icons/fa";
import { getAllMyOrders } from "@api/orders";
import { Pagination } from "@components/common";

const ORDERS_PER_PAGE = 8;

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

const getStatusColor = (status) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case "paid":
    case "confirmed":
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "canceled":
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const getStatusIcon = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === "completed") return "✓";
  if (normalized === "pending") return "⏳";
  if (normalized === "canceled" || normalized === "cancelled") return "✕";
  return "○";
};

function PatientOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getAllMyOrders({
          pageNumber: currentPage,
          pageSize: ORDERS_PER_PAGE,
        });
        const extractedOrders = extractOrdersArray(response);
        const paginationMeta = extractPaginationMeta(response);

        // Fallback to client-side slicing when API returns an unpaginated list.
        if (!paginationMeta.hasMeta) {
          const safeTotalItems = extractedOrders.length;
          const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
          const endIndex = startIndex + ORDERS_PER_PAGE;

          setOrders(extractedOrders.slice(startIndex, endIndex));
          setTotalItems(safeTotalItems);
          return;
        }

        const safePageSize = paginationMeta.pageSize ?? ORDERS_PER_PAGE;
        const safeTotalPages = paginationMeta.totalPages ?? null;
        const safeTotalItems =
          paginationMeta.totalItems ??
          (safeTotalPages
            ? safeTotalPages * safePageSize
            : extractedOrders.length);

        setOrders(extractedOrders);
        setTotalItems(safeTotalItems);

        if (
          safeTotalPages &&
          currentPage > safeTotalPages &&
          safeTotalPages >= 1
        ) {
          setCurrentPage(safeTotalPages);
        }

        // If the backend sends a page size different than the UI one, keep
        // page buttons stable by projecting total items to the UI page size.
        if (safePageSize !== ORDERS_PER_PAGE && safeTotalItems <= 0) {
          setTotalItems(extractedOrders.length);
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
  }, [currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalItems / ORDERS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
      <div className="mb-8 flex items-center gap-3">
        <FaBox className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
      </div>

      <div className="space-y-4">
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
          const itemCount =
            (Array.isArray(order.recipes) ? order.recipes.length : 0) +
            (Array.isArray(order.herbs) ? order.herbs.length : 0) +
            (Array.isArray(order.aiRecipes) ? order.aiRecipes.length : 0);

          return (
            <Link
              key={orderId}
              to={`/patient/dashboard/orders/${orderId}`}
              className="block rounded-lg border border-slate-200 bg-white p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Order #{orderId}
                      </h3>
                      <p className="text-sm text-slate-500">{formattedDate}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold text-slate-900">
                        {totalPrice.toFixed(2)} EGP
                      </p>
                      <p className="text-sm text-slate-500">
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(status)}`}
                  >
                    {getStatusIcon(status)} {status}
                  </span>
                  <FaChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={ORDERS_PER_PAGE}
            currentPage={Math.min(currentPage, totalPages)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

export default PatientOrders;
