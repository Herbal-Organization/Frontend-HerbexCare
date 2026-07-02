import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getMyFeedbackHistory,
  deleteMyRecipeFeedback,
  deleteMyAiRecipeFeedback,
  deleteMyAiChatRecipeFeedback,
  submitRecipeFeedback,
  submitAiRecipeFeedback,
  submitAiChatRecipeFeedback,
} from "@api/feedbacks";
import { getRecipeById } from "@api/recipes";
import { fetchMyConsultationById } from "@api/aiConsultations";
import { fetchMyChatConsultationById } from "@api/aiChat";
import {
  FaStar,
  FaRegStar,
  FaCommentAlt,
  FaCalendarAlt,
  FaHistory,
  FaLeaf,
  FaMagic,
  FaComments,
  FaPen,
  FaTrashAlt,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import { AnimatePresence, motion } from "motion/react";
import Pagination from "@components/common/Pagination";
import { Button } from "@components/ui/button";
import { cn } from "@utils/cn";
import { Link } from "react-router-dom";

const PAGE_SIZE = 8;

// Maps a feedback record to its type config: which id/api to use, plus display.
const TYPES = {
  recipe: {
    idKey: "recipeId",
    typeLabelKey: "recipe",
    icon: FaLeaf,
    accent: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30",
    nameKey: (f) => `recipe_${f.recipeId}`,
    link: (f) => `/patient/home/recipes/${f.recipeId}`,
    del: deleteMyRecipeFeedback,
    submit: submitRecipeFeedback,
  },
  aiRecipe: {
    idKey: "aiRecipeId",
    typeLabelKey: "aiRecipe",
    icon: FaMagic,
    accent: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30",
    nameKey: (f) => `aiRecipe_${f.aiRecipeId}`,
    link: () => null,
    del: deleteMyAiRecipeFeedback,
    submit: submitAiRecipeFeedback,
  },
  aiChatRecipe: {
    idKey: "aiChatRecipeId",
    typeLabelKey: "aiChatRecipe",
    icon: FaComments,
    accent: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30",
    nameKey: (f) => `aiChat_${f.aiChatRecipeId}`,
    link: () => null,
    del: deleteMyAiChatRecipeFeedback,
    submit: submitAiChatRecipeFeedback,
  },
};

const getFeedbackType = (feedback) => {
  if (feedback.recipeId) return "recipe";
  if (feedback.aiRecipeId) return "aiRecipe";
  if (feedback.aiChatRecipeId) return "aiChatRecipe";
  return "recipe";
};

// Read-only star row
const Stars = ({ rating, size = "w-4 h-4" }) => (
  <div className="flex gap-0.5" aria-label={`${rating}/5`}>
    {[1, 2, 3, 4, 5].map((star) =>
      star <= rating ? (
        <FaStar key={star} className={cn("text-amber-400", size)} />
      ) : (
        <FaRegStar
          key={star}
          className={cn("text-slate-300 dark:text-slate-600", size)}
        />
      ),
    )}
  </div>
);

const StatCard = ({ label, value, accent: _accent }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 p-4 shadow-sm">
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="text-xl font-bold text-slate-900 dark:text-slate-50">
        {value}
      </p>
    </div>
  </div>
);

const FeedbackHistoryPage = () => {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [itemNames, setItemNames] = useState({});
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState(null); // feedback being edited
  const [deleting, setDeleting] = useState(null); // feedback pending delete

  // Fetch every page once so counts, averages, filters and sorting are accurate.
  const fetchAllHistory = async () => {
    try {
      setLoading(true);
      const first = await getMyFeedbackHistory(1, 50);
      let items = first.items || [];
      const totalPages = first.totalPages || 1;

      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            getMyFeedbackHistory(i + 2, 50),
          ),
        );
        rest.forEach((page) => {
          items = items.concat(page.items || []);
        });
      }
      setAllFeedbacks(items);
      await fetchItemNames(items);
    } catch (error) {
      console.error("Error fetching feedback history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemNames = async (items) => {
    const names = {};
    await Promise.all(
      items.map(async (feedback) => {
        const type = getFeedbackType(feedback);
        const config = TYPES[type];
        const key = config.nameKey(feedback);
        try {
          if (type === "recipe") {
            const data = await getRecipeById(feedback.recipeId);
            names[key] =
              data?.description ||
              data?.recipeTitle ||
              data?.title ||
              data?.name ||
              `${t("feedbackHistoryPage.recipe")} #${feedback.recipeId}`;
          } else if (type === "aiRecipe") {
            const data = await fetchMyConsultationById(feedback.aiRecipeId);
            names[key] =
              data?.recommendedRecipeName ||
              data?.recipeTitle ||
              data?.title ||
              data?.name ||
              `${t("feedbackHistoryPage.aiRecipe")} #${feedback.aiRecipeId}`;
          } else if (type === "aiChatRecipe") {
            const data = await fetchMyChatConsultationById(
              feedback.aiChatRecipeId,
            );
            names[key] =
              data?.recommendedRecipeName ||
              data?.recipeTitle ||
              data?.title ||
              data?.name ||
              `${t("feedbackHistoryPage.aiChatRecipe")} #${feedback.aiChatRecipeId}`;
          }
        } catch (error) {
          console.error("Error fetching item name:", error);
        }
      }),
    );
    setItemNames((prev) => ({ ...prev, ...names }));
  };

  useEffect(() => {
    fetchAllHistory();
  }, []);

  // Reset to first page whenever the view changes.
  useEffect(() => {
    setPage(1);
  }, [filter, sort]);

  // Derived stats over the full dataset.
  const stats = useMemo(() => {
    const total = allFeedbacks.length;
    const avg = total
      ? allFeedbacks.reduce((s, f) => s + (f.ratingValue || 0), 0) / total
      : 0;
    const counts = { recipe: 0, aiRecipe: 0, aiChatRecipe: 0 };
    allFeedbacks.forEach((f) => {
      counts[getFeedbackType(f)] += 1;
    });
    return { total, avg, counts };
  }, [allFeedbacks]);

  // Filtered + sorted + paginated view.
  const filtered = useMemo(() => {
    let list =
      filter === "all"
        ? allFeedbacks
        : allFeedbacks.filter((f) => getFeedbackType(f) === filter);

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.ratingDate) - new Date(b.ratingDate);
        case "highest":
          return b.ratingValue - a.ratingValue;
        case "lowest":
          return a.ratingValue - b.ratingValue;
        case "newest":
        default:
          return new Date(b.ratingDate) - new Date(a.ratingDate);
      }
    });
    return list;
  }, [allFeedbacks, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const filterTabs = [
    { key: "all", label: t("feedbackHistoryPage.allTypes"), count: stats.total },
    {
      key: "recipe",
      label: t("feedbackHistoryPage.recipe"),
      count: stats.counts.recipe,
    },
    {
      key: "aiRecipe",
      label: t("feedbackHistoryPage.aiRecipe"),
      count: stats.counts.aiRecipe,
    },
    {
      key: "aiChatRecipe",
      label: t("feedbackHistoryPage.aiChatRecipe"),
      count: stats.counts.aiChatRecipe,
    },
  ];

  const handleDeleted = (feedback) => {
    const idKey = TYPES[getFeedbackType(feedback)].idKey;
    setAllFeedbacks((prev) =>
      prev.filter((f) => f[idKey] !== feedback[idKey]),
    );
  };

  const handleUpdated = (feedback, updated) => {
    setAllFeedbacks((prev) =>
      prev.map((f) =>
        f.feedbackId === feedback.feedbackId ? { ...f, ...updated } : f,
      ),
    );
  };

  const pageContainerClass =
    "mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8";

  if (loading) {
    return (
      <div className={pageContainerClass}>
        <div className="animate-pulse space-y-6">
          <div className="h-9 w-64 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-700"
              />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-700"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(pageContainerClass, "space-y-6")}>
      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
          {t("feedbackHistoryPage.title")}
        </h1>
        <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400">
          {t("feedbackHistoryPage.description")}
        </p>
      </header>

      {stats.total === 0 ? (
        <EmptyState t={t} />
      ) : (
        <>
          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={FaHistory}
              label={t("feedbackHistoryPage.totalFeedbacks")}
              value={stats.total}
              accent="bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
            />
            <StatCard
              icon={FaStar}
              label={t("feedbackHistoryPage.averageRating")}
              value={stats.avg.toFixed(1)}
              accent="bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400"
            />
            <StatCard
              icon={FaLeaf}
              label={t("feedbackHistoryPage.recipe")}
              value={stats.counts.recipe}
              accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            />
          </section>

          {/* Filters + sort */}
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="tablist"
              className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1"
            >
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={filter === tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    filter === tab.key
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs",
                      filter === tab.key
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                {t("feedbackHistoryPage.sortBy")}
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="newest">
                  {t("feedbackHistoryPage.sortNewest")}
                </option>
                <option value="oldest">
                  {t("feedbackHistoryPage.sortOldest")}
                </option>
                <option value="highest">
                  {t("feedbackHistoryPage.sortHighest")}
                </option>
                <option value="lowest">
                  {t("feedbackHistoryPage.sortLowest")}
                </option>
              </select>
            </label>
          </section>

          {/* List */}
          {pageItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 p-12 text-center text-slate-500 dark:text-slate-400">
              {t("feedbackHistoryPage.noResults")}
            </div>
          ) : (
            <div className="space-y-4">
              {pageItems.map((feedback, index) => (
                <FeedbackCard
                  key={feedback.feedbackId}
                  feedback={feedback}
                  index={index}
                  name={itemNames[TYPES[getFeedbackType(feedback)].nameKey(feedback)]}
                  language={i18n.language}
                  t={t}
                  onEdit={() => setEditing(feedback)}
                  onDelete={() => setDeleting(feedback)}
                />
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalItems={filtered.length}
                itemsPerPage={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <EditModal
            feedback={editing}
            name={itemNames[TYPES[getFeedbackType(editing)].nameKey(editing)]}
            t={t}
            onClose={() => setEditing(null)}
            onSaved={(updated) => {
              handleUpdated(editing, updated);
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleting && (
          <DeleteDialog
            feedback={deleting}
            t={t}
            onClose={() => setDeleting(null)}
            onDeleted={() => {
              handleDeleted(deleting);
              setDeleting(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const EmptyState = ({ t }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 py-16 text-center">
    <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
      <FaCommentAlt className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
      {t("feedbackHistoryPage.noFeedback")}
    </h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
      {t("feedbackHistoryPage.description")}
    </p>
    <Button asChild>
      <Link to="/patient/home/recipes">{t("common.explore")}</Link>
    </Button>
  </div>
);

const FeedbackCard = ({
  feedback,
  index,
  name,
  language,
  t,
  onEdit,
  onDelete,
}) => {
  const type = getFeedbackType(feedback);
  const config = TYPES[type];
  const TypeIcon = config.icon;
  const label = name || t(`feedbackHistoryPage.${config.typeLabelKey}`);
  const link = config.link(feedback);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2) }}
      className="group rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 sm:p-5"
    >
      <div className="flex items-start gap-4">
        <div className={cn("shrink-0 rounded-xl p-3", config.accent)}>
          <TypeIcon className="text-xl" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {link ? (
              <Link
                to={link}
                className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate"
              >
                {label}
              </Link>
            ) : (
              <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                {label}
              </span>
            )}
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                config.accent,
              )}
            >
              {t(`feedbackHistoryPage.${config.typeLabelKey}`)}
            </span>
          </div>

          <Stars rating={feedback.ratingValue} />

          {feedback.comment && (
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
              &ldquo;{feedback.comment}&rdquo;
            </p>
          )}

          <div className="flex items-center gap-1.5 pt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
            <FaCalendarAlt className="opacity-70" />
            {new Date(feedback.ratingDate).toLocaleDateString(language, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onEdit}
            aria-label={t("feedbackHistoryPage.edit")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <FaPen className="text-sm" />
          </button>
          <button
            onClick={onDelete}
            aria-label={t("feedbackHistoryPage.delete")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <FaTrashAlt className="text-sm" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

// Shared modal shell (backdrop + centered panel)
const ModalShell = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <div
      className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-modal="true"
      className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl"
    >
      {children}
    </motion.div>
  </motion.div>
);

const EditModal = ({ feedback, name, t, onClose, onSaved }) => {
  const config = TYPES[getFeedbackType(feedback)];
  const [rating, setRating] = useState(feedback.ratingValue || 5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(feedback.comment || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = { ratingValue: Number(rating), comment };
      await config.submit(feedback[config.idKey], payload);
      onSaved(payload);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          t("feedbackHistoryPage.updateError"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {t("feedbackHistoryPage.editTitle")}
        </h2>
        <button
          onClick={onClose}
          aria-label={t("feedbackHistoryPage.cancel")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <FaTimes />
        </button>
      </div>

      <div className="space-y-5 p-5">
        {name && (
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            {name}
          </p>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            {t("feedbackHistoryPage.yourRating")}
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${star}`}
                className="p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                <FaStar
                  className={cn(
                    "w-7 h-7 transition-colors",
                    (hover || rating) >= star
                      ? "text-amber-400"
                      : "text-slate-200 dark:text-slate-600",
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {t("feedbackHistoryPage.yourComment")}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder={t("feedbackHistoryPage.commentPlaceholder")}
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700/60 p-5">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          {t("feedbackHistoryPage.cancel")}
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving
            ? t("feedbackHistoryPage.saving")
            : t("feedbackHistoryPage.save")}
        </Button>
      </div>
    </ModalShell>
  );
};

const DeleteDialog = ({ feedback, t, onClose, onDeleted }) => {
  const config = TYPES[getFeedbackType(feedback)];
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await config.del(feedback[config.idKey]);
      onDeleted();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          t("feedbackHistoryPage.deleteError"),
      );
      setDeleting(false);
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400">
          <FaExclamationTriangle className="text-2xl" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {t("feedbackHistoryPage.deleteTitle")}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t("feedbackHistoryPage.deleteConfirm")}
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            {t("feedbackHistoryPage.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting
              ? t("feedbackHistoryPage.deleting")
              : t("feedbackHistoryPage.delete")}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

export default FeedbackHistoryPage;
