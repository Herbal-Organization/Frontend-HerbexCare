import { useEffect, useMemo, useState } from "react";
import {
  FaRobot,
  FaSearch,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaListUl,
  FaComments,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { fetchAiChatCatalog } from "@api/aiChat";
import {
  getMyInventoryAiChatRecipes,
  addInventoryAiChatRecipe,
  updateInventoryAiChatRecipePrice,
  removeInventoryAiChatRecipe,
} from "@api/inventoryAiChatRecipes";
import { normalizeGeneratedRecipe } from "@features/patient/pages/ai-pages/aiConsultationUtils";

const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getAiRecipeId = (recipe) => {
  const candidate = 
    recipe?.aiChatRecipeId ||
    recipe?.aiRecipeId ||
    recipe?.targetId ||
    recipe?.recipeId ||
    recipe?.id;
  return candidate ? String(candidate) : null;
};

const getRecipeTitle = (recipe) => {
  const normalized = normalizeGeneratedRecipe(recipe);
  return (
    normalized.title ||
    recipe?.name ||
    recipe?.title ||
    recipe?.recipeName ||
    "AI Chat Recipe"
  );
};

const getRecipeSubtitle = (recipe) => {
  const normalized = normalizeGeneratedRecipe(recipe);
  return normalized.condition || recipe?.type || recipe?.description || "";
};

function HerbalistManageAIChatRecipes() {
  const [activeTab, setActiveTab] = useState("catalog");
  const [recipes, setRecipes] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryRecipeIds, setInventoryRecipeIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;

  const [selectedRecipeForInventory, setSelectedRecipeForInventory] = useState(null);
  const [price, setPrice] = useState("");
  const [isAddingToInventory, setIsAddingToInventory] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [catalogResponse, inventoryResponse] = await Promise.allSettled([
        fetchAiChatCatalog(currentPage, pageSize),
        getMyInventoryAiChatRecipes(),
      ]);

      let catalogItems = [];
      let invItems = [];

      if (catalogResponse.status === "fulfilled") {
        catalogItems = extractArray(catalogResponse.value);
        setRecipes(catalogItems);
        
        const total = catalogResponse.value?.totalPages || 
                      catalogResponse.value?.meta?.totalPages || 
                      Math.ceil((catalogResponse.value?.totalCount || catalogItems.length) / pageSize) || 1;
        setTotalPages(total);
      } else {
        throw catalogResponse.reason;
      }

      if (inventoryResponse.status === "fulfilled") {
        invItems = extractArray(inventoryResponse.value);
        setInventoryItems(invItems);
      } else {
        console.error("Failed to load inventory:", inventoryResponse.reason);
      }

      const recipeIdsInInventory = new Set(
        invItems
          .map(getAiRecipeId)
          .filter(Boolean)
      );

      setInventoryRecipeIds(recipeIdsInInventory);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load AI Chat recipes.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage]);

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

  const openInventoryModal = (recipe, existingPrice = "", isEdit = false) => {
    setSelectedRecipeForInventory(recipe);
    setPrice(String(existingPrice));
    setIsEditingPrice(isEdit);
  };

  const closeInventoryModal = () => {
    setSelectedRecipeForInventory(null);
    setPrice("");
    setIsEditingPrice(false);
  };

  const handleInventorySubmit = async (event) => {
    event.preventDefault();
    if (!selectedRecipeForInventory) return;

    const aiRecipeId = getAiRecipeId(selectedRecipeForInventory);
    if (!aiRecipeId) {
      toast.error("Invalid AI Chat recipe id.");
      return;
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid price greater than 0.");
      return;
    }

    setIsAddingToInventory(true);
    try {
      if (isEditingPrice) {
        await updateInventoryAiChatRecipePrice(aiRecipeId, parsedPrice);
        toast.success("Price updated successfully!");
        
        // Update local state
        setInventoryItems(current => 
          current.map(item => {
            const currentId = getAiRecipeId(item);
            if (currentId === aiRecipeId) {
              return { ...item, price: parsedPrice };
            }
            return item;
          })
        );
      } else {
        await addInventoryAiChatRecipe(aiRecipeId, parsedPrice);
        toast.success("AI Chat recipe added to inventory successfully!");
        setInventoryRecipeIds((current) => new Set([...current, aiRecipeId]));
        
        // Add to local state (optimistic)
        const newItem = {
          id: Date.now(), // temporary id
          aiRecipeId: aiRecipeId,
          price: parsedPrice,
          isActive: true
        };
        setInventoryItems(current => [...current, newItem]);
      }
      closeInventoryModal();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to save changes. Please try again.";
      toast.error(message);
    } finally {
      setIsAddingToInventory(false);
    }
  };

  const handleRemoveFromInventory = async (id) => {
    if (!window.confirm("Are you sure you want to remove this recipe from your inventory?")) return;
    try {
      await removeInventoryAiChatRecipe(id);
      toast.success("Removed from inventory.");
      
      const itemToRemove = inventoryItems.find(i => i.id === id);
      setInventoryItems(current => current.filter(item => item.id !== id));
      
      if (itemToRemove) {
        const recipeId = getAiRecipeId(itemToRemove);
        setInventoryRecipeIds(current => {
          const next = new Set(current);
          next.delete(recipeId);
          return next;
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to remove from inventory.";
      toast.error(message);
    }
  };

  const renderRecipeCard = (recipe, index) => {
    const normalized = normalizeGeneratedRecipe(recipe);
    const recipeTitle = getRecipeTitle(recipe);
    const recipeSubtitle = getRecipeSubtitle(recipe);
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
                <FaComments className="text-xl" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-extrabold text-slate-900">
                  {recipeTitle}
                </h3>
                {recipeSubtitle ? (
                  <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {recipeSubtitle}
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
              {normalized.preparationInstructions.length > 0
                ? "Preparation Steps"
                : "Recipe Summary"}
            </p>
            {normalized.preparationInstructions.length > 0 ? (
              <ul className="space-y-2 text-sm font-medium leading-relaxed text-slate-700">
                {normalized.preparationInstructions
                  .slice(0, 3)
                  .map((step, idx) => (
                    <li key={idx} className="line-clamp-1">
                      {idx + 1}. {step}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm font-medium text-slate-500">
                {recipe?.description || "No recipe summary available."}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => openInventoryModal(recipe, "", false)}
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
              AI Chat Recipes
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
            Browse your AI Chat catalog and add recipes to your inventory.
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
            placeholder="Search AI chat recipes by title or description..."
            className="block w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "catalog"
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Catalog ({recipes.length})
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "inventory"
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          My Inventory ({inventoryItems.length})
        </button>
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
            Loading Data...
          </p>
        </div>
      ) : activeTab === "catalog" ? (
        filteredRecipes.length === 0 ? (
          <div className="rounded-4xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
            <FaComments className="mx-auto mb-4 text-5xl text-slate-300" />
            <p className="text-xl font-bold text-slate-700">
              No AI chat recipes found
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Try a different search or reload the catalog.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredRecipes.map((recipe, index) =>
                renderRecipeCard(recipe, index),
              )}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  Previous
                </button>
                <span className="text-sm font-bold text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )
      ) : (
        /* Inventory Tab */
        inventoryItems.length === 0 ? (
          <div className="rounded-4xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
            <FaComments className="mx-auto mb-4 text-5xl text-slate-300" />
            <p className="text-xl font-bold text-slate-700">
              Your inventory is empty
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Add AI chat recipes from the catalog to see them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {inventoryItems.map((item, index) => {
              const recipeId = getAiRecipeId(item);
              const catalogItem = recipes.find(r => getAiRecipeId(r) === recipeId);
              const recipeTitle = catalogItem ? getRecipeTitle(catalogItem) : "AI Chat Recipe";
              const recipeSubtitle = catalogItem ? getRecipeSubtitle(catalogItem) : "";
              
              return (
                <div
                  key={item.id || index}
                  className="group relative flex flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-[0_10px_40px_rgb(0,0,0,0.06)]"
                >
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                          <FaComments className="text-xl" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-extrabold text-slate-900">
                            {recipeTitle}
                          </h3>
                          {recipeSubtitle ? (
                            <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {recipeSubtitle}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Price
                          </p>
                          <p className="text-2xl font-black text-emerald-600">
                            {item.price} EGP
                          </p>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {item.isActive !== false ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => openInventoryModal(catalogItem || { id: recipeId }, item.price, true)}
                        className="flex-1 flex h-10 items-center justify-center gap-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Edit Price
                      </button>
                      <button
                        onClick={() => handleRemoveFromInventory(item.id)}
                        className="flex-1 flex h-10 items-center justify-center gap-1 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
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
                <h3 className="text-xl font-extrabold text-slate-900">
                  {isEditingPrice ? "Edit Selling Price" : "Add AI Chat Recipe"}
                </h3>
                <button
                  type="button"
                  onClick={closeInventoryModal}
                  disabled={isAddingToInventory}
                  className="rounded-full bg-white p-2 text-slate-400 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-700"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleInventorySubmit} className="p-8">
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
                        <FaPlus className="text-xs text-emerald-400" /> {isEditingPrice ? "Update Price" : "Confirm Listing"}
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

export default HerbalistManageAIChatRecipes;
