import { useEffect, useState, useCallback } from "react";
import {
  getMySubOrders,
  getSubOrderById,
  updateSubOrderStatus,
} from "../api/subOrders";

export default function useSubOrders() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await getMySubOrders();
      setData(Array.isArray(resp) ? resp : (resp?.items ?? []));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load suborders",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = () => load();

  const getById = async (id) => {
    setIsLoading(true);
    try {
      const resp = await getSubOrderById(id);
      return resp;
    } finally {
      setIsLoading(false);
    }
  };

  const setStatus = async (id, status) => {
    setIsLoading(true);
    try {
      const resp = await updateSubOrderStatus(id, status);
      await load();
      return resp;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refresh,
    getById,
    setStatus,
  };
}
