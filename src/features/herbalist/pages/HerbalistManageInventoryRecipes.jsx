import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaListUl,
  FaEye,
} from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { getAllRecipes } from "@api/recipes";
import {
  getMyInventoryRecipes,
  addInventoryRecipe,
  updateInventoryRecipePrice,
  toggleInventoryRecipeStatus,
  deleteInventoryRecipe,
} from "@api/inventoryRecipes";

const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getRecipeId = (recipe) => {
  const candidate = recipe?.recipeId || recipe?.id;
  return candidate ? String(candidate) : null;
};

const getInventoryItemId = (item) => {
  const candidate =
    item?.inventoryRecipeId ?? item?.inventoryId ?? item?.id;
  return candidate !== undefined && candidate !== null && candidate !== ""
    ? String(candidate)
    : null;
};

const getInventoryLinkedRecipeId = (item) =>
  getRecipeId({ recipeId: item?.recipeId, id: item?.recipeId });

const isInventoryItemActive = (item) => {
  if (item?.isBlocked === true) return false;
  if (item?.isActive === true) return true;
  if (item?.isActive === false) return false;
  const status = String(item?.status || "").toLowerCase();
  if (status === "active") return true;
  if (status === "inactive" || status === "blocked") return false;
  return true;
};

function HerbalistManageInventoryRecipes() {
  const [activeTab, setActiveTab] = useState("catalog");
  const [recipes, setRecipes] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryRecipeIds, setInventoryRecipeIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState([]);
  const [priceInputs, setPriceInputs] = useState({});
  const [detailItem, setDetailItem] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catalogRes, inventoryRes] = await Promise.allSettled([
        getAllRecipes(1, 200),
        getMyInventoryRecipes(),
      ]);

      const catalogItems =
        catalogRes.status === "fulfilled"
          ? extractArray(catalogRes.value)
          : [];
      const invItems =
        inventoryRes.status === "fulfilled"
          ? extractArray(inventoryRes.value)
          : [];

      setRecipes(catalogItems);
      setInventoryItems(invItems);
      setInventoryRecipeIds(
        new Set(invItems.map(getInventoryLinkedRecipeId).filter(Boolean)),
      );
    } catch {
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isProcessing = (id) => processingIds.includes(String(id));

  const withProcessing = async (id, fn) => {
    const key = String(id);
    setProcessingIds((p) => [...p, key]);
    try {
      await fn();
    } finally {
      setProcessingIds((p) => p.filter((x) => x !== key));
    }
  };

  const handleAddToInventory = async (recipe) => {
    const recipeId = getRecipeId(recipe);
    if (!recipeId) return;

    const price = parseFloat(priceInputs[recipeId]);
    if (!price || price <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    await withProcessing(recipeId, async () => {
      try {
        await addInventoryRecipe(parseInt(recipeId, 10), price);
        toast.success(`"${recipe.recipeName || recipe.name}" added to inventory.`);
        await loadData();
        setPriceInputs((p) => ({ ...p, [recipeId]: "" }));
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to add to inventory.",
        );
      }
    });
  };

  const handleUpdatePrice = async (item) => {
    const invId = getInventoryItemId(item);
    if (!invId) return;

    const newPrice = parseFloat(priceInputs[`inv-${invId}`]);
    if (!newPrice || newPrice <= 0) {
      toast.error("Enter a valid price.");
      return;
    }

    await withProcessing(invId, async () => {
      try {
        await updateInventoryRecipePrice(invId, newPrice);
        toast.success("Price updated.");
        setInventoryItems((prev) =>
          prev.map((i) =>
            getInventoryItemId(i) === invId ? { ...i, price: newPrice } : i,
          ),
        );
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to update price.",
        );
      }
    });
  };

  const handleToggleStatus = async (item) => {
    const invId = getInventoryItemId(item);
    if (!invId) return;

    await withProcessing(invId, async () => {
      try {
        await toggleInventoryRecipeStatus(invId);
        const nextActive = !isInventoryItemActive(item);
        toast.success(nextActive ? "Recipe activated." : "Recipe deactivated.");
        setInventoryItems((prev) =>
          prev.map((i) =>
            getInventoryItemId(i) === invId
              ? {
                  ...i,
                  isActive: nextActive,
                  isBlocked: !nextActive,
                  status: nextActive ? "Active" : "Inactive",
                }
              : i,
          ),
        );
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to toggle status.",
        );
      }
    });
  };

  const handleRemove = async (item) => {
    const invId = getInventoryItemId(item);
    if (!invId) return;
    if (!window.confirm("Remove this recipe from your inventory?")) return;

    await withProcessing(invId, async () => {
      try {
        await deleteInventoryRecipe(invId);
        toast.success("Recipe removed from inventory.");
        await loadData();
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to remove recipe.",
        );
      }
    });
  };

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = recipes.filter(
      (r) => !inventoryRecipeIds.has(getRecipeId(r)),
    );
    if (!q) return list;
    return list.filter((r) =>
      [r.recipeName, r.name, r.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [recipes, inventoryRecipeIds, searchQuery]);

  const filteredInventory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return inventoryItems;
    return inventoryItems.filter((item) =>
      [item.recipeName, item.name, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [inventoryItems, searchQuery]);

  const tabList = [
    {
      key: "catalog",
      label: "Recipes Catalog",
      icon: FaListUl,
      count: filteredCatalog.length,
    },
    {
      key: "inventory",
      label: "My Inventory",
      icon: FaCheckCircle,
      count: inventoryItems.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-4xl border border-slate-200 dark:border-slate-700 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="max-w-7xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
            <MdMenuBook className="text-sm" />
            Inventory · Recipes
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Manage Recipe Inventory
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Browse the recipes catalog and add recipes to your inventory
            with a custom price.
          </p>
        </div>
      </section>

      {/* Tabs + Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2">
          {tabList.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                activeTab === tab.key
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300"
              }`}
            >
              <tab.icon className="text-sm" />
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400">
            <FaSearch className="text-sm" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes..."
            className="block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 py-3 ps-11 pe-4 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
        </div>
      ) : activeTab === "catalog" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCatalog.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-12 text-center text-sm text-slate-500">
                {searchQuery ? "No recipes match your search." : "All recipes are already in your inventory."}
              </div>
            ) : (
              filteredCatalog.map((recipe) => {
                const id = getRecipeId(recipe);
                return (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
                  >
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {recipe.recipeName || recipe.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {recipe.description || "No description."}
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={priceInputs[id] || ""}
                        onChange={(e) =>
                          setPriceInputs((p) => ({
                            ...p,
                            [id]: e.target.value,
                          }))
                        }
                        placeholder="Price"
                        className="w-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddToInventory(recipe)}
                        disabled={isProcessing(id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isProcessing(id) ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <FaPlus className="text-xs" />
                        )}
                        Add
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredInventory.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-12 text-center text-sm text-slate-500">
                Your recipe inventory is empty. Add recipes from the catalog.
              </div>
            ) : (
              filteredInventory.map((item) => {
                const invId = getInventoryItemId(item);
                const active = isInventoryItemActive(item);
                return (
                  <motion.div
                    key={invId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {item.recipeName || item.name || "Recipe"}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                          active
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      ${Number(item.price || 0).toFixed(2)}
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={priceInputs[`inv-${invId}`] || ""}
                        onChange={(e) =>
                          setPriceInputs((p) => ({
                            ...p,
                            [`inv-${invId}`]: e.target.value,
                          }))
                        }
                        placeholder="New price"
                        className="w-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdatePrice(item)}
                        disabled={isProcessing(invId)}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors hover:border-emerald-300 disabled:opacity-60"
                      >
                        Update
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        disabled={isProcessing(invId)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors disabled:opacity-60 ${
                          active
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        <FaCheckCircle className="text-[10px]" />
                        {active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        disabled={isProcessing(invId)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60"
                      >
                        <FaTimes className="text-[10px]" />
                        Remove
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default HerbalistManageInventoryRecipes;
