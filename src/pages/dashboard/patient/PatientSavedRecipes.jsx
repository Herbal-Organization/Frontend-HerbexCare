import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaExclamationCircle, FaFlask } from "react-icons/fa";
import { getFavoriteOrders } from "../../../api/orders";

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

  const savedRecipes = useMemo(() => {
    const recipeMap = new Map();

    for (const order of favoriteOrders) {
      const orderId = order.orderId || order.id;
      const orderDate = order.orderDate || order.createdAt || null;
      const recipes = Array.isArray(order.recipes) ? order.recipes : [];

      for (const recipe of recipes) {
        const recipeId = recipe.recipeId || recipe.id;
        if (!recipeId) continue;

        const current = recipeMap.get(recipeId);
        const quantity = Number(recipe.quantity) || 0;
        const recipeName = recipe.recipeName || `Recipe #${recipeId}`;

        if (!current) {
          recipeMap.set(recipeId, {
            recipeId,
            recipeName,
            totalQuantity: quantity,
            savedInOrdersCount: 1,
            lastOrderId: orderId,
            lastOrderDate: orderDate,
          });
          continue;
        }

        current.totalQuantity += quantity;
        current.savedInOrdersCount += 1;

        const prevDate = current.lastOrderDate
          ? new Date(current.lastOrderDate).getTime()
          : 0;
        const nextDate = orderDate ? new Date(orderDate).getTime() : 0;
        if (nextDate >= prevDate) {
          current.lastOrderDate = orderDate;
          current.lastOrderId = orderId;
        }
      }
    }

    return Array.from(recipeMap.values()).sort((a, b) => {
      const aDate = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
      const bDate = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
      return bDate - aDate;
    });
  }, [favoriteOrders]);

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
        <div className="mb-8 rounded-3xl border border-red-100 bg-red-50 p-8 shadow-sm text-center">
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

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-semibold">Total quantity:</span>{" "}
                  {recipe.totalQuantity}
                </p>
                <p>
                  <span className="font-semibold">Saved in orders:</span>{" "}
                  {recipe.savedInOrdersCount}
                </p>
                {recipe.lastOrderDate ? (
                  <p>
                    <span className="font-semibold">Last saved:</span>{" "}
                    {new Date(recipe.lastOrderDate).toLocaleDateString()}
                  </p>
                ) : null}
              </div>

              {recipe.lastOrderId ? (
                <Link
                  to={`/patient/dashboard/orders/${recipe.lastOrderId}`}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  View Latest Order
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientSavedRecipes;
