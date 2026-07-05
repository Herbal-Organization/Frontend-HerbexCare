import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "motion/react";
import { toast } from "react-hot-toast";
import {
  FaEye,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaVirus,
} from "react-icons/fa";
import DiseaseForm from "@components/common/DiseaseForm";
import DiseasesTable from "@components/common/DiseasesTable";
import DiseaseDetailsModal from "@components/features/browse/DiseaseDetailsModal";
import { Pagination } from "@components/common";
import StatCard from "@features/admin/components/herbs/StatCard";
import {
  addAdminDisease,
  getAllDiseases,
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

function StatCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

function AdminDiseasesAllPage() {
  const { t } = useTranslation();
  const [allDiseases, setAllDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadDiseases = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAllDiseases();
      setAllDiseases(normalizeDiseaseList(response));
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
      supported: aiSupportedCount,
    };
  }, [allDiseases]);

  const handleCreateDisease = async (payload) => {
    setCreateError("");
    setIsSubmitting(true);

    try {
      await addAdminDisease(payload);
      toast.success(
        t("adminDiseases.toast.createSuccess", { name: payload.diseaseName }),
      );
      setShowCreateForm(false);
      await loadDiseases();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        t("adminDiseases.toast.createError");
      setCreateError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
              {t("adminDiseases.badge")}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminDiseases.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t("adminDiseases.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadDiseases}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <FaSyncAlt className="text-sm" />
              {t("adminDiseases.refresh")}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-400"
            >
              <FaPlus className="text-sm" />
              {t("adminDiseases.addDisease")}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label={t("adminDiseases.stats.registered")}
              value={stats.total}
              hint={t("adminDiseases.stats.registeredHint")}
              icon={<FaEye className="text-2xl" />}
              tone="emerald"
            />
            <StatCard
              label={t("adminDiseases.stats.aiSupported")}
              value={stats.supported}
              hint={t("adminDiseases.stats.aiSupportedHint")}
              icon={<FaVirus className="text-2xl" />}
              tone="slate"
            />
          </>
        )}
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-700 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t("adminDiseases.registry.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("adminDiseases.registry.description")}
            </p>
          </div>

          <div className="relative w-full lg:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 flex items-center ps-4 text-slate-400">
              <FaSearch className="text-sm" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t("adminDiseases.registry.searchPlaceholder")}
              className="block w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 ps-11 pe-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:bg-slate-800"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 pt-5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700/50"
              />
            ))}
          </div>
        ) : filteredDiseases.length === 0 ? (
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
              <FaVirus className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("adminDiseases.registry.empty")}
            </p>
          </div>
        ) : (
          <div className="space-y-5 pt-5">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <p>
                {t("adminDiseases.registry.showing", {
                  from: Math.min(
                    (currentPage - 1) * PAGE_SIZE + 1,
                    totalItems,
                  ),
                  to: Math.min(currentPage * PAGE_SIZE, totalItems),
                  total: totalItems,
                })}
              </p>
            </div>

            <DiseasesTable
              diseases={paginatedDiseases}
              isLoading={false}
              onAddClick={() => setShowCreateForm(true)}
              onViewDetails={handleOpenDetails}
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

export default AdminDiseasesAllPage;
