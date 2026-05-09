import { useEffect, useState } from "react";
import { getAllHerbs, getHerbWithHerbalist } from "../api/herbs";
import { normalizeHerb } from "../services/herbs";

export default function useHerbs() {
  const [herbs, setHerbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHerbs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllHerbs(1, 1000); // Fetch up to 1000 items

      // Handle both array and paginated response formats
      let herbsData = [];
      if (Array.isArray(response)) {
        herbsData = response;
      } else if (response?.items && Array.isArray(response.items)) {
        herbsData = response.items;
      }

      const normalizedHerbs = herbsData.map(normalizeHerb);

      const herbsWithOwners = await Promise.all(
        normalizedHerbs.map(async (herb) => {
          try {
            const herbalistData = await getHerbWithHerbalist(herb.herbId);
            return normalizeHerb({
              ...herb,
              ...herbalistData,
            });
          } catch {
            return herb;
          }
        }),
      );

      setHerbs(herbsWithOwners);
    } catch (err) {
      setError(err.message || "Failed to load herbs");
      console.error("Error loading herbs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHerbs();
  }, []);

  return {
    herbs,
    isLoading,
    error,
    reload: loadHerbs,
  };
}
