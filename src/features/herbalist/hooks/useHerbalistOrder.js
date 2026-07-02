import { useState, useEffect, useCallback } from "react";
import { getSubOrderById, updateSubOrderStatus } from "@api/subOrders";
import { normalizeOrders, enrichOrderItems } from "../services/orders";

const useHerbalistOrder = (orderId) => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSubOrderById(orderId);
      const normalizedOrder = normalizeOrders([response])[0];
      const enrichedItems = await enrichOrderItems(normalizedOrder.items);
      setOrder({ ...normalizedOrder, items: enrichedItems });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  const updateStatus = useCallback(
    async (status) => {
      if (!orderId) return;
      setIsUpdating(true);
      setError(null);
      try {
        await updateSubOrderStatus(orderId, status);
        setOrder((prev) => (prev ? { ...prev, status } : prev));
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    isLoading,
    isUpdating,
    error,
    fetchOrder,
    updateStatus,
  };
};

export default useHerbalistOrder;
