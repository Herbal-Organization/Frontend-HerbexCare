import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBookOpen,
  FaExclamationCircle,
  FaFlask,
  FaTrash,
} from "react-icons/fa";
import { getMyRecipesFavorites, toggleFavorite } from "../../../api/favorites";

function extractRecipesArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function PatientSavedRecipes() {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const loadFavoriteRecipes = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getMyRecipesFavorites();
        setFavoriteRecipes(extractRecipesArray(response));
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.title ||
            "Unable to load saved recipes right now.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadFavoriteRecipes();
  }, []);

  const savedRecipes = useMemo(
    () =>
      favoriteRecipes
        .map((item) => ({
          recipeId: item.recipeId || item.id || item.targetId,
          recipeName: item.recipeName || item.title || item.name,
          description: item.description || "",
          savedDate: item.createdAt || item.savedAt || item.date,
          rating: item.rating ?? item.averageRating,
        }))
        .filter((item) => item.recipeId)
        .sort((a, b) => {
          const aDate = a.savedDate ? new Date(a.savedDate).getTime() : 0;
          const bDate = b.savedDate ? new Date(b.savedDate).getTime() : 0;
          return bDate - aDate;
        }),
    [favoriteRecipes],
  );

  const handleRemoveSavedRecipe = async (recipeId) => {
    const targetId = Number(recipeId || 0);
    if (!targetId) return;

    setRemovingId(targetId);
    try {
      await toggleFavorite({
        targetId,
        type: "Recipe",
      });
      setFavoriteRecipes((current) =>
        current.filter((item) => {
          const itemId = Number(item.recipeId || item.id || item.targetId || 0);
          return itemId !== targetId;
        }),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Unable to update saved recipes right now.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 shadow-sm" />
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">
            Loading Saved Recipes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 shadow-inner">
            <FaBookOpen className="text-2xl" />
          </div>
          Saved Recipes
        </h1>
        <p className="text-lg font-medium text-slate-500">
          Recipes you saved from the recipe library.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-3xl border border-eed-100 bg-red-50 p-8 shadow-sm text-center">
          <FaExclamationCircle className="mx-auto text-4xl text-red-400 mb-4" />
          <p className="text-lg font-bold text-red-700">{error}</p>
        </div>
      )}

      {!error && savedRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-24 text-center shadow-sm">
          <FaBookOpen className="text-5xl text-slate-300 mb-6" />
          <h2 className="text-2xl font-bold text-slate-700">
            No Saved Recipes Yet
          </h2>
          <p className="mt-2 text-slate-500 mb-8 max-w-sm font-medium">
            Save recipes from the recipe library to see them here.
          </p>
          <Link
            to="/patient/home/recipes"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 shadow-md"
          >
            Browse Recipes
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedRecipes.map((recipe) => (
            <div
              key={recipe.recipeId}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 border border-slate-200">
                  Recipe #{String(recipe.recipeId).slice(0, 8)}
                </span>
                <FaFlask className="text-emerald-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                {recipe.recipeName}
              </h3>

              {recipe.description ? (
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                  {recipe.description}
                </p>
              ) : null}

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {recipe.savedDate ? (
                  <p>
                    <span className="font-semibold">Last saved:</span>{" "}
                    {new Date(recipe.savedDate).toLocaleDateString()}
                  </p>
                ) : null}
                {recipe.rating != null ? (
                  <p>
                    <span className="font-semibold">Rating:</span> {recipe.rating}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  to={`/patient/home/recipes/${recipe.recipeId}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  View Recipe
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemoveSavedRecipe(recipe.recipeId)}
                  disabled={removingId === Number(recipe.recipeId)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaTrash className="text-[11px]" />
                  {removingId === Number(recipe.recipeId) ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientSavedRecipes;
