import { useCallback, useEffect, useState } from "react";
import { getHerbById, getHerbWithHerbalist } from "../api/herbs";
import { normalizeHerb } from "../services/herbs";

function useHerbDetails(herbId) {
  const [herb, setHerb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHerbDetails = useCallback(async () => {
    if (!herbId) {
      setError("Herb id is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [herbData, herbalistData] = await Promise.all([
        getHerbById(herbId),
        getHerbWithHerbalist(herbId).catch(() => null),
      ]);
      setHerb(
        normalizeHerb({
          ...(herbData || {}),
          ...(herbalistData || {}),
        }),
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load herb details.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [herbId]);

  useEffect(() => {
    loadHerbDetails();
  }, [loadHerbDetails]);

  return {
    herb,
    isLoading,
    error,
    reload: loadHerbDetails,
  };
}

export default useHerbDetails;
