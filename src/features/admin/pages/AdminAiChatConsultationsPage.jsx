import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaBan,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSearch,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";
import { MdSmartToy } from "react-icons/md";
import {
  fetchAdminAllAiChatConsultations,
  toggleAdminAiChatRecipeStatus,
} from "@api/aiChat";

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
    return [
      1,
      "ellipsis",
      safeTotal - 4,
      safeTotal - 3,
      safeTotal - 2,
      safeTotal - 1,
      safeTotal,
    ];
  }

  return [
    1,
    "ellipsis",
    safeCurrent - 1,
    safeCurrent,
    safeCurrent + 1,
    "ellipsis",
    safeTotal,
  ];
};

const isRecipeActive = (item = {}) => {
  if (item.isBlocked === true) return false;
  if (item.isActive === false) return false;
  const status = String(item.status || item.recipeStatus || "").toLowerCase();
  if (status === "blocked" || status === "inactive") return false;
  return true;
};

function ConsultationDetailsModal({
  isOpen,
  item,
  onClose,
  onToggleStatus,
  isToggling,
  t,
}) {
  if (!isOpen || !item) return null;

  const active = isRecipeActive(item);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-7xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed/Sticky */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
              AI Chat
            </p>
            <h2 className="mt-2 truncate text-xl font-black text-slate-900">
              {item.recommendedRecipeName || "AI chat details"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Recipe ID:{" "}
              <span className="font-semibold">{item.aiChatRecipeId}</span>
              {" · "}
              <span
                className={
                  active
                    ? "font-semibold text-emerald-700"
                    : "font-semibold text-rose-700"
                }
              >
                {active
                  ? t("adminAiConsultations.status.active", "Active")
                  : t("adminAiConsultations.status.blocked", "Blocked")}
              </span>
              {typeof item.matchPercentage === "number" ? (
                <>
                  {" · "}
                  Match:{" "}
                  <span className="font-semibold">{item.matchPercentage}%</span>
                </>
              ) : null}
            </p>
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

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                Herb
              </p>
              <p className="mt-2 text-lg font-black text-slate-900">
                {item.mainHerb || "N/A"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {item.scientificName || "No scientific name"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.category ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
                    {item.category}
                  </span>
                ) : null}
                {typeof item.matchPercentage === "number" ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">
                    {item.matchPercentage}% match
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                Dosage & Warnings
              </p>
              <dl className="mt-3 space-y-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-bold text-slate-600">Dosage</dt>
                  <dd className="mt-1 text-sm text-slate-700">
                    {item.dosage || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl bg-rose-50/60 px-4 py-3">
                  <dt className="text-xs font-bold text-rose-700">
                    Contraindications
                  </dt>
                  <dd className="mt-1 text-sm text-rose-900/80">
                    {item.contraindications || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 md:col-span-2">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                Preparation
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {item.preparation || "N/A"}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 md:col-span-2">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                Other possibilities
              </p>
              {Array.isArray(item.otherPossibilities) &&
              item.otherPossibilities.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.otherPossibilities.map((opt) => (
                    <span
                      key={opt}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No alternatives.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer with actions - Sticky/Fixed */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-slate-500 max-w-md">
            {t(
              "adminAiConsultations.toggle.modalHint",
              "Blocking a recipe removes it from AI recommendations for patients. Active recipes can still be suggested in consultations.",
            )}
          </p>
          <button
            type="button"
            disabled={isToggling}
            onClick={() => onToggleStatus(item)}
            className={`inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 shrink-0 min-w-[160px] ${
              active
                ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {isToggling ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : active ? (
              <FaBan className="text-sm" />
            ) : (
              <FaCheckCircle className="text-sm" />
            )}
            {isToggling
              ? t("adminAiConsultations.toggle.updating", "Updating...")
              : active
                ? t("adminAiConsultations.toggle.blockRecipe", "Block recipe")
                : t(
                    "adminAiConsultations.toggle.activateRecipe",
                    "Activate recipe",
                  )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminAiChatConsultationsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingRecipeIds, setTogglingRecipeIds] = useState([]);

  const load = async ({ nextPageNumber = pageNumber, nextPageSize = pageSize } = {}) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetchAdminAllAiChatConsultations(
        nextPageNumber,
        nextPageSize,
      );

      const nextItems = Array.isArray(response?.items) ? response.items : [];
      setItems(nextItems);
      setPageNumber(response?.pageNumber ?? nextPageNumber);
      setTotalPages(Math.max(1, response?.totalPages ?? 1));
      setHasPreviousPage(Boolean(response?.hasPreviousPage));
      setHasNextPage(Boolean(response?.hasNextPage));
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to load AI chats.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load({ nextPageNumber: 1, nextPageSize: pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  useEffect(() => {
    load({ nextPageNumber: pageNumber, nextPageSize: pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      const haystack = [
        item.recommendedRecipeName,
        item.mainHerb,
        item.scientificName,
        item.category,
        item.preparation,
        item.dosage,
        item.contraindications,
        ...(Array.isArray(item.otherPossibilities) ? item.otherPossibilities : []),
      ]
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

  const handleOpenDetails = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const isTogglingRecipe = (recipeId) =>
    togglingRecipeIds.includes(String(recipeId));

  const updateRecipeStatusLocally = (recipeId, nextActive) => {
    const id = String(recipeId);
    const patch = (item) =>
      String(item.aiChatRecipeId) === id
        ? {
            ...item,
            isActive: nextActive,
            isBlocked: !nextActive,
            status: nextActive ? "Active" : "Blocked",
          }
        : item;

    setItems((current) => current.map(patch));
    setSelectedItem((current) =>
      current && String(current.aiChatRecipeId) === id ? patch(current) : current,
    );
  };

  const handleToggleStatus = async (item) => {
    const recipeId = item?.aiChatRecipeId;
    if (!recipeId || isTogglingRecipe(recipeId)) return;

    const currentlyActive = isRecipeActive(item);
    const confirmMessage = currentlyActive
      ? t(
          "adminAiConsultations.toggle.confirmBlock",
          "Block this AI recipe? It will no longer be recommended to patients.",
        )
      : t(
          "adminAiConsultations.toggle.confirmActivate",
          "Activate this AI recipe? It can be recommended in consultations again.",
        );

    if (!window.confirm(confirmMessage)) return;

    setTogglingRecipeIds((current) => [...current, String(recipeId)]);

    try {
      const response = await toggleAdminAiChatRecipeStatus(recipeId);
      const message =
        response?.message ||
        t("adminAiConsultations.toggle.success", "Recipe status updated.");
      toast.success(message);
      updateRecipeStatusLocally(recipeId, !currentlyActive);
      await load({ nextPageNumber: pageNumber, nextPageSize: pageSize });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        t("adminAiConsultations.toggle.error", "Unable to update recipe status.");
      toast.error(message);
    } finally {
      setTogglingRecipeIds((current) =>
        current.filter((id) => id !== String(recipeId)),
      );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <MdSmartToy className="text-sm" />
              AI Chat
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              All AI chats
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t(
                "adminAiConsultations.subtitle",
                "Review AI recommendations and block or activate recipes so they are excluded or included in future patient consultations.",
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => load({ nextPageNumber: pageNumber, nextPageSize: pageSize })}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <FaSyncAlt className="text-sm" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              AI chats list
            </h2>
            <p className="mt-1 text-sm text-slate-500">
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
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 ps-11 pe-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-700">
              <FaFilter className="text-slate-400" />
              <span className="text-slate-500">Page size</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const next = Number(e.target.value) || DEFAULT_PAGE_SIZE;
                  setPageSize(next);
                  setPageNumber(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-sm font-bold text-slate-800 outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
          </div>
        ) : !error && filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
            No AI chats found on this page.
          </div>
        ) : (
          <div className="pt-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Recipe
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Main herb
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Category
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Match
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {t("adminAiConsultations.table.status", "Status")}
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {t("adminAiConsultations.table.actions", "Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredItems.map((item) => {
                      const recipeId = item.aiChatRecipeId;
                      const active = isRecipeActive(item);
                      const toggling = isTogglingRecipe(recipeId);
                      const match = typeof item.matchPercentage === "number" ? item.matchPercentage : null;
                      const matchTone =
                        match === null
                          ? "bg-slate-100 text-slate-700"
                          : match >= 70
                            ? "bg-emerald-100 text-emerald-700"
                            : match >= 40
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700";

                      return (
                        <tr
                          key={item.aiChatRecipeId}
                          onClick={() => handleOpenDetails(item)}
                          className="cursor-pointer transition-colors hover:bg-emerald-50/40"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-900">
                              {item.recommendedRecipeName || "N/A"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-800">
                              {item.mainHerb || "N/A"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {item.scientificName || "—"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            {item.category ? (
                              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                {item.category}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {match === null ? (
                              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                —
                              </span>
                            ) : (
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${matchTone}`}
                              >
                                {match}%
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                                active
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {active
                                ? t("adminAiConsultations.status.active", "Active")
                                : t("adminAiConsultations.status.blocked", "Blocked")}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              disabled={toggling}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleToggleStatus(item);
                              }}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                active
                                  ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              {toggling ? (
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : active ? (
                                <FaBan className="text-[10px]" />
                              ) : (
                                <FaCheckCircle className="text-[10px]" />
                              )}
                              {active
                                ? t("adminAiConsultations.actions.block", "Block")
                                : t("adminAiConsultations.actions.activate", "Activate")}
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
              <p className="text-sm text-slate-500">
                {filteredItems.length} shown (this page)
              </p>

              <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
                <button
                  type="button"
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={!hasPreviousPage || pageNumber === 1 || isLoading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <FaChevronLeft />
                </button>

                {pageItems.map((p, index) => {
                  if (p === "ellipsis") {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                        ...
                      </span>
                    );
                  }

                  const isActive = p === pageNumber;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPageNumber(p)}
                      disabled={isLoading}
                      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold transition-colors ${
                        isActive
                          ? "bg-emerald-700 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                      } disabled:cursor-not-allowed disabled:opacity-70`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setPageNumber((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={!hasNextPage || pageNumber === totalPages || isLoading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <ConsultationDetailsModal
        isOpen={isDetailsOpen}
        item={selectedItem}
        t={t}
        onToggleStatus={handleToggleStatus}
        isToggling={
          selectedItem ? isTogglingRecipe(selectedItem.aiChatRecipeId) : false
        }
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedItem(null);
        }}
      />
    </div>
  );
}

export default AdminAiChatConsultationsPage;

