import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaClock,
  FaEye,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import {
  getPendingRecipes,
  approveRecipe,
  adminDeleteRecipe,
  getAllRecipes,
} from "@api/recipes";

const PAGE_SIZE = 10;

function StatCard({ label, value, hint, icon, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber:
      "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
          {hint && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {hint}
            </p>
          )}
        </div>
        <div className={`rounded-2xl border p-3 ${tones[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

function RecipeDetailsModal({ isOpen, recipe, onClose }) {
  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
              Recipe Details
            </p>
            <h2 className="mt-2 truncate text-xl font-black text-slate-900">
              {recipe.recipeName || recipe.name || "Recipe"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-700 shrink-0"
          >
            <FaTimes />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-600">Description</p>
            <p className="mt-1 text-sm text-slate-700">
              {recipe.description || "N/A"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-600">Ingredients</p>
            <p className="mt-1 text-sm text-slate-700">
              {recipe.ingredients || "N/A"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-600">Preparation</p>
            <p className="mt-1 text-sm text-slate-700">
              {recipe.preparation || recipe.preparationSteps || "N/A"}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">Dosage</p>
              <p className="mt-1 text-sm text-slate-700">
                {recipe.dosage || "N/A"}
              </p>
            </div>
            <div className="rounded-2xl bg-rose-50/60 px-4 py-3">
              <p className="text-xs font-bold text-rose-700">Warnings</p>
              <p className="mt-1 text-sm text-rose-900/80">
                {recipe.warnings || recipe.sideEffects || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRecipesPage() {
  const { t } = useTranslation();
  const [allRecipes, setAllRecipes] = useState([]);
  const [pendingRecipesList, setPendingRecipesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [processingIds, setProcessingIds] = useState([]);

  const loadData = async (page = 1) => {
    setIsLoading(true);
    setError("");

    try {
      const [recipesRes, pendingRes] = await Promise.allSettled([
        getAllRecipes(page, PAGE_SIZE, searchValue),
        getPendingRecipes(),
      ]);

      if (recipesRes.status === "fulfilled") {
        const items = Array.isArray(recipesRes.value?.items)
          ? recipesRes.value.items
          : Array.isArray(recipesRes.value)
            ? recipesRes.value
            : [];
        setAllRecipes(items);
        setTotalPages(Math.max(1, recipesRes.value?.totalPages ?? 1));
        setCurrentPage(recipesRes.value?.pageNumber ?? page);
      }

      if (pendingRes.status === "fulfilled") {
        const items = Array.isArray(pendingRes.value?.items)
          ? pendingRes.value.items
          : Array.isArray(pendingRes.value)
            ? pendingRes.value
            : [];
        setPendingRecipesList(items);
      }

      const rejection = [recipesRes, pendingRes].find(
        (r) => r.status === "rejected",
      );
      if (rejection) {
        const message =
          rejection.reason?.response?.data?.message ||
          rejection.reason?.message ||
          "Unable to load recipes.";
        setError(message);
      }
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
    const id = String(recipe.recipeId ?? recipe.id);
    if (isProcessing(id)) return;

    setProcessingIds((prev) => [...prev, id]);
    try {
      await approveRecipe(id);
      toast.success(`"${recipe.recipeName || recipe.name}" approved.`);
      await loadData(currentPage);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to approve recipe.",
      );
    } finally {
      setProcessingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleDelete = async (recipe) => {
    const id = String(recipe.recipeId ?? recipe.id);
    if (isProcessing(id)) return;

    if (
      !window.confirm(
        `Delete "${recipe.recipeName || recipe.name}"? This action cannot be undone.`,
      )
    )
      return;

    setProcessingIds((prev) => [...prev, id]);
    try {
      await adminDeleteRecipe(id);
      toast.success(`"${recipe.recipeName || recipe.name}" deleted.`);
      await loadData(currentPage);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete recipe.",
      );
    } finally {
      setProcessingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const stats = useMemo(
    () => ({
      total: allRecipes.length,
      pending: pendingRecipesList.length,
    }),
    [allRecipes, pendingRecipesList],
  );

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <MdMenuBook className="text-sm" />
              Recipes
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminRecipes.title", "Manage Recipes")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t(
                "adminRecipes.subtitle",
                "Review pending recipe submissions, approve entries, and manage the recipe catalogue.",
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadData(currentPage)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
          >
            <FaSyncAlt className="text-sm" />
            Refresh
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="Registered recipes"
          value={stats.total}
          hint="Recipes in the catalogue."
          icon={<MdMenuBook className="text-2xl" />}
          tone="emerald"
        />
        <StatCard
          label="Pending approvals"
          value={stats.pending}
          hint="Recipes awaiting admin review."
          icon={<FaClock className="text-2xl" />}
          tone="amber"
        />
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Pending Approvals */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t("adminRecipes.pending", "Pending Approvals")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Approve or reject recipes submitted by herbalists.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
            <FaClock className="text-[10px]" />
            {pendingRecipesList.length} awaiting review
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
          </div>
        ) : pendingRecipesList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No recipes are waiting for approval.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {pendingRecipesList.map((recipe) => {
              const id = recipe.recipeId ?? recipe.id;
              const disabled = isProcessing(id);
              return (
                <article
                  key={id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {recipe.recipeName || recipe.name}
                        </h3>
                        <span className="inline-flex rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
                          Pending
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecipe(recipe);
                        setIsDetailsOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-colors hover:border-emerald-500 hover:text-emerald-700"
                    >
                      <FaEye className="text-[10px]" />
                      View
                    </button>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 line-clamp-2">
                    {recipe.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => handleApprove(recipe)}
                      disabled={disabled}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {disabled ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <FaPlus className="text-xs" />
                      )}
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(recipe)}
                      disabled={disabled}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:border-rose-400 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FaTimes className="text-xs" />
                      Reject
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Recipes Table */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              All Recipes
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Page {currentPage} of {totalPages}.
            </p>
          </div>
          <div className="relative w-full lg:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400">
              <FaSearch className="text-sm" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadData(1);
              }}
              placeholder="Search recipes by name..."
              className="block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 py-3 ps-11 pe-4 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
          </div>
        ) : allRecipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No recipes found.
          </div>
        ) : (
          <div className="pt-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Recipe
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Description
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Availability
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {allRecipes.map((recipe) => {
                      const id = recipe.recipeId ?? recipe.id;
                      const active =
                        recipe.isAvailable !== false &&
                        recipe.isActive !== false;
                      return (
                        <tr
                          key={id}
                          onClick={() => {
                            setSelectedRecipe(recipe);
                            setIsDetailsOpen(true);
                          }}
                          className="cursor-pointer transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {recipe.recipeName || recipe.name}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">
                              {recipe.description || "—"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                                active
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {active ? "Available" : "Unavailable"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(recipe);
                              }}
                              disabled={isProcessing(id)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <FaTrash className="text-[10px]" />
                              Delete
                            </button>
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
                >
                  <FaChevronLeft />
                </button>
                <span className="px-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => loadData(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
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
        recipe={selectedRecipe}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedRecipe(null);
        }}
      />
    </div>
  );
}

export default AdminRecipesPage;
