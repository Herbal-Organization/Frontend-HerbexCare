import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBookOpen,
  FaHeart,
  FaLeaf,
  FaRegHeart,
  FaSeedling,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  getMyHerbsFavorites,
  getMyRecipesFavorites,
  toggleFavorite,
} from "@api/favorites";

function extractItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeRecipeFavorite(item) {
  const recipe = item?.recipe || item;
  const recipeId = Number(
    recipe?.recipeId || recipe?.id || item?.targetId || item?.recipeId || 0,
  );

  return {
    recipeId,
    title:
      recipe?.recipeName ||
      recipe?.title ||
      recipe?.description ||
      `Recipe #${recipeId || "-"}`,
    description:
      recipe?.instructions ||
      recipe?.description ||
      item?.description ||
      "No preparation instructions available.",
    averageRating:
      recipe?.averageRating ?? recipe?.rating ?? item?.averageRating ?? null,
    price: Number(recipe?.price ?? item?.price ?? 0),
    createdDate:
      recipe?.createdDate ||
      item?.createdDate ||
      item?.favoritedAt ||
      item?.savedDate ||
      null,
  };
}

function normalizeHerbFavorite(item) {
  const herb = item?.herb || item;
  const herbId = Number(
    herb?.herbId || herb?.id || item?.targetId || item?.herbId || 0,
  );

  return {
    herbId,
    herbName: herb?.herbName || herb?.name || `Herb #${herbId || "-"}`,
    scientificName: herb?.scientificName || "Scientific name not available",
    description: herb?.description || "No description available.",
    benefits: herb?.benefits || "",
    imageURL: herb?.imageURL || herb?.imageUrl || "",
    createdDate:
      herb?.createdDate ||
      item?.createdDate ||
      item?.favoritedAt ||
      item?.savedDate ||
      null,
  };
}

function PatientFavorites() {
  const [activeTab, setActiveTab] = useState("recipes");
  const [recipeFavorites, setRecipeFavorites] = useState([]);
  const [herbFavorites, setHerbFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [recipesResponse, herbsResponse] = await Promise.all([
          getMyRecipesFavorites(),
          getMyHerbsFavorites(),
        ]);

        const recipes = extractItems(recipesResponse)
          .map(normalizeRecipeFavorite)
          .filter((item) => item.recipeId);

        const herbs = extractItems(herbsResponse)
          .map(normalizeHerbFavorite)
          .filter((item) => item.herbId);

        setRecipeFavorites(recipes);
        setHerbFavorites(herbs);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.title ||
            "Unable to load favorites right now.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const sortedRecipes = useMemo(
    () =>
      [...recipeFavorites].sort((a, b) => {
        const aDate = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const bDate = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return bDate - aDate;
      }),
    [recipeFavorites],
  );

  const sortedHerbs = useMemo(
    () =>
      [...herbFavorites].sort((a, b) => {
        const aDate = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const bDate = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return bDate - aDate;
      }),
    [herbFavorites],
  );

  const handleRemoveRecipeFavorite = async (recipeId) => {
    const id = Number(recipeId || 0);
    if (!id || busyKey) return;

    setBusyKey(`recipe-${id}`);
    try {
      await toggleFavorite({ targetId: id, type: "Recipe" });
      setRecipeFavorites((current) =>
        current.filter((recipe) => Number(recipe.recipeId) !== id),
      );
      toast.success("Recipe removed from favorites.");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to update recipe favorite.";
      toast.error(message);
    } finally {
      setBusyKey("");
    }
  };

  const handleRemoveHerbFavorite = async (herbId) => {
    const id = Number(herbId || 0);
    if (!id || busyKey) return;

    setBusyKey(`herb-${id}`);
    try {
      await toggleFavorite({ targetId: id, type: "Herb" });
      setHerbFavorites((current) =>
        current.filter((herb) => Number(herb.herbId) !== id),
      );
      toast.success("Herb removed from favorites.");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to update herb favorite.";
      toast.error(message);
    } finally {
      setBusyKey("");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">
            Loading Favorites
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-rose-100 p-3 text-rose-600">
            <FaHeart className="text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Favorites
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Manage all your favorite recipes and herbs in one place.
            </p>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm rounded-t-2xl">
          <div className="flex gap-1 overflow-x-auto px-2">
            <button
              type="button"
              onClick={() => setActiveTab("recipes")}
              className={`px-6 py-4 font-semibold text-sm transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "recipes"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaBookOpen className="text-base" />
              Recipes ({sortedRecipes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("herbs")}
              className={`px-6 py-4 font-semibold text-sm transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "herbs"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaLeaf className="text-base" />
              Herbs ({sortedHerbs.length})
            </button>
          </div>
        </div>

        <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-6 sm:p-8">
          {error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          ) : null}

          {!error && activeTab === "recipes" ? (
            sortedRecipes.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-14 text-center">
                <FaBookOpen className="mx-auto text-4xl text-slate-300" />
                <h2 className="mt-4 text-xl font-bold text-slate-700">
                  No Favorite Recipes Yet
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Add recipes to favorites from the recipe library.
                </p>
                <Link
                  to="/patient/home/recipes"
                  className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Browse Recipes
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {sortedRecipes.map((recipe) => {
                  const currentKey = `recipe-${recipe.recipeId}`;
                  const isBusy = busyKey === currentKey;
                  return (
                    <div
                      key={recipe.recipeId}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Recipe #{recipe.recipeId}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveRecipeFavorite(recipe.recipeId)
                          }
                          disabled={isBusy}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                            isBusy
                              ? "border-slate-200 bg-slate-100 text-slate-400"
                              : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                          }`}
                        >
                          <FaHeart className="text-[10px]" />
                          {isBusy ? "Updating" : "Unfavorite"}
                        </button>
                      </div>

                      <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                        {recipe.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-500">
                        {recipe.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {recipe.averageRating != null
                            ? `Rating: ${Number(recipe.averageRating).toFixed(1)}`
                            : "No rating yet"}
                        </span>
                        <span>
                          Price: ${Number(recipe.price || 0).toFixed(0)}
                        </span>
                      </div>

                      <Link
                        to={`/patient/home/recipes/${recipe.recipeId}`}
                        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        View Recipe
                      </Link>
                    </div>
                  );
                })}
              </div>
            )
          ) : null}

          {!error && activeTab === "herbs" ? (
            sortedHerbs.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-14 text-center">
                <FaSeedling className="mx-auto text-4xl text-slate-300" />
                <h2 className="mt-4 text-xl font-bold text-slate-700">
                  No Favorite Herbs Yet
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Add herbs to favorites from the herb library.
                </p>
                <Link
                  to="/patient/home/herbs"
                  className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Browse Herbs
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {sortedHerbs.map((herb) => {
                  const currentKey = `herb-${herb.herbId}`;
                  const isBusy = busyKey === currentKey;
                  return (
                    <div
                      key={herb.herbId}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      {herb.imageURL ? (
                        <img
                          src={herb.imageURL}
                          alt={herb.herbName}
                          className="h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="h-44 w-full bg-[#EAF3DE]" />
                      )}

                      <div className="p-5">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {herb.herbName}
                          </h3>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveHerbFavorite(herb.herbId)
                            }
                            disabled={isBusy}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                              isBusy
                                ? "border-slate-200 bg-slate-100 text-slate-400"
                                : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                            }`}
                          >
                            <FaRegHeart className="text-[10px]" />
                            {isBusy ? "Updating" : "Unfavorite"}
                          </button>
                        </div>

                        <p className="text-xs italic text-slate-500">
                          {herb.scientificName}
                        </p>
                        <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                          {herb.description}
                        </p>

                        {herb.benefits ? (
                          <p className="mt-3 line-clamp-2 text-xs text-emerald-700">
                            <span className="font-bold">Benefits:</span>{" "}
                            {herb.benefits}
                          </p>
                        ) : null}

                        <Link
                          to={`/patient/home/herbs/${herb.herbId}`}
                          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                        >
                          View Herb
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PatientFavorites;
