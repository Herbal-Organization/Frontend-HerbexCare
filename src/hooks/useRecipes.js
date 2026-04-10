import { useCallback, useEffect, useState } from "react";
import { getAllRecipes } from "../api/recipes";
import { normalizeRecipe } from "../services/recipes";

function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getAllRecipes();
      setRecipes(Array.isArray(data) ? data.map(normalizeRecipe) : []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load recipes. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  return {
    recipes,
    isLoading,
    error,
    reload: loadRecipes,
  };
}

export default useRecipes;
