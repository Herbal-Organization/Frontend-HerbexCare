import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBookOpen,
  FaExclamationCircle,
  FaFlask,
  FaTrash,
} from "react-icons/fa";
import { getFavoriteOrders } from "@api/orders";

function extractOrdersArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function PatientSavedRecipes() {
  const [favoriteOrders, setFavoriteOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFavoriteOrders = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getFavoriteOrders();
        setFavoriteOrders(extractOrdersArray(response));
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

    loadFavoriteOrders();
  }, []);

  const savedRecipes = useMemo(
    () =>
      favoriteOrders
        .flatMap((order) => {
          const orderId = order.orderId || order.id;
          const orderDate = order.orderDate || order.createdAt || null;
          const recipes = Array.isArray(order.recipes) ? order.recipes : [];

          return recipes.map((recipe) => ({
            recipeId: recipe.recipeId || recipe.id,
            recipeName:
              recipe.recipeName ||
              recipe.title ||
              `Recipe #${recipe.recipeId || recipe.id}`,
            description: recipe.description || "",
            savedDate: orderDate,
            rating: recipe.rating ?? recipe.averageRating,
            orderId,
          }));
        })
        .filter((item) => item.recipeId)
        .sort((a, b) => {
          const aDate = a.savedDate ? new Date(a.savedDate).getTime() : 0;
          const bDate = b.savedDate ? new Date(b.savedDate).getTime() : 0;
          return bDate - aDate;
        }),
    [favoriteOrders],
  );

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
          Recipes collected from your favorite orders.
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
            Favorite an order that contains recipes to see them here.
          </p>
          <Link
            to="/patient/dashboard/orders"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 shadow-md"
          >
            Go to Orders
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
                    <span className="font-semibold">Rating:</span>{" "}
                    {recipe.rating}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  to={`/patient/dashboard/orders/${recipe.orderId}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  View Latest Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientSavedRecipes;
