import { useCallback, useEffect, useState } from "react";
import { getHerbById, getHerbWithHerbalist, getHerbalistsForHerb } from "../api/herbs";
import { normalizeHerb } from "../services/herbs";

function useHerbDetails(herbId) {
  const [herb, setHerb] = useState(null);
  const [providers, setProviders] = useState([]);
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
      const [herbData, herbalistData, providersData] = await Promise.all([
        getHerbById(herbId),
        getHerbWithHerbalist(herbId).catch(() => null),
        getHerbalistsForHerb(herbId).catch(() => []),
      ]);
      setHerb(
        normalizeHerb({
          ...(herbData || {}),
          ...(herbalistData || {}),
        }),
      );
      setProviders(Array.isArray(providersData) ? providersData : (providersData?.herbalists || providersData?.items || []));
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
    providers,
    isLoading,
    error,
    reload: loadHerbDetails,
  };
}

export default useHerbDetails;
