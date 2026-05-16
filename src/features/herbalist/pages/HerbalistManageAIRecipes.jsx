import { useEffect, useMemo, useState } from "react";
import {
  FaRobot,
  FaSearch,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaListUl,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { getMyAIRecipesFavorites } from "@api/favorites";
import {
  addInventoryAIRecipes,
  getMyInventoryAIRecipes,
} from "@api/inventoryAIRecipes";
import { normalizeGeneratedRecipe } from "@features/patient/pages/ai-pages/aiConsultationUtils";

const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getAiRecipeId = (recipe) => {
  const candidate = Number(
    recipe?.aiRecipeId || recipe?.targetId || recipe?.recipeId || recipe?.id || 0,
  );
  return Number.isFinite(candidate) && candidate > 0 ? candidate : null;
};

function HerbalistManageAIRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [inventoryRecipeIds, setInventoryRecipeIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRecipeForInventory, setSelectedRecipeForInventory] =
    useState(null);
  const [price, setPrice] = useState("");
  const [isAddingToInventory, setIsAddingToInventory] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [favoritesResponse, inventoryResponse] = await Promise.all([
        getMyAIRecipesFavorites(),
        getMyInventoryAIRecipes(),
      ]);

      const favoriteItems = extractArray(favoritesResponse);
      const inventoryItems = extractArray(inventoryResponse);

      const recipeIdsInInventory = new Set(
        inventoryItems
          .map((item) =>
            Number(
              item?.aiRecipeId ||
                item?.recipeId ||
                item?.targetId ||
                item?.id ||
                0,
            ),
          )
          .filter((value) => Number.isFinite(value) && value > 0),
      );

      setRecipes(favoriteItems);
      setInventoryRecipeIds(recipeIdsInInventory);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load AI recipes.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;
    const query = searchQuery.toLowerCase().trim();

    return recipes.filter((recipe) => {
      const normalized = normalizeGeneratedRecipe(recipe);
      const title = (normalized.title || "").toLowerCase();
      const condition = (normalized.condition || "").toLowerCase();
      return title.includes(query) || condition.includes(query);
    });
  }, [recipes, searchQuery]);

  const openInventoryModal = (recipe) => {
    setSelectedRecipeForInventory(recipe);
    setPrice("");
  };

  const closeInventoryModal = () => {
    setSelectedRecipeForInventory(null);
    setPrice("");
  };

  const handleAddToInventory = async (event) => {
    event.preventDefault();
    if (!selectedRecipeForInventory) return;

    const aiRecipeId = getAiRecipeId(selectedRecipeForInventory);
    if (!aiRecipeId) {
      toast.error("Invalid AI recipe id.");
      return;
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid price greater than 0.");
      return;
    }

    setIsAddingToInventory(true);
    try {
      await addInventoryAIRecipes({
        aiRecipeId,
        price: parsedPrice,
      });

      toast.success("AI recipe added to inventory successfully!");
      setInventoryRecipeIds((current) => new Set([...current, aiRecipeId]));
      closeInventoryModal();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to add AI recipe to inventory. It may already exist.";
      toast.error(message);
    } finally {
      setIsAddingToInventory(false);
    }
  };

  const renderRecipeCard = (recipe, index) => {
    const normalized = normalizeGeneratedRecipe(recipe);
    const aiRecipeId = getAiRecipeId(recipe);
    const isInInventory = aiRecipeId ? inventoryRecipeIds.has(aiRecipeId) : false;

    return (
      <motion.div
        key={aiRecipeId || index}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group relative flex flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-[0_10px_40px_rgb(0,0,0,0.06)]"
      >
        <div className="absolute inset-0 bg-linear-to-br from-emerald-50/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                <FaRobot className="text-xl" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-extrabold text-slate-900">
                  {normalized.title || "AI Recipe"}
                </h3>
                {normalized.condition ? (
                  <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {normalized.condition}
                  </p>
                ) : null}
              </div>
            </div>

            {isInInventory ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                <FaCheckCircle /> Listed
              </span>
            ) : null}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Preparation Steps
            </p>
            {normalized.preparationInstructions.length > 0 ? (
              <ul className="space-y-2 text-sm font-medium leading-relaxed text-slate-700">
                {normalized.preparationInstructions.slice(0, 3).map((step, idx) => (
                  <li key={idx} className="line-clamp-1">
                    {idx + 1}. {step}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-medium text-slate-500">
                No preparation steps available.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => openInventoryModal(recipe)}
            disabled={isInInventory || !aiRecipeId}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
          >
            <FaPlus className="text-xs text-emerald-400" />
            {isInInventory ? "Already in Inventory" : "Add to Inventory"}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 shadow-inner">
              <FaListUl className="text-2xl" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Manage AI Recipes
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
            Review your available AI recipes and publish them to inventory with a custom price.
          </p>
        </div>

        <div className="group relative w-full md:w-96">
          <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-5 text-slate-400 group-focus-within:text-emerald-500">
            <FaSearch />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search AI recipes..."
            className="block w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-4xl border-2 border-slate-100 bg-white py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Loading AI recipes...
          </p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="rounded-4xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
          <FaRobot className="mx-auto mb-4 text-5xl text-slate-300" />
          <p className="text-xl font-bold text-slate-700">No AI recipes found</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Add AI recipes to your favorites first, then manage and list them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecipes.map((recipe, index) => renderRecipeCard(recipe, index))}
        </div>
      )}

      <AnimatePresence>
        {selectedRecipeForInventory ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-8 py-5">
                <h3 className="text-xl font-extrabold text-slate-900">Add AI Recipe to Inventory</h3>
                <button
                  type="button"
                  onClick={closeInventoryModal}
                  disabled={isAddingToInventory}
                  className="rounded-full bg-white p-2 text-slate-400 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-700"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAddToInventory} className="p-8">
                <div className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700/70">
                    Selected Recipe
                  </p>
                  <p className="truncate text-lg font-black text-slate-900">
                    {normalizeGeneratedRecipe(selectedRecipeForInventory).title}
                  </p>
                </div>

                <div className="mb-8">
                  <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-slate-700">
                    Selling Price
                  </label>
                  <div className="relative">
                    <span className="absolute inset-s-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">
                      EGP
                    </span>
                    <input
                      autoFocus
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      placeholder="Set selling price"
                      className="block w-full rounded-2xl border-2 border-slate-200/60 py-4 ps-14 pe-4 text-lg font-black text-slate-900 outline-none transition-all placeholder:font-medium placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      disabled={isAddingToInventory}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isAddingToInventory || !price}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 font-bold text-white shadow-[0_8px_20px_rgb(15,23,42,0.2)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {isAddingToInventory ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    ) : (
                      <>
                        <FaPlus className="text-xs text-emerald-400" /> Confirm Listing
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={closeInventoryModal}
                    disabled={isAddingToInventory}
                    className="flex h-14 w-full items-center justify-center rounded-2xl border-2 border-slate-100 bg-white font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default HerbalistManageAIRecipes;
