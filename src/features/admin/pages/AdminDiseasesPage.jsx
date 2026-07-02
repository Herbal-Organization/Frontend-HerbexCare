import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { toast } from "react-hot-toast";
import {
  FaClock,
  FaEye,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";
import DiseaseForm from "@components/common/DiseaseForm";
import DiseasesTable from "@components/common/DiseasesTable";
import DiseaseDetailsModal from "@components/features/browse/DiseaseDetailsModal";
import { Pagination } from "@components/common";
import {
  addAdminDisease,
  approveDisease,
  getAllDiseases,
  getPendingDiseases,
  rejectDisease,
} from "@api/diseases";

const PAGE_SIZE = 10;

const getItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const pick = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const toBoolean = (value) =>
  value === true || value === "true" || value === "True" || value === 1;

const normalizeDisease = (raw = {}) => ({
  diseaseId: pick(raw.diseaseId, raw.id, raw.diseaseID),
  diseaseName: pick(raw.diseaseName, raw.name, raw.label) || "",
  diseaseType: pick(raw.diseaseType, raw.type, raw.category) || "",
  description: pick(raw.description, raw.details) || "",
  symptoms: pick(raw.symptoms, raw.symptom) || "",
  isSupportedByAi: toBoolean(
    pick(raw.isSupportedByAi, raw.isSupportedByAI, raw.aiSupported, false),
  ),
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

function StatCard({ label, value, hint, icon, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100",
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
          {hint ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{hint}</p> : null}
        </div>
        <div className={`rounded-2xl border p-3 ${tones[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

function AdminDiseasesPage() {
  const [allDiseases, setAllDiseases] = useState([]);
  const [pendingDiseases, setPendingDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [processingDiseaseIds, setProcessingDiseaseIds] = useState([]);

  const loadDiseases = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [allResponse, pendingResponse] = await Promise.allSettled([
        getAllDiseases(),
        getPendingDiseases(),
      ]);

      const nextAllDiseases =
        allResponse.status === "fulfilled"
          ? normalizeDiseaseList(allResponse.value)
          : [];
      const nextPendingDiseases =
        pendingResponse.status === "fulfilled"
          ? normalizeDiseaseList(pendingResponse.value)
          : [];

      setAllDiseases(nextAllDiseases);
      setPendingDiseases(nextPendingDiseases);

      const rejection = [allResponse, pendingResponse].find(
        (result) => result.status === "rejected",
      );

      if (rejection) {
        const message =
          rejection.reason?.response?.data?.message ||
          rejection.reason?.response?.data?.title ||
          rejection.reason?.message ||
          "Unable to load diseases.";
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to load diseases.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiseases();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const filteredDiseases = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return allDiseases;

    return allDiseases.filter((disease) => {
      const haystack = [
        disease.diseaseName,
        disease.diseaseType,
        disease.description,
        disease.symptoms,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [allDiseases, searchValue]);

  const totalItems = filteredDiseases.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedDiseases = filteredDiseases.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const aiSupportedCount = allDiseases.filter(
      (disease) => disease.isSupportedByAi,
    ).length;

    return {
      total: allDiseases.length,
      pending: pendingDiseases.length,
      supported: aiSupportedCount,
    };
  }, [allDiseases, pendingDiseases]);

  const isProcessing = (diseaseId) =>
    processingDiseaseIds.includes(String(diseaseId));

  const handleCreateDisease = async (payload) => {
    setCreateError("");
    setIsSubmitting(true);

    try {
      await addAdminDisease(payload);
      toast.success(`Disease "${payload.diseaseName}" created successfully.`);
      setShowCreateForm(false);
      await loadDiseases();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to create disease.";
      setCreateError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const runPendingAction = async (disease, action) => {
    const diseaseId = String(disease?.diseaseId ?? disease?.id ?? "");
    if (!diseaseId) return;

    setProcessingDiseaseIds((current) => [...current, diseaseId]);

    try {
      await action(diseaseId);
      if (selectedDisease?.diseaseId === disease.diseaseId) {
        setIsDetailsOpen(false);
        setSelectedDisease(null);
      }
      await loadDiseases();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to update disease.";
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
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              Disease Registry
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Manage Diseases
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              Review pending disease proposals, approve approved entries, and
              add new diseases directly into the admin registry.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadDiseases}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <FaSyncAlt className="text-sm" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400"
            >
              <FaPlus className="text-sm" />
              Add Disease
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Registered diseases"
          value={stats.total}
          hint="All diseases returned by the live registry API."
          icon={<FaEye className="text-2xl" />}
          tone="emerald"
        />
        <StatCard
          label="Pending approvals"
          value={stats.pending}
          hint="Items waiting for admin review."
          icon={<FaClock className="text-2xl" />}
          tone="amber"
        />
        <StatCard
          label="AI supported"
          value={stats.supported}
          hint="Registry items marked as AI-enabled."
          icon={<FaEye className="text-2xl" />}
          tone="slate"
        />
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Pending approvals
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Approve or reject diseases that are waiting for moderation.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
            <FaClock className="text-[10px]" />
            {pendingDiseases.length} awaiting review
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
          </div>
        ) : pendingDiseases.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No diseases are waiting for approval.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {pendingDiseases.map((disease) => {
              const disabled = isProcessing(disease.diseaseId);

              return (
                <article
                  key={disease.diseaseId}
                  className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {disease.diseaseName}
                        </h3>
                        <span className="inline-flex rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
                          Pending review
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {disease.diseaseType || "No disease type provided"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDetails(disease)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-colors hover:border-emerald-500 hover:text-emerald-700"
                    >
                      <FaEye className="text-[10px]" />
                      View
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {disease.description || "No description provided."}
                    </p>

                    {disease.symptoms ? (
                      <div className="flex flex-wrap gap-2">
                        {parseSymptoms(disease.symptoms)
                          .slice(0, 4)
                          .map((symptom) => (
                            <span
                              key={symptom}
                              className="inline-flex rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400"
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
                          <FaPlus className="text-xs" />
                        )}
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => runPendingAction(disease, rejectDisease)}
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

      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Disease registry
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Search and review the complete disease catalogue.
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
              placeholder="Search diseases by name, type, description, or symptoms..."
              className="block w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 ps-11 pe-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
          </div>
        ) : filteredDiseases.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No diseases match your search.
          </div>
        ) : (
          <div className="space-y-5 pt-5">
            <div className="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
              <p>
                Showing{" "}
                {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)}-
                {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems}{" "}
                diseases
              </p>
              <p>{pendingDiseases.length} pending approvals</p>
            </div>

            <DiseasesTable
              diseases={paginatedDiseases}
              isLoading={false}
              onAddClick={() => setShowCreateForm(true)}
              onViewDetails={handleOpenDetails}
              showAiSupport
            />

            {totalPages > 1 ? (
              <div className="flex justify-center">
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={PAGE_SIZE}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : null}
          </div>
        )}
      </section>

      <AnimatePresence mode="wait">
        {showCreateForm ? (
          <DiseaseForm
            show={showCreateForm}
            onClose={() => {
              setShowCreateForm(false);
              setCreateError("");
            }}
            onSubmit={handleCreateDisease}
            isSubmitting={isSubmitting}
            error={createError}
            showAiSupport
          />
        ) : null}
      </AnimatePresence>

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

export default AdminDiseasesPage;
