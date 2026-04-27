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

  useEffect(() => {
    const handleFocus = () => {
      load();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        load();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(load, 30000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [load]);

  const refresh = () => load();

  const getById = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const resp = await getSubOrderById(id);
      return resp;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setStatus = useCallback(
    async (id, status) => {
      setIsLoading(true);
      try {
        const resp = await updateSubOrderStatus(id, status);
        await load();
        return resp;
      } finally {
        setIsLoading(false);
      }
    },
    [load],
  );

  return {
    data,
    isLoading,
    error,
    refresh,
    getById,
    setStatus,
  };
}
