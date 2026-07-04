import { useEffect, useMemo, useState } from "react";
import { FaLeaf, FaPlus, FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import DiseasesTable from "@components/common/DiseasesTable";
import DiseaseForm from "@components/common/DiseaseForm";
import DiseaseDetailsModal from "@components/features/browse/DiseaseDetailsModal";
import { Pagination } from "@components/common";
import { getAllDiseases, createDisease } from "@api/diseases";

const DISEASES_PER_PAGE = 10;

const normalizeDiseaseProposalPayload = (payload = {}) => ({
  diseaseName: String(payload.diseaseName || "").trim(),
  diseaseType: String(payload.diseaseType || "").trim(),
  description: String(payload.description || "").trim(),
  symptoms: String(payload.symptoms || "").trim(),
  isSupportedByAi:
    payload.isSupportedByAi === true ||
    payload.isSupportedByAi === "true" ||
    payload.isSupportedByAi === "True" ||
    payload.isSupportedByAi === 1,
});

const toBoolean = (value) =>
  value === true || value === "true" || value === "True" || value === 1;

const normalizeDisease = (disease = {}, fallback = {}) => ({
  diseaseId:
    disease.diseaseId ??
    disease.id ??
    fallback.diseaseId ??
    fallback.diseaseName,
  diseaseName:
    disease.diseaseName ?? disease.name ?? fallback.diseaseName ?? "",
  diseaseType:
    disease.diseaseType ?? disease.type ?? fallback.diseaseType ?? "",
  description: disease.description ?? fallback.description ?? "",
  symptoms: disease.symptoms ?? fallback.symptoms ?? "",
  isSupportedByAi: toBoolean(
    disease.isSupportedByAi ?? fallback.isSupportedByAi,
  ),
});

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function HerbalistManageDiseases() {
  // Data State
  const [diseases, setDiseases] = useState([]);
  const [allDiseases, setAllDiseases] = useState([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formError, setFormError] = useState("");
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [showDiseaseDetails, setShowDiseaseDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Load diseases on mount
  useEffect(() => {
    const loadDiseases = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getAllDiseases();

        // Extract the actual disease list from response
        let diseaseList = [];
        if (Array.isArray(response)) {
          diseaseList = response;
        } else if (response?.items && Array.isArray(response.items)) {
          diseaseList = response.items;
        } else if (response?.data && Array.isArray(response.data)) {
          diseaseList = response.data;
        }

        // Normalize diseases
        const normalized = diseaseList
          .map((disease, index) =>
            normalizeDisease(disease, { diseaseId: index }),
          )
          .filter((d) => d.diseaseName);

        setAllDiseases(normalized);
        setDiseases(normalized);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to load diseases";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDiseases();
  }, []);

  // Filter diseases based on search query
  const filteredDiseases = useMemo(() => {
    if (!searchQuery.trim()) return diseases;

    const query = searchQuery.toLowerCase().trim();
    return diseases.filter(
      (disease) =>
        disease.diseaseName?.toLowerCase().includes(query) ||
        disease.diseaseType?.toLowerCase().includes(query) ||
        disease.description?.toLowerCase().includes(query),
    );
  }, [diseases, searchQuery]);

  // Paginate diseases
  const paginatedDiseases = useMemo(() => {
    const startIndex = (currentPage - 1) * DISEASES_PER_PAGE;
    const endIndex = startIndex + DISEASES_PER_PAGE;
    return filteredDiseases.slice(startIndex, endIndex);
  }, [filteredDiseases, currentPage]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle disease creation
  const handleCreateDisease = async (payload) => {
    setFormError("");
    setIsSubmitting(true);

    try {
      const proposalPayload = normalizeDiseaseProposalPayload(payload);
      const createdDisease = await createDisease(proposalPayload);
      const newDisease = normalizeDisease(
        {
          ...createdDisease,
          isSupportedByAi: proposalPayload.isSupportedByAi,
        },
        proposalPayload,
      );

      setAllDiseases((prev) => [newDisease, ...prev]);
      setDiseases((prev) => [newDisease, ...prev]);
      setShowCreateForm(false);
      toast.success(
        `Disease "${newDisease.diseaseName}" submitted for admin review.`,
      );

      // Reset search
      setSearchQuery("");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to create disease";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDiseaseDetails = (disease) => {
    setSelectedDisease(disease);
    setShowDiseaseDetails(true);
  };

  const handleCloseDiseaseDetails = () => {
    setShowDiseaseDetails(false);
    setSelectedDisease(null);
  };

  const aiSupportedCount = useMemo(
    () => allDiseases.filter((disease) => disease.isSupportedByAi).length,
    [allDiseases],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 lg:space-y-8"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-linear-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950/30 dark:via-slate-800 dark:to-amber-950/20 p-5 sm:p-6 lg:p-8"
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
                  <FaLeaf className="text-lg" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                    Manage Diseases
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm font-medium text-slate-600 dark:text-slate-400 sm:text-base">
                    Create and organize disease entries for your recipes and
                    consultations.
                  </p>
                </div>
              </div>

              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="hidden shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 md:inline-flex"
                >
                  <FaPlus className="text-xs" /> New Disease
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Total
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                  {allDiseases.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  AI Supported
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {aiSupportedCount}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Showing
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                  {filteredDiseases.length}
                </p>
              </div>
            </div>

            {!showCreateForm && (
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative group w-full md:max-w-md">
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-slate-400 transition-colors group-focus-within:text-emerald-600">
                    <FaSearch className="text-sm" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search diseases..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pe-4 ps-10 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                  />
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 md:hidden"
                >
                  <FaPlus className="text-xs" /> New Disease
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-5 py-4 text-sm font-bold text-red-600 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Form Modal */}
        <AnimatePresence mode="wait">
          {showCreateForm && (
            <DiseaseForm
              show={showCreateForm}
              onClose={() => {
                setShowCreateForm(false);
                setFormError("");
              }}
              onSubmit={handleCreateDisease}
              isSubmitting={isSubmitting}
              error={formError}
            />
          )}
        </AnimatePresence>

        {/* Diseases Table */}
        <motion.div variants={itemVariants} className="rounded-3xl bg-white/70 dark:bg-slate-800/70">
          <DiseasesTable
            diseases={paginatedDiseases}
            isLoading={isLoading}
            onAddClick={() => setShowCreateForm(true)}
            onViewDetails={handleViewDiseaseDetails}
          />
        </motion.div>

        {/* Pagination */}
        {filteredDiseases.length > 0 && (
          <motion.div variants={itemVariants} className="flex justify-center">
            <Pagination
              totalItems={filteredDiseases.length}
              itemsPerPage={DISEASES_PER_PAGE}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        )}

        <AnimatePresence>
          <DiseaseDetailsModal
            disease={selectedDisease}
            isOpen={showDiseaseDetails}
            onClose={handleCloseDiseaseDetails}
          />
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default HerbalistManageDiseases;
