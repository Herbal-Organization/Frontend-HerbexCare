import { useState, useEffect } from "react";
import { getAllDiseases } from "../api/diseases";

let cachedDiseases = null;
let pendingPromise = null;

export default function useDiseases() {
  const [diseases, setDiseases] = useState(cachedDiseases || []);
  const [isLoading, setIsLoading] = useState(!cachedDiseases);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedDiseases) {
      setIsLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        if (!pendingPromise) {
          pendingPromise = getAllDiseases();
        }
        const response = await pendingPromise;
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.items)
            ? response.items
            : Array.isArray(response?.data)
              ? response.data
              : [];
        cachedDiseases = data;
        setDiseases(data);
      } catch (err) {
        pendingPromise = null;
        setError(err.message || "Failed to fetch diseases");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { diseases, isLoading, error };
}
