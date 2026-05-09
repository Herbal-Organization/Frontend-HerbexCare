import { useState, useEffect } from "react";
import { FaHeart, FaSpinner, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  getMyAIRecipesFavorites,
  toggleFavorite,
} from "../../../../api/favorites";

function FavoriteRecipes() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await getMyAIRecipesFavorites();
      setFavorites(data || []);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      toast.error("Failed to load saved recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId) => {
    try {
      await toggleFavorite({
        recipeId,
        type: "AI_RECIPE",
      });
      setFavorites(favorites.filter((f) => f.id !== recipeId));
      toast.success("Recipe removed from favorites");
    } catch (error) {
      toast.error("Failed to remove recipe");
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 p-4 text-white shadow-lg">
            <FaHeart className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Saved Recipes</h1>
            <p className="text-slate-600">Your favorite AI-generated recipes</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="text-4xl text-emerald-600 animate-spin" />
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((recipe) => (
            <div
              key={recipe.id}
              className="rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
              onClick={() => setSelectedRecipe(recipe)}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">
                  {recipe.recipeName || "Recipe"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(recipe.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {recipe.ingredients && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                      Ingredients
                    </p>
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {typeof recipe.ingredients === "string"
                        ? recipe.ingredients
                        : JSON.stringify(recipe.ingredients).substring(0, 100)}
                    </p>
                  </div>
                )}

                {recipe.confidenceScore && (
                  <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <span className="text-xs font-semibold text-slate-600">
                      Confidence
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {recipe.confidenceScore}%
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 p-4 flex items-center justify-between bg-slate-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(recipe.id);
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition"
                >
                  <FaTrash className="text-xs" />
                  Remove
                </button>
                <span className="text-xs text-slate-500">
                  Click to view details
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <FaHeart className="mx-auto text-5xl text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium mb-2">
            No saved recipes yet
          </p>
          <p className="text-slate-500 text-sm">
            Generate and save recipes to view them here
          </p>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 sticky top-0">
              <h2 className="text-2xl font-bold">
                {selectedRecipe.recipeName || "Recipe"}
              </h2>
              <p className="text-red-100">
                Saved on{" "}
                {new Date(selectedRecipe.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {selectedRecipe.ingredients && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Ingredients</h3>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {typeof selectedRecipe.ingredients === "string"
                      ? selectedRecipe.ingredients
                      : JSON.stringify(selectedRecipe.ingredients, null, 2)}
                  </p>
                </div>
              )}

              {selectedRecipe.instructions && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">
                    Instructions
                  </h3>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {selectedRecipe.instructions}
                  </p>
                </div>
              )}

              {selectedRecipe.confidenceScore && (
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    Confidence Score: {selectedRecipe.confidenceScore}%
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="flex-1 rounded-lg bg-slate-100 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleRemoveFavorite(selectedRecipe.id);
                    setSelectedRecipe(null);
                  }}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-500 transition flex items-center justify-center gap-2"
                >
                  <FaTrash className="text-sm" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FavoriteRecipes;
