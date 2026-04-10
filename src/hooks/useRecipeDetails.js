import { useCallback, useEffect, useState } from "react";
import { getHerbById, getRecipeById } from "../api/recipes";
import {
  buildRecipeAdvantages,
  buildRecipeDisadvantages,
  normalizeRecipe,
} from "../services/recipes";

function useRecipeDetails(recipeId) {
  const [recipe, setRecipe] = useState(null);
  const [herbs, setHerbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecipeDetails = useCallback(async () => {
    if (!recipeId) {
      setError("Recipe id is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const recipeResponse = await getRecipeById(recipeId);
      const normalizedRecipe = normalizeRecipe(recipeResponse);

      const herbDetails = await Promise.all(
        (recipeResponse.herbs ?? []).map(async (herb) => {
          const details = await getHerbById(herb.herbId);
          return {
            ...details,
            quantity: herb.quantity,
          };
        }),
      );

      setRecipe({
        ...normalizedRecipe,
        advantages: buildRecipeAdvantages(normalizedRecipe, herbDetails),
        disadvantages: buildRecipeDisadvantages(normalizedRecipe, herbDetails),
      });
      setHerbs(herbDetails);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load recipe details.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    loadRecipeDetails();
  }, [loadRecipeDetails]);

  return {
    recipe,
    herbs,
    isLoading,
    error,
    reload: loadRecipeDetails,
  };
}

export default useRecipeDetails;
