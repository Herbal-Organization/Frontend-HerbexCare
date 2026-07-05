import { useCallback, useEffect, useState } from "react";
import { getMyFinancials } from "@api/subOrders";

export function useHerbalistFinancials() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const raw = await getMyFinancials();
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.transactions)
              ? raw.transactions
              : [];
      setData(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to load financials.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, reload: load };
}

export default useHerbalistFinancials;
