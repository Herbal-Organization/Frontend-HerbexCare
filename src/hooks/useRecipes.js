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
      const response = await getAllRecipes(1, 1000); // Fetch up to 1000 items

      // Handle both array and paginated response formats
      let recipesData = [];
      if (Array.isArray(response)) {
        recipesData = response;
      } else if (response?.items && Array.isArray(response.items)) {
        recipesData = response.items;
      }

      setRecipes(recipesData.map(normalizeRecipe));
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
