import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaCheck,
  FaClock,
  FaEye,
  FaLeaf,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";
import { getPendingHerbs, approveHerb, adminDeleteHerb } from "@api/herbs";
import HerbDetailsModal from "@features/admin/components/herbs/HerbDetailsModal";

function AdminHerbsPendingPage() {
  const { t } = useTranslation();
  const [pendingHerbs, setPendingHerbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [processingIds, setProcessingIds] = useState([]);

  const loadPending = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getPendingHerbs();
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : [];
      setPendingHerbs(items);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to load pending herbs.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const isProcessing = (id) => processingIds.includes(String(id));

  const handleApprove = async (herb) => {
    const id = String(herb.herbId ?? herb.id);
    if (isProcessing(id)) return;

    setProcessingIds((prev) => [...prev, id]);
    try {
      await approveHerb(id);
      toast.success(`"${herb.herbName}" approved.`);
      await loadPending();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to approve herb.",
      );
    } finally {
      setProcessingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleReject = async (herb) => {
    const id = String(herb.herbId ?? herb.id);
    if (isProcessing(id)) return;

    if (
      !window.confirm(
        `Reject "${herb.herbName}"? This will permanently delete it.`,
      )
    )
      return;

    setProcessingIds((prev) => [...prev, id]);
    try {
      await adminDeleteHerb(id);
      toast.success(`"${herb.herbName}" rejected and removed.`);
      await loadPending();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to reject herb.",
      );
    } finally {
      setProcessingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-amber-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
              <FaClock className="text-sm" />
              {t("adminHerbs.pendingBadge", "Pending Review")}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminHerbs.pendingTitle", "Pending Approvals")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t(
                "adminHerbs.pendingSubtitle",
                "Review herb submissions from herbalists. Approve to publish or reject to remove.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadPending}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <FaSyncAlt className="text-sm" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Pending Count */}
      {!isLoading && (
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-900/30 px-4 py-2 text-sm font-bold text-amber-700 dark:text-amber-400">
            <FaClock className="text-xs" />
            {pendingHerbs.length} {pendingHerbs.length === 1 ? "herb" : "herbs"} awaiting review
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Pending Herbs Grid */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
          </div>
        ) : pendingHerbs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <FaLeaf className="text-2xl" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              All caught up!
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              No herbs are waiting for approval. New submissions from herbalists will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {pendingHerbs.map((herb) => {
              const id = herb.herbId ?? herb.id;
              const disabled = isProcessing(id);
              return (
                <article
                  key={id}
                  className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 transition-shadow hover:shadow-md"
                >
                  {herb.imageUrl && (
                    <img
                      src={herb.imageUrl}
                      alt={herb.herbName}
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {herb.herbName}
                          </h3>
                          <span className="inline-flex rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
                            Pending
                          </span>
                        </div>
                        {herb.scientificName && (
                          <p className="mt-1 text-sm italic text-slate-500 dark:text-slate-400">
                            {herb.scientificName}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHerb(herb);
                          setIsDetailsOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-colors hover:border-emerald-500 hover:text-emerald-700 shrink-0"
                      >
                        <FaEye className="text-[10px]" />
                        View
                      </button>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 line-clamp-2">
                      {herb.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => handleApprove(herb)}
                        disabled={disabled}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {disabled ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <FaCheck className="text-xs" />
                        )}
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(herb)}
                        disabled={disabled}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:border-rose-400 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FaTimes className="text-xs" />
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <HerbDetailsModal
        isOpen={isDetailsOpen}
        herb={selectedHerb}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedHerb(null);
        }}
      />
    </div>
  );
}

export default AdminHerbsPendingPage;
