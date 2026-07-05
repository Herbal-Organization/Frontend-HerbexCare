import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "motion/react";
import { toast } from "react-hot-toast";
import {
  FaCheck,
  FaClock,
  FaEye,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";
import DiseaseDetailsModal from "@components/features/browse/DiseaseDetailsModal";
import {
  approveDisease,
  getPendingDiseases,
  rejectDisease,
} from "@api/diseases";

const getItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const pick = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeDisease = (raw = {}) => ({
  diseaseId: pick(raw.diseaseId, raw.id, raw.diseaseID),
  diseaseName: pick(raw.diseaseName, raw.name, raw.label) || "",
  diseaseType: pick(raw.diseaseType, raw.type, raw.category) || "",
  description: pick(raw.description, raw.details) || "",
  symptoms: pick(raw.symptoms, raw.symptom) || "",
  proposedBy:
    pick(
      raw.proposedBy,
      raw.proposedByName,
      raw.herbalistName,
      raw.herbalist?.fullName,
      raw.herbalist?.name,
      raw.userName,
    ) || "",
});

const normalizeDiseaseList = (payload) =>
  getItems(payload)
    .map((item) => normalizeDisease(item))
    .filter((item) => item.diseaseName);

const parseSymptoms = (symptomsString) => {
  if (!symptomsString) return [];
  return symptomsString
    .replaceAll(String.fromCharCode(10), ",")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
};

function PendingCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/70">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-8 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

function AdminDiseasesPendingPage() {
  const { t } = useTranslation();
  const [pendingDiseases, setPendingDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingDiseaseIds, setProcessingDiseaseIds] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadPendingDiseases = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getPendingDiseases();
      setPendingDiseases(normalizeDiseaseList(response));
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        t("adminDiseases.error");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingDiseases();
  }, []);

  const isProcessing = (diseaseId) =>
    processingDiseaseIds.includes(String(diseaseId));

  const runPendingAction = async (disease, action) => {
    const diseaseId = String(disease?.diseaseId ?? disease?.id ?? "");
    if (!diseaseId) return;

    const isApproval = action === approveDisease;
    const herbalistName = disease?.proposedBy || "the herbalist";

    setProcessingDiseaseIds((current) => [...current, diseaseId]);

    try {
      await action(diseaseId);
      if (selectedDisease?.diseaseId === disease.diseaseId) {
        setIsDetailsOpen(false);
        setSelectedDisease(null);
      }
      toast.success(
        isApproval
          ? t("adminDiseases.toast.approveSuccess", {
              name: disease.diseaseName,
              herbalist: herbalistName,
            })
          : t("adminDiseases.toast.rejectSuccess", {
              name: disease.diseaseName,
              herbalist: herbalistName,
            }),
      );
      await loadPendingDiseases();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        t("adminDiseases.toast.actionError");
      toast.error(message);
    } finally {
      setProcessingDiseaseIds((current) =>
        current.filter((currentId) => currentId !== diseaseId),
      );
    }
  };

  const handleOpenDetails = (disease) => {
    setSelectedDisease(disease);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-amber-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
              <FaClock className="text-[10px]" />
              {t("adminDiseases.badge")}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminDiseases.pending.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t("adminDiseases.pending.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadPendingDiseases}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <FaSyncAlt className="text-sm" />
              {t("adminDiseases.refresh")}
            </button>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <FaClock className="text-[10px]" />
          {t("adminDiseases.pending.awaitingReview", {
            count: pendingDiseases.length,
          })}
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <PendingCardSkeleton />
          <PendingCardSkeleton />
        </div>
      ) : pendingDiseases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-16 text-center dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-900">
            <FaCheck className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            All caught up!
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {t("adminDiseases.pending.empty")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {pendingDiseases.map((disease) => {
            const disabled = isProcessing(disease.diseaseId);

            return (
              <article
                key={disease.diseaseId}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/70"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {disease.diseaseName}
                      </h3>
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                        {t("adminDiseases.status.pendingReview")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {disease.diseaseType || "—"}
                    </p>
                    {disease.proposedBy && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {t("adminDiseases.pending.proposedBy", {
                          name: disease.proposedBy,
                        })}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDetails(disease)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  >
                    <FaEye className="text-[10px]" />
                    {t("adminDiseases.actions.view")}
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {disease.description || "—"}
                  </p>

                  {disease.symptoms ? (
                    <div className="flex flex-wrap gap-2">
                      {parseSymptoms(disease.symptoms)
                        .slice(0, 4)
                        .map((symptom) => (
                          <span
                            key={symptom}
                            className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          >
                            {symptom}
                          </span>
                        ))}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        runPendingAction(disease, approveDisease)
                      }
                      disabled={disabled}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {disabled ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <FaCheck className="text-xs" />
                      )}
                      {t("adminDiseases.actions.approve")}
                    </button>
                    <button
                      type="button"
                      onClick={() => runPendingAction(disease, rejectDisease)}
                      disabled={disabled}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:border-rose-400 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-800 dark:bg-slate-800 dark:text-rose-400 dark:hover:border-rose-600"
                    >
                      <FaTimes className="text-xs" />
                      {t("adminDiseases.actions.reject")}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        <DiseaseDetailsModal
          disease={selectedDisease}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedDisease(null);
          }}
        />
      </AnimatePresence>
    </div>
  );
}

export default AdminDiseasesPendingPage;
