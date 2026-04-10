import { useCallback, useEffect, useState } from "react";
import { getPatientDashboardData } from "../services/patientProfile";

function usePatientDashboardData(userId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
    if (!userId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getPatientDashboardData(userId);
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
  }, [userId]);

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

export default usePatientDashboardData;
