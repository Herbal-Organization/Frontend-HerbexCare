import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaSyncAlt,
  FaTrash,
} from "react-icons/fa";
import {
  getAdminAiRecipeReviews,
  deleteAdminAiRecipeReview,
  getAdminAiChatRecipeReviews,
  deleteAdminAiChatRecipeReview,
} from "@api/adminReviews";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const TABS = [
  { key: "ai-recipe", label: "AI Recipe Reviews" },
  { key: "ai-chat-recipe", label: "AI Chat Recipe Reviews" },
];

const API_MAP = {
  "ai-recipe": { fetch: getAdminAiRecipeReviews, remove: deleteAdminAiRecipeReview },
  "ai-chat-recipe": { fetch: getAdminAiChatRecipeReviews, remove: deleteAdminAiChatRecipeReview },
};

function AdminReviewsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("ai-recipe");
  const [reviews, setReviews] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingIds, setDeletingIds] = useState([]);

  const loadData = useCallback(async (nextPage, nextSize, tab) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await API_MAP[tab].fetch({
        PageNumber: nextPage,
        PageSize: nextSize,
      });
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : [];
      setReviews(items);
      setTotalPages(Math.max(1, response?.totalPages ?? 1));
    } catch (err) {
      const msg = err?.response?.data?.message || "Unable to load reviews.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPageNumber(1);
    loadData(1, pageSize, activeTab);
  }, [activeTab, pageSize, loadData]);

  useEffect(() => {
    loadData(pageNumber, pageSize, activeTab);
  }, [pageNumber, activeTab, pageSize, loadData]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setPageNumber(1);
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPageNumber(1);
  }, []);

  const handleDelete = async (review) => {
    const id = String(review.reviewId ?? review.id);
    if (deletingIds.includes(id)) return;
    if (!window.confirm("Delete this review?")) return;

    setDeletingIds((prev) => [...prev, id]);
    try {
      await API_MAP[activeTab].remove(id);
      toast.success("Review deleted.");
      await loadData(pageNumber, pageSize, activeTab);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete review.");
    } finally {
      setDeletingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const renderStars = (rating) => {
    const count = Number(rating) || 0;
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <FaStar key={i} className={`text-xs ${i < count ? "text-amber-400" : "text-slate-200 dark:text-slate-600"}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <FaStar className="text-sm" />
              Reviews
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminReviews.title", "All Reviews")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t("adminReviews.subtitle", "Moderate reviews across AI recipe and AI chat recipe types.")}
            </p>
          </div>
          <button type="button" onClick={() => loadData(pageNumber, pageSize, activeTab)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15">
            <FaSyncAlt className="text-sm" />
            Refresh
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === tab.key
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">{error}</div>
      )}

      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{TABS.find((t) => t.key === activeTab)?.label}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Page {pageNumber} of {totalPages}.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="text-slate-500">Size</span>
            <select value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value) || DEFAULT_PAGE_SIZE)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none">
              {PAGE_SIZE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">No reviews found.</div>
        ) : (
          <div className="pt-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">User</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Recipe</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Rating</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Comment</th>
                      <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {reviews.map((review) => {
                      const id = review.reviewId ?? review.id;
                      const deleting = deletingIds.includes(String(id));
                      return (
                        <tr key={id} className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20">
                          <td className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">{review.reviewerName || review.patientName || "—"}</td>
                          <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">{review.recipeName || "—"}</td>
                          <td className="px-5 py-4">{renderStars(review.ratingValue)}</td>
                          <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{review.comment || "—"}</td>
                          <td className="px-5 py-4 text-right">
                            <button type="button" onClick={() => handleDelete(review)} disabled={deleting} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:cursor-not-allowed disabled:opacity-60">
                              {deleting ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <FaTrash className="text-[10px]" />}
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
                <button type="button" onClick={() => setPageNumber((p) => Math.max(1, p - 1))} disabled={pageNumber <= 1 || isLoading} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><FaChevronLeft /></button>
                <span className="px-3 text-sm font-bold text-slate-700 dark:text-slate-300">{pageNumber} / {totalPages}</span>
                <button type="button" onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))} disabled={pageNumber >= totalPages || isLoading} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><FaChevronRight /></button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminReviewsPage;
