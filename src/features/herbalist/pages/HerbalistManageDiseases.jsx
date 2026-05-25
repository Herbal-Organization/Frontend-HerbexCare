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
        `Disease "${newDisease.diseaseName}" created successfully!`,
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Manage Diseases
            </h1>
            <p className="text-slate-500 font-medium">
              Create and organize disease entries for your recipes and
              consultations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!showCreateForm && (
              <>
                <div className="relative group">
                  <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <FaSearch className="text-sm" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search diseases..."
                    className="ps-10 pe-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all w-48 md:w-64"
                  />
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
                >
                  <FaPlus className="text-xs" /> New Disease
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-eed-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600"
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
              showAiSupport
            />
          )}
        </AnimatePresence>

        {/* Diseases Table */}
        <motion.div variants={itemVariants}>
          <DiseasesTable
            diseases={paginatedDiseases}
            isLoading={isLoading}
            onAddClick={() => setShowCreateForm(true)}
            onViewDetails={handleViewDiseaseDetails}
            showAiSupport
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
