import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaListUl,
  FaComments,
  FaEye,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { fetchAiChatCatalog, fetchAiChatCatalogById } from "@api/aiChat";
import {
  getMyInventoryAiChatRecipes,
  addInventoryAiChatRecipe,
  updateInventoryAiChatRecipePrice,
  toggleInventoryAiChatRecipeStatus,
  removeInventoryAiChatRecipe,
} from "@api/inventoryAiChatRecipes";
import { normalizeGeneratedRecipe } from "@features/patient/pages/ai-pages/aiConsultationUtils";
import AiChatRecipeReviewsSection from "@features/patient/pages/ai-chat/AiChatRecipeReviewsSection";

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

/** Inventory row id (for price / status / delete) — not the catalog recipe id */
const getInventoryItemId = (item) => {
  const candidate =
    item?.inventoryAiChatRecipeId ??
    item?.inventoryId ??
    item?.id;
  return candidate !== undefined && candidate !== null && candidate !== ""
    ? String(candidate)
    : null;
};

const getInventoryLinkedRecipeId = (item) =>
  getAiRecipeId({
    aiChatRecipeId: item?.aiChatRecipeId,
    aiRecipeId: item?.aiRecipeId,
    targetId: item?.targetId,
    recipeId: item?.recipeId,
  });

const isInventoryItemActive = (item) => {
  if (item?.isBlocked === true) return false;
  if (item?.isActive === true) return true;
  if (item?.isActive === false) return false;

  const status = String(item?.status || "").toLowerCase();
  if (status === "active") return true;
  if (status === "inactive" || status === "blocked") return false;

  return true;
};

const withInventoryItemActiveState = (item, isActive) => ({
  ...item,
  isActive,
  isBlocked: !isActive,
  status: isActive ? "Active" : "Inactive",
});

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
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [price, setPrice] = useState("");
  const [isAddingToInventory, setIsAddingToInventory] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [togglingInventoryIds, setTogglingInventoryIds] = useState([]);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

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
        invItems.map(getInventoryLinkedRecipeId).filter(Boolean),
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

  const openInventoryModal = (
    recipe,
    existingPrice = "",
    isEdit = false,
    inventoryItem = null,
  ) => {
    setSelectedRecipeForInventory(recipe);
    setSelectedInventoryItem(inventoryItem);
    setPrice(String(existingPrice ?? ""));
    setIsEditingPrice(isEdit);
  };

  const closeInventoryModal = () => {
    setSelectedRecipeForInventory(null);
    setSelectedInventoryItem(null);
    setPrice("");
    setIsEditingPrice(false);
  };

  const openCatalogDetail = async (recipe) => {
    const aiRecipeId = getAiRecipeId(recipe);
    if (!aiRecipeId) return;

    setIsDetailOpen(true);
    setDetailRecipe(recipe);
    setIsDetailLoading(true);

    try {
      const data = await fetchAiChatCatalogById(aiRecipeId);
      setDetailRecipe(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          "Failed to load recipe details.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeCatalogDetail = () => {
    setIsDetailOpen(false);
    setDetailRecipe(null);
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
        const inventoryId = getInventoryItemId(selectedInventoryItem);
        if (!inventoryId) {
          toast.error("Invalid inventory item.");
          return;
        }

        await updateInventoryAiChatRecipePrice(inventoryId, parsedPrice);
        toast.success("Price updated successfully!");
      } else {
        await addInventoryAiChatRecipe(aiRecipeId, parsedPrice);
        toast.success("AI Chat recipe added to inventory successfully!");
      }

      closeInventoryModal();
      await loadData();
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

  const handleRemoveFromInventory = async (item) => {
    const inventoryId = getInventoryItemId(item);
    if (!inventoryId) {
      toast.error("Invalid inventory item.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to remove this recipe from your inventory?",
      )
    ) {
      return;
    }

    try {
      await removeInventoryAiChatRecipe(inventoryId);
      toast.success("Removed from inventory.");
      await loadData();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to remove from inventory.";
      toast.error(message);
    }
  };

  const handleToggleInventoryStatus = async (item) => {
    const inventoryId = getInventoryItemId(item);
    if (!inventoryId || togglingInventoryIds.includes(inventoryId)) return;

    const currentlyActive = isInventoryItemActive(item);
    const nextActive = !currentlyActive;

    setTogglingInventoryIds((current) => [...current, inventoryId]);
    setInventoryItems((current) =>
      current.map((entry) =>
        getInventoryItemId(entry) === inventoryId
          ? withInventoryItemActiveState(entry, nextActive)
          : entry,
      ),
    );

    try {
      const response = await toggleInventoryAiChatRecipeStatus(inventoryId);
      toast.success(
        response?.message ||
          (nextActive ? "Recipe activated." : "Recipe deactivated."),
      );
    } catch (err) {
      setInventoryItems((current) =>
        current.map((entry) =>
          getInventoryItemId(entry) === inventoryId
            ? withInventoryItemActiveState(entry, currentlyActive)
            : entry,
        ),
      );
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Failed to update recipe status.";
      toast.error(message);
    } finally {
      setTogglingInventoryIds((current) =>
        current.filter((id) => id !== inventoryId),
      );
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

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => openCatalogDetail(recipe)}
              disabled={!aiRecipeId}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-700 transition-all hover:border-emerald-300 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-50"
            >
              <FaEye className="text-xs" />
              View Details
            </button>
            <button
              type="button"
              onClick={() => openInventoryModal(recipe, "", false)}
              disabled={isInInventory || !aiRecipeId}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
            >
              <FaPlus className="text-xs text-emerald-400" />
              {isInInventory ? "Listed" : "Add"}
            </button>
          </div>
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
              const recipeId = getInventoryLinkedRecipeId(item);
              const inventoryId = getInventoryItemId(item);
              const catalogItem = recipes.find(
                (r) => getAiRecipeId(r) === recipeId,
              );
              const recipeTitle = catalogItem
                ? getRecipeTitle(catalogItem)
                : item?.recommendedRecipeName ||
                  item?.recipeName ||
                  "AI Chat Recipe";
              const recipeSubtitle = catalogItem
                ? getRecipeSubtitle(catalogItem)
                : item?.category || "";
              const active = isInventoryItemActive(item);
              const isToggling = inventoryId
                ? togglingInventoryIds.includes(inventoryId)
                : false;

              return (
                <div
                  key={inventoryId || recipeId || index}
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
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Price
                          </p>
                          <p className="text-2xl font-black text-emerald-600">
                            {item.price} EGP
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Availability
                          </p>
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`text-[10px] font-bold uppercase ${
                                active ? "text-emerald-700" : "text-slate-500"
                              }`}
                            >
                              {active ? "Active" : "Inactive"}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={active}
                              aria-label={
                                active
                                  ? "Deactivate recipe in inventory"
                                  : "Activate recipe in inventory"
                              }
                              disabled={isToggling || !inventoryId}
                              onClick={() => handleToggleInventoryStatus(item)}
                              className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                                active ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  active ? "translate-x-5" : "translate-x-0.5"
                                } ${isToggling ? "opacity-70" : ""}`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openInventoryModal(
                            catalogItem || {
                              aiChatRecipeId: recipeId,
                              id: recipeId,
                            },
                            item.price,
                            true,
                            item,
                          )
                        }
                        className="flex h-10 items-center justify-center gap-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Edit Price
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          catalogItem
                            ? openCatalogDetail(catalogItem)
                            : recipeId &&
                              openCatalogDetail({
                                aiChatRecipeId: recipeId,
                              })
                        }
                        className="col-span-2 flex h-10 items-center justify-center gap-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <FaEye className="text-[10px]" />
                        View Catalog Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromInventory(item)}
                        className="col-span-2 flex h-10 items-center justify-center gap-1 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Remove from Inventory
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
        {isDetailOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-md sm:items-center"
          >
            <motion.div
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                    Catalog Recipe
                  </p>
                  <h3 className="mt-1 truncate text-xl font-black text-slate-900">
                    {detailRecipe?.recommendedRecipeName ||
                      getRecipeTitle(detailRecipe || {})}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeCatalogDetail}
                  className="rounded-full bg-white p-2 text-slate-400 shadow-sm hover:bg-slate-100 hover:text-slate-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="max-h-[calc(90vh-5rem)] overflow-y-auto p-6">
                {isDetailLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
                  </div>
                ) : (
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                      <dt className="text-xs font-bold uppercase text-slate-400">
                        Main herb
                      </dt>
                      <dd className="mt-1 font-bold text-slate-900">
                        {detailRecipe?.mainHerb || "—"}
                      </dd>
                      <dd className="text-sm text-slate-500">
                        {detailRecipe?.scientificName || ""}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <dt className="text-xs font-bold uppercase text-slate-400">
                        Category
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-800">
                        {detailRecipe?.category || "—"}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <dt className="text-xs font-bold uppercase text-slate-400">
                        Dosage
                      </dt>
                      <dd className="mt-1 text-sm text-slate-700">
                        {detailRecipe?.dosage || "—"}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                      <dt className="text-xs font-bold uppercase text-slate-400">
                        Preparation
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-slate-700">
                        {detailRecipe?.preparation || "—"}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-rose-50/70 p-4 sm:col-span-2">
                      <dt className="text-xs font-bold uppercase text-rose-700">
                        Contraindications
                      </dt>
                      <dd className="mt-1 text-sm text-rose-900/80">
                        {detailRecipe?.contraindications || "—"}
                      </dd>
                    </div>
                  </dl>
                )}

                {!isDetailLoading && getAiRecipeId(detailRecipe) ? (
                  <div className="mt-8">
                    <AiChatRecipeReviewsSection
                      recipeId={getAiRecipeId(detailRecipe)}
                    />
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
