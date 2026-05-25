import { useState, useEffect, useCallback } from "react";
import { getMySubOrders, updateSubOrderStatus } from "@api/subOrders";
import { normalizeOrders } from "../services/orders";

const useHerbalistOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMySubOrders();
      setOrders(normalizeOrders(response.items));
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = useCallback(async (orderId, status) => {
    try {
      await updateSubOrderStatus(orderId, { status });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      throw err;
    }
  }, []);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateStatus,
  };
};

export default useHerbalistOrders;
