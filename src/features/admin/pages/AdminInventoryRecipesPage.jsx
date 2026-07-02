import { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSearch,
  FaSyncAlt,
  FaTrash,
} from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import {
  getAdminInventoryRecipes,
  deleteAdminInventoryRecipe,
} from "@api/inventoryRecipes";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const buildPageItems = (currentPage, totalPages) => {
  const safeTotal = Math.max(1, totalPages || 1);
  const safeCurrent = clamp(currentPage || 1, 1, safeTotal);
  if (safeTotal <= 7) {
    return Array.from({ length: safeTotal }, (_, index) => index + 1);
  }
  if (safeCurrent <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", safeTotal];
  }
  if (safeCurrent >= safeTotal - 3) {
    return [1, "ellipsis", safeTotal - 4, safeTotal - 3, safeTotal - 2, safeTotal - 1, safeTotal];
  }
  return [1, "ellipsis", safeCurrent - 1, safeCurrent, safeCurrent + 1, "ellipsis", safeTotal];
};

function AdminInventoryRecipesPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  const load = async (options = {}) => {
    const nextPage = options.nextPageNumber ?? pageNumber;
    const nextSize = options.nextPageSize ?? pageSize;
    setIsLoading(true);
    setError("");
    try {
      const response = await getAdminInventoryRecipes({
        PageNumber: nextPage,
        PageSize: nextSize,
      });
      setItems(response?.items || []);
      setPageNumber(response?.pageNumber || 1);
      setTotalPages(response?.totalPages || 1);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Unable to load inventory items.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (herbalistId, recipeId) => {
    if (!window.confirm("Are you sure you want to delete this inventory record?")) return;
    const key = `${herbalistId}-${recipeId}`;
    setDeletingId(key);
    try {
      await deleteAdminInventoryRecipe(herbalistId, recipeId);
      toast.success("Inventory record deleted.");
      await load({ nextPageNumber: pageNumber, nextPageSize: pageSize });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to delete inventory item.";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    load({ nextPageNumber: pageNumber, nextPageSize: pageSize });
  }, [pageNumber, pageSize]);

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      const haystack = [item.recipeName, item.herbalistName, item.recipeDescription]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [items, searchValue]);

  const pageItems = useMemo(
    () => buildPageItems(pageNumber, totalPages),
    [pageNumber, totalPages],
  );

  return (
    <div className="space-y-6 p-4 md:p-8">
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <MdMenuBook className="text-sm" />
              Inventory
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Recipe Inventory
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              View all recipe inventory records across herbalists. Manage pricing and availability.
            </p>
          </div>
          <button
            type="button"
            onClick={() => load({ nextPageNumber: pageNumber, nextPageSize: pageSize })}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
          >
            <FaSyncAlt className="text-sm" />
            Refresh
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Inventory list
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Showing page <span className="font-semibold">{pageNumber}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-104">
              <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400">
                <FaSearch className="text-sm" />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search within current page..."
                className="block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 py-3 ps-11 pe-4 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <FaFilter className="text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">Page size</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const next = Number(e.target.value) || DEFAULT_PAGE_SIZE;
                  setPageSize(next);
                  setPageNumber(1);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
          </div>
        ) : !error && filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No inventory items found on this page.
          </div>
        ) : (
          <div className="pt-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Recipe</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Herbalist</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Price</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Status</th>
                      <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {filteredItems.map((item, index) => {
                      const key = `${item.herbalistId}-${item.recipeId}-${index}`;
                      const active = item.isActive !== false;
                      return (
                        <tr key={key} className="transition-colors hover:bg-slate-50 dark:bg-slate-900/40">
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {item.recipeName || "N/A"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {item.herbalistName || "N/A"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {item.price != null
                                ? `$${Number(item.price).toLocaleString()}`
                                : "—"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                                active
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                                  : "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400"
                              }`}
                            >
                              {active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              disabled={deletingId === key}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.herbalistId, item.recipeId);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === key ? (
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <FaTrash className="text-[10px]" />
                              )}
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

            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {filteredItems.length} shown (this page)
              </p>
              {totalPages > 1 ? (
                <nav className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { if (pageNumber > 1) setPageNumber(pageNumber - 1); }}
                    disabled={pageNumber === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <div className="flex items-center gap-1">
                    {pageItems.map((val, idx) => {
                      if (val === "ellipsis") {
                        return (
                          <span key={`ellipsis-${idx}`} className="flex h-10 w-10 items-center justify-center px-1 text-sm font-semibold text-slate-400">...</span>
                        );
                      }
                      const isCurrent = val === pageNumber;
                      return (
                        <button
                          key={`page-${val}`}
                          type="button"
                          onClick={() => setPageNumber(val)}
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold transition-all ${
                            isCurrent
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-500/20"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => { if (pageNumber < totalPages) setPageNumber(pageNumber + 1); }}
                    disabled={pageNumber === totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </nav>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminInventoryRecipesPage;
