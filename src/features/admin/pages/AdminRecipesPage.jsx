import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaEdit,
  FaEye,
  FaLeaf,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import {
  getAllRecipes,
  toggleRecipeAvailability,
  adminDeleteRecipe,
  getRecipeById,
} from "@api/recipes";
import { getAllHerbs } from "@api/herbs";
import { getAllDiseaseNames } from "@api/diseases";

const PAGE_SIZE = 10;

function RecipeDetailsModal({ isOpen, recipeId, onClose }) {
  const { t } = useTranslation();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [herbsList, setHerbsList] = useState([]);
  const [diseasesList, setDiseasesList] = useState([]);

  useEffect(() => {
    if (!isOpen || !recipeId) return;
    setLoading(true);
    setRecipe(null);

    Promise.allSettled([
      getRecipeById(recipeId),
      getAllHerbs(1, 1000),
      getAllDiseaseNames(),
    ])
      .then(([recipeRes, herbsRes, diseasesRes]) => {
        if (recipeRes.status === "fulfilled") {
          setRecipe(recipeRes.value);
        }
        if (herbsRes.status === "fulfilled") {
          const raw = herbsRes.value;
          setHerbsList(
            Array.isArray(raw?.items)
              ? raw.items
              : Array.isArray(raw)
                ? raw
                : [],
          );
        }
        if (diseasesRes.status === "fulfilled") {
          const raw = diseasesRes.value;
          setDiseasesList(
            Array.isArray(raw?.items)
              ? raw.items
              : Array.isArray(raw)
                ? raw
                : [],
          );
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, recipeId]);

  if (!isOpen) return null;

  const getHerbName = (id) => {
    const h = herbsList.find(
      (x) => String(x.herbId ?? x.id) === String(id),
    );
    return h?.herbName ?? h?.name ?? `Herb #${id}`;
  };

  const getDiseaseName = (id) => {
    const d = diseasesList.find(
      (x) => String(x.diseaseId ?? x.id) === String(id),
    );
    return d?.diseaseName ?? d?.name ?? `Disease #${id}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
              {t("adminRecipes.recipeDetails", "Recipe Details")}
            </p>
            <h2 className="mt-2 truncate text-xl font-black text-slate-900">
              {loading
                ? "..."
                : recipe?.recipeName || recipe?.name || "Recipe"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-700 shrink-0"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
            </div>
          ) : !recipe ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {t("adminRecipes.notFound", "Recipe not found.")}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t("adminRecipes.description", "Description")}
                </p>
                <p className="mt-1.5 text-sm text-slate-700">
                  {recipe.description || "N/A"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t("adminRecipes.instructions", "Instructions")}
                </p>
                <p className="mt-1.5 text-sm text-slate-700 whitespace-pre-line">
                  {recipe.instructions || "N/A"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("adminRecipes.price", "Price")}
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-slate-900">
                    {recipe.price != null ? `${recipe.price} EGP` : "N/A"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("adminRecipes.status", "Status")}
                  </p>
                  <span
                    className={`mt-1.5 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      recipe.isAvailable !== false && recipe.isActive !== false
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {recipe.isAvailable !== false && recipe.isActive !== false
                      ? t("adminRecipes.available", "Available")
                      : t("adminRecipes.unavailable", "Unavailable")}
                  </span>
                </div>
              </div>

              {recipe.herbs && recipe.herbs.length > 0 && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("adminRecipes.herbs", "Herbs")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recipe.herbs.map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                      >
                        <FaLeaf className="text-[9px]" />
                        {getHerbName(h.herbId ?? h.id)}
                        {h.quantity ? ` x${h.quantity}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {recipe.diseases && recipe.diseases.length > 0 && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("adminRecipes.diseases", "Diseases")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recipe.diseases.map((d, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                      >
                        {getDiseaseName(d.diseaseId ?? d.id)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminRecipesPage() {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingIds, setProcessingIds] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadData = async (page = 1) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await getAllRecipes(page, PAGE_SIZE, searchValue);
      const items = Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res)
          ? res
          : [];
      setRecipes(items);
      setTotalPages(Math.max(1, res?.totalPages ?? 1));
      setCurrentPage(res?.pageNumber ?? page);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to load recipes.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const isProcessing = (id) => processingIds.includes(String(id));

  const handleApprove = async (recipe) => {
    const id = recipe.recipeId ?? recipe.id;
    const strId = String(id);
    if (isProcessing(strId)) return;

    setProcessingIds((prev) => [...prev, strId]);
    try {
      await toggleRecipeAvailability(id);
      toast.success(
        t(
          "adminRecipes.approved",
          '"{{name}}" availability toggled.',
          { name: recipe.recipeName || recipe.name },
        ),
      );
      await loadData(currentPage);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update recipe.",
      );
    } finally {
      setProcessingIds((prev) => prev.filter((x) => x !== strId));
    }
  };

  const handleDelete = async (recipe) => {
    const id = recipe.recipeId ?? recipe.id;
    const strId = String(id);
    if (isProcessing(strId)) return;

    if (
      !window.confirm(
        `Delete "${recipe.recipeName || recipe.name}"? This action cannot be undone.`,
      )
    )
      return;

    setProcessingIds((prev) => [...prev, strId]);
    try {
      await adminDeleteRecipe(id);
      toast.success(
        t(
          "adminRecipes.deleted",
          '"{{name}}" deleted.',
          { name: recipe.recipeName || recipe.name },
        ),
      );
      await loadData(currentPage);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete recipe.",
      );
    } finally {
      setProcessingIds((prev) => prev.filter((x) => x !== strId));
    }
  };

  const stats = useMemo(() => {
    const total = recipes.length;
    const available = recipes.filter(
      (r) => r.isAvailable !== false && r.isActive !== false,
    ).length;
    return { total, available, unavailable: total - available };
  }, [recipes]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <MdMenuBook className="text-sm" />
              {t("adminRecipes.badge", "Recipes")}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminRecipes.title", "Manage Recipes")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t(
                "adminRecipes.subtitle",
                "Review recipe submissions, approve entries, and manage the recipe catalogue.",
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadData(currentPage)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
          >
            <FaSyncAlt className="text-sm" />
            {t("common.refresh", "Refresh")}
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {t("adminRecipes.totalRecipes", "Total Recipes")}
              </p>
              <p className="mt-3 text-3xl font-black text-slate-900">
                {stats.total}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {t("adminRecipes.inCatalogue", "Recipes in the catalogue.")}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">
              <MdMenuBook className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {t("adminRecipes.availableRecipes", "Available Recipes")}
              </p>
              <p className="mt-3 text-3xl font-black text-slate-900">
                {stats.available}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {t(
                  "adminRecipes.liveOnPlatform",
                  "Live and visible to patients.",
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">
              <FaCheck className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Recipes Table */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {t("adminRecipes.allRecipes", "All Recipes")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("adminRecipes.pageInfo", {
                current: currentPage,
                total: totalPages,
                defaultValue: `Page ${currentPage} of ${totalPages}.`,
              })}
            </p>
          </div>
          <div className="relative w-full lg:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-slate-400">
              <FaSearch className="text-sm" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadData(1);
              }}
              placeholder={t("adminRecipes.searchPlaceholder", "Search recipes by name...")}
              className="block w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 ps-11 pe-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-48 rounded-lg bg-slate-200" />
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4"
                >
                  <div className="h-5 w-5 rounded bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-48 rounded bg-slate-100" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-slate-200" />
                  <div className="h-8 w-16 rounded-xl bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <MdMenuBook className="text-2xl" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {t("adminRecipes.emptyTitle", "No recipes yet")}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {t(
                "adminRecipes.emptyDescription",
                "Recipes created by herbalists will appear here.",
              )}
            </p>
          </div>
        ) : (
          <div className="pt-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {t("adminRecipes.colRecipe", "Recipe")}
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {t("adminRecipes.colDescription", "Description")}
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {t("adminRecipes.colStatus", "Status")}
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {t("adminRecipes.colActions", "Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {recipes.map((recipe) => {
                      const id = recipe.recipeId ?? recipe.id;
                      const disabled = isProcessing(id);
                      const active =
                        recipe.isAvailable !== false &&
                        recipe.isActive !== false;

                      return (
                        <tr
                          key={id}
                          onClick={() => {
                            setSelectedRecipeId(id);
                            setIsDetailsOpen(true);
                          }}
                          className="cursor-pointer transition-colors hover:bg-emerald-50/40"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-900">
                              {recipe.recipeName || recipe.name}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-500 line-clamp-1 max-w-xs">
                              {recipe.description || "—"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                                active
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {active
                                ? t("adminRecipes.available", "Available")
                                : t("adminRecipes.unavailable", "Unavailable")}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(recipe);
                                }}
                                disabled={disabled}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                                title={t("adminRecipes.toggleAvailability", "Toggle availability")}
                              >
                                {disabled ? (
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                                ) : (
                                  <FaCheck className="text-[10px]" />
                                )}
                                {active
                                  ? t("adminRecipes.disable", "Disable")
                                  : t("adminRecipes.enable", "Enable")}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(recipe);
                                }}
                                disabled={disabled}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                title={t("adminRecipes.deleteRecipe", "Delete recipe")}
                              >
                                <FaTrash className="text-[10px]" />
                                {t("common.delete", "Delete")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => loadData(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <FaChevronLeft />
                </button>
                <span className="px-3 text-sm font-bold text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => loadData(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <RecipeDetailsModal
        isOpen={isDetailsOpen}
        recipeId={selectedRecipeId}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedRecipeId(null);
        }}
      />
    </div>
  );
}

export default AdminRecipesPage;
