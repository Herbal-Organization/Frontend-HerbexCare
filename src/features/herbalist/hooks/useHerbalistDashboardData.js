import { useCallback, useEffect, useState } from "react";
import { getHerbalistDashboardData } from "@features/herbalist/services/herbalistProfile";

function useHerbalistDashboardData(authUser) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
    if (!authUser) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getHerbalistDashboardData(authUser);
      setData(result);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load your dashboard data.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    data,
    isLoading,
    error,
    reload: loadDashboardData,
  };
}

export default useHerbalistDashboardData;
