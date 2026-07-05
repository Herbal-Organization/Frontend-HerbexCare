import { useState, useEffect, useCallback, useRef } from "react";
import { getMySubOrders, approveSubOrder, rejectSubOrder, updateSubOrderStatus } from "@api/subOrders";
import { SUB_ORDER_ACCEPT, SUB_ORDER_REJECT } from "../constants/subOrderStatus";
import { normalizeOrders } from "../services/orders";

const ORDERS_PER_PAGE = 6;

function getNumericValue(...values) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) {
      return numeric;
    }
  }
  return null;
}

function extractPaginatedResponse(response, pageNumber, pageSize) {
  if (Array.isArray(response)) {
    return {
      items: response,
      totalItems: response.length,
      totalPages: Math.max(1, Math.ceil(response.length / pageSize)),
      pageNumber,
      isClientPaged: true,
    };
  }

  const items = Array.isArray(response?.items) ? response.items : [];
  const totalItems =
    getNumericValue(
      response?.totalCount,
      response?.totalItems,
      response?.count,
    ) ?? items.length;
  const totalPages = Math.max(
    1,
    getNumericValue(response?.totalPages) ??
      Math.ceil(totalItems / pageSize),
  );

  return {
    items,
    totalItems,
    totalPages,
    pageNumber: getNumericValue(response?.pageNumber) ?? pageNumber,
    isClientPaged: false,
  };
}

const useHerbalistOrders = ({
  pageNumber = 1,
  pageSize = ORDERS_PER_PAGE,
  searchValue = "",
  statusFilter = "all",
} = {}) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [allOrdersCount, setAllOrdersCount] = useState(null);
  const allOrdersCountRef = useRef(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTotalCount = useCallback(async () => {
    try {
      const response = await getMySubOrders();
      const meta = extractPaginatedResponse(response, 1, 999999);
      setAllOrdersCount(meta.totalItems);
    } catch {
      setAllOrdersCount(null);
    }
  }, []);

  useEffect(() => {
    allOrdersCountRef.current = allOrdersCount;
  }, [allOrdersCount]);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };
      if (searchValue.trim()) {
        params.SearchValue = searchValue.trim();
      }
      if (statusFilter !== "all") {
        params.Status = statusFilter;
      }

      const response = await getMySubOrders(params);
      const meta = extractPaginatedResponse(response, pageNumber, pageSize);
      let normalized = normalizeOrders(meta.items);

      if (meta.isClientPaged) {
        if (statusFilter !== "all") {
          normalized = normalized.filter(
            (order) =>
              String(order.status || "").toLowerCase() ===
              statusFilter.toLowerCase(),
          );
        }
        const pages = Math.max(1, Math.ceil(normalized.length / pageSize));
        const safePage = Math.min(pageNumber, pages);
        const start = (safePage - 1) * pageSize;
        setOrders(normalized.slice(start, start + pageSize));
        setTotalItems(normalized.length);
        setTotalPages(pages);
      } else {
        if (statusFilter !== "all") {
          normalized = normalized.filter(
            (order) =>
              String(order.status || "").toLowerCase() ===
              statusFilter.toLowerCase(),
          );
        }
        setOrders(normalized);
        const hasActiveFilter = statusFilter !== "all" || searchValue.trim();
        const accurateTotal = hasActiveFilter
          ? normalized.length
          : (allOrdersCountRef.current ?? meta.totalItems);
        setTotalItems(accurateTotal);
        setTotalPages(Math.max(1, Math.ceil(accurateTotal / pageSize)));
      }
    } catch (err) {
      setError(err);
      setOrders([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize, searchValue, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchTotalCount();
  }, [fetchTotalCount]);

  const approve = useCallback(async (orderId) => {
    setUpdatingId(orderId);
    try {
      await approveSubOrder(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: SUB_ORDER_ACCEPT }
            : order,
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const reject = useCallback(async (orderId) => {
    setUpdatingId(orderId);
    try {
      await rejectSubOrder(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: SUB_ORDER_REJECT }
            : order,
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const updateStatus = useCallback(async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await updateSubOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }, []);

  return {
    orders,
    isLoading,
    error,
    updatingId,
    totalItems,
    allOrdersCount,
    totalPages,
    pageSize,
    fetchOrders,
    approve,
    reject,
    updateStatus,
  };
};

export { ORDERS_PER_PAGE };
export default useHerbalistOrders;
