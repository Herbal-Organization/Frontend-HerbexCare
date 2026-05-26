import { useState, useEffect, useCallback } from "react";
import { getSubOrderById } from "@api/subOrders";
import { normalizeOrders, enrichOrderItems } from "../services/orders";

const useHerbalistOrder = (orderId) => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    isLoading,
    error,
    fetchOrder,
  };
};

export default useHerbalistOrder;
