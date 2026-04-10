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
      const data = await getAllHerbs();
      const normalizedHerbs = Array.isArray(data) ? data.map(normalizeHerb) : [];

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
