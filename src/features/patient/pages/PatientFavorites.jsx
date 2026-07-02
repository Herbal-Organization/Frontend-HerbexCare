import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBookOpen,
  FaHeart,
  FaLeaf,
  FaRegHeart,
  FaSeedling,
  FaShoppingBag,
  FaUserMd,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  getMyHerbsFavorites,
  getMyHerbalistsFavorites,
  getMyRecipesFavorites,
  toggleFavorite,
} from "@api/favorites";
import { getHerbById } from "@api/herbs";
import { getHerbalistById } from "@api/herbalists";
import {
  HerbCard,
  HerbalistFavoriteCard,
  RecipeCard,
} from "@components/features/browse";
import { normalizeHerb } from "@features/browse/services/herbs";
import {
  extractFavoriteItems,
  normalizeHerbalist,
} from "@features/browse/services/herbalists";
import { getRecipeById } from "@api/recipes";
import { normalizeRecipe } from "@features/browse/services/recipes";
import { getFavoriteOrders, markOrderAsFavorite } from "@api/orders";
import { PatientOrderCard } from "@components/common";

function extractItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeRecipeFavorite(item) {
  const recipe = item?.recipe || item;

  // Inject fallback dates so normalizeRecipe can format them
  const recipeToNormalize = {
    ...recipe,
    createdDate:
      recipe?.createdDate ||
      item?.createdDate ||
      item?.favoritedAt ||
      item?.savedDate ||
      null,
  };

  const normalized = normalizeRecipe(recipeToNormalize);

  return {
    ...normalized,
    recipeId: normalized.id, // Ensure recipeId is available if needed
  };
}

function normalizeHerbFavorite(item) {
  const herb = item?.herb || item;
  const normalized = normalizeHerb(herb);

  return {
    ...normalized,
    createdDate:
      herb?.createdDate ||
      item?.createdDate ||
      item?.favoritedAt ||
      item?.savedDate ||
      null,
  };
}

function normalizeHerbalistFavorite(item) {
  const herbalist = item?.herbalist || item;
  const normalized = normalizeHerbalist(herbalist);

  return {
    ...normalized,
    createdDate:
      herbalist?.createdDate ||
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
  const [herbalistFavorites, setHerbalistFavorites] = useState([]);
  const [orderFavorites, setOrderFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [recipesResponse, herbsResponse, herbalistsResponse, ordersResponse] =
          await Promise.all([
            getMyRecipesFavorites(),
            getMyHerbsFavorites(),
            getMyHerbalistsFavorites(),
            getFavoriteOrders(),
          ]);

        const recipesList = extractItems(recipesResponse);
        const detailedRecipes = await Promise.all(
          recipesList.map(async (item) => {
            const recipeId = item.targetId || item.recipeId;
            if (recipeId) {
              try {
                const details = await getRecipeById(recipeId);
                return { ...item, recipe: details };
              } catch (err) {
                console.error(
                  `Failed to fetch details for recipe ${recipeId}:`,
                  err,
                );
                return item;
              }
            }
            return item;
          }),
        );

        const recipes = detailedRecipes
          .map(normalizeRecipeFavorite)
          .filter((item) => item.id || item.recipeId);

        const herbsList = extractItems(herbsResponse);
        const detailedHerbs = await Promise.all(
          herbsList.map(async (item) => {
            const herbId = item.targetId || item.herbId;
            if (herbId) {
              try {
                const details = await getHerbById(herbId);
                return { ...item, herb: details };
              } catch (err) {
                console.error(
                  `Failed to fetch details for herb ${herbId}:`,
                  err,
                );
                return item;
              }
            }
            return item;
          }),
        );

        const herbs = detailedHerbs
          .map(normalizeHerbFavorite)
          .filter((item) => item.herbId);

        const herbalistsList = extractFavoriteItems(herbalistsResponse);
        const detailedHerbalists = await Promise.all(
          herbalistsList.map(async (item) => {
            const herbalistId = item.targetId || item.herbalistId;
            if (herbalistId) {
              try {
                const details = await getHerbalistById(herbalistId);
                return { ...item, herbalist: details };
              } catch (err) {
                console.error(
                  `Failed to fetch details for herbalist ${herbalistId}:`,
                  err,
                );
                return item;
              }
            }
            return item;
          }),
        );

        const herbalists = detailedHerbalists
          .map(normalizeHerbalistFavorite)
          .filter((item) => item.herbalistId);

        const orders = extractItems(ordersResponse);

        setRecipeFavorites(recipes);
        setHerbFavorites(herbs);
        setHerbalistFavorites(herbalists);
        setOrderFavorites(orders);
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

  const sortedHerbalists = useMemo(
    () =>
      [...herbalistFavorites].sort((a, b) => {
        const aDate = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const bDate = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return bDate - aDate;
      }),
    [herbalistFavorites],
  );

  const sortedOrders = useMemo(
    () =>
      [...orderFavorites].sort((a, b) => {
        const aDate =
          a.orderDate || a.createdAt
            ? new Date(a.orderDate || a.createdAt).getTime()
            : 0;
        const bDate =
          b.orderDate || b.createdAt
            ? new Date(b.orderDate || b.createdAt).getTime()
            : 0;
        return bDate - aDate;
      }),
    [orderFavorites],
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

  const handleRemoveHerbalistFavorite = async (herbalistId) => {
    const id = Number(herbalistId || 0);
    if (!id || busyKey) return;

    setBusyKey(`herbalist-${id}`);
    try {
      await toggleFavorite({ targetId: id, type: "Herbalist" });
      setHerbalistFavorites((current) =>
        current.filter((item) => Number(item.herbalistId) !== id),
      );
      toast.success("Herbalist removed from favorites.");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to update herbalist favorite.";
      toast.error(message);
    } finally {
      setBusyKey("");
    }
  };

  const handleRemoveOrderFavorite = async (orderId) => {
    const id = Number(orderId || 0);
    if (!id || busyKey) return;

    setBusyKey(`order-${id}`);
    try {
      await markOrderAsFavorite(id);
      setOrderFavorites((current) =>
        current.filter((order) => Number(order.orderId || order.id) !== id),
      );
      toast.success("Order removed from favorites.");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to update order favorite.";
      toast.error(message);
    } finally {
      setBusyKey("");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Loading Favorites
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-rose-100 dark:bg-rose-900/30 p-3 text-rose-600 dark:text-rose-400">
            <FaHeart className="text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Favorites
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Manage your favorite recipes, herbs, herbalists, and orders in one
              place.
            </p>
          </div>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-20 shadow-sm rounded-t-2xl">
          <div className="flex gap-1 overflow-x-auto px-2">
            <button
              type="button"
              onClick={() => setActiveTab("recipes")}
              className={`px-6 py-4 font-semibold text-sm transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "recipes"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <FaLeaf className="text-base" />
              Herbs ({sortedHerbs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("herbalists")}
              className={`px-6 py-4 font-semibold text-sm transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "herbalists"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <FaUserMd className="text-base" />
              Herbalists ({sortedHerbalists.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-4 font-semibold text-sm transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "orders"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <FaShoppingBag className="text-base" />
              Orders ({sortedOrders.length})
            </button>
          </div>
        </div>

        <div className="rounded-b-2xl border border-t-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8">
          {error ? (
            <div className="rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-6 text-center">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
            </div>
          ) : null}

          {!error && activeTab === "recipes" ? (
            sortedRecipes.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-14 text-center">
                <FaBookOpen className="mx-auto text-4xl text-slate-300 dark:text-slate-600" />
                <h2 className="mt-4 text-xl font-bold text-slate-700 dark:text-slate-300">
                  No Favorite Recipes Yet
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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
                  const currentKey = `recipe-${recipe.id || recipe.recipeId}`;
                  const isBusy = busyKey === currentKey;
                  return (
                    <RecipeCard
                      key={recipe.id || recipe.recipeId}
                      id={recipe.id}
                      recipeId={recipe.recipeId}
                      title={recipe.title}
                      targetedDiseases={recipe.targetedDiseases}
                      createdDate={recipe.createdDate}
                      averageRating={recipe.averageRating}
                      price={recipe.price}
                      isFavorite={true}
                      onToggleFavorite={() =>
                        handleRemoveRecipeFavorite(recipe.id || recipe.recipeId)
                      }
                      isFavoriteUpdating={isBusy}
                    />
                  );
                })}
              </div>
            )
          ) : null}

          {!error && activeTab === "herbs" ? (
            sortedHerbs.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-14 text-center">
                <FaSeedling className="mx-auto text-4xl text-slate-300 dark:text-slate-600" />
                <h2 className="mt-4 text-xl font-bold text-slate-700 dark:text-slate-300">
                  No Favorite Herbs Yet
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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
                    <HerbCard
                      key={herb.herbId}
                      herb={herb}
                      isFavorite={true}
                      onToggleFavorite={() =>
                        handleRemoveHerbFavorite(herb.herbId)
                      }
                      isFavoriteUpdating={isBusy}
                    />
                  );
                })}
              </div>
            )
          ) : null}

          {!error && activeTab === "herbalists" ? (
            sortedHerbalists.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-14 text-center">
                <FaUserMd className="mx-auto text-4xl text-slate-300 dark:text-slate-600" />
                <h2 className="mt-4 text-xl font-bold text-slate-700 dark:text-slate-300">
                  No Favorite Herbalists Yet
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Save herbalists from the directory or when browsing herb
                  providers.
                </p>
                <Link
                  to="/patient/home/herbalists"
                  className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Browse Herbalists
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {sortedHerbalists.map((herbalist) => {
                  const currentKey = `herbalist-${herbalist.herbalistId}`;
                  const isBusy = busyKey === currentKey;
                  return (
                    <HerbalistFavoriteCard
                      key={herbalist.herbalistId}
                      herbalist={herbalist}
                      isFavorite={true}
                      onToggleFavorite={() =>
                        handleRemoveHerbalistFavorite(herbalist.herbalistId)
                      }
                      isFavoriteUpdating={isBusy}
                    />
                  );
                })}
              </div>
            )
          ) : null}

          {!error && activeTab === "orders" ? (
            sortedOrders.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-14 text-center">
                <FaShoppingBag className="mx-auto text-4xl text-slate-300 dark:text-slate-600" />
                <h2 className="mt-4 text-xl font-bold text-slate-700 dark:text-slate-300">
                  No Favorite Orders Yet
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Mark orders as favorites to see them here.
                </p>
                <Link
                  to="/patient/dashboard/orders"
                  className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  My Orders
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedOrders.map((order) => {
                  const orderId = order.orderId || order.id;
                  const isBusy = busyKey === `order-${orderId}`;

                  return (
                    <PatientOrderCard
                      key={orderId}
                      order={order}
                      isBusy={isBusy}
                      onToggleFavorite={handleRemoveOrderFavorite}
                    />
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
