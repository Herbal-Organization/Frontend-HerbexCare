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
      console.log("SubOrders API Response:", resp);
      if (Array.isArray(resp) && resp.length > 0) {
        console.log("First order sample:", resp[0]);
        console.log("Patient fields:", {
          patient: resp[0]?.patient,
          patientName: resp[0]?.patientName,
          customerName: resp[0]?.customerName,
          contactName: resp[0]?.contactName,
          userName: resp[0]?.userName,
          customer: resp[0]?.customer,
        });
        console.log("Date fields:", {
          orderDate: resp[0]?.orderDate,
          createdAt: resp[0]?.createdAt,
          date: resp[0]?.date,
        });
        console.log("Total fields:", {
          totalPrice: resp[0]?.totalPrice,
          total: resp[0]?.total,
          totalCost: resp[0]?.totalCost,
          subtotal: resp[0]?.subtotal,
        });
      }
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
        const payload =
          status && typeof status === "object" ? status : { status };
        const resp = await updateSubOrderStatus(id, payload);
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
