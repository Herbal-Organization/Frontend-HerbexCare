import { useEffect, useMemo, useState } from "react";
import {
  FaLeaf,
  FaPlus,
  FaEdit,
  FaTimes,
  FaSearch,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import RecipeForm from "./manage-recipe/RecipeForm";
import RecipeReviewsSection from "./manage-recipe/RecipeReviewsSection";
import { getAllHerbs } from "@api/herbs";
import { getAllDiseaseNames } from "@api/diseases";
import {
  createRecipe,
  getRecipesByHerbalist,
  updateRecipe,
  toggleRecipeAvailability,
} from "@api/recipes";

const EMPTY_HERB_ROW = {
  herbId: "",
  quantity: "",
};

const extractHerbsArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

const extractDiseasesArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

const normalizeDisease = (disease, index = 0) => {
  if (!disease) return null;

  const diseaseName =
    disease.diseaseName ?? disease.name ?? disease.label ?? String(disease);
  const diseaseId =
    disease.diseaseId ?? disease.id ?? disease.value ?? diseaseName ?? index;

  if (!diseaseName) return null;

  return {
    diseaseId: String(diseaseId),
    diseaseName: String(diseaseName),
    diseaseType: disease.diseaseType ?? disease.type ?? "",
  };
};

const normalizeDiseaseList = (responseData) =>
  extractDiseasesArray(responseData)
    .map((disease, index) => normalizeDisease(disease, index))
    .filter(Boolean);

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
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

function HerbalistManageRecipes({ user, dashboardData }) {
  // Form State
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [price, setPrice] = useState("");
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState([]);
  const [selectedHerbs, setSelectedHerbs] = useState([{ ...EMPTY_HERB_ROW }]);

  // Data State
  const [herbs, setHerbs] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [existingRecipes, setExistingRecipes] = useState([]);
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipeForReviews, setSelectedRecipeForReviews] = useState(null);

  const herbalistId = useMemo(() => {
    return dashboardData?.herbalistProfile?.id || user?.id;
  }, [dashboardData?.herbalistProfile?.id, user?.id]);

  useEffect(() => {
    const loadDiseases = async () => {
      const diseasesResponse = await getAllDiseaseNames();
      setDiseases(normalizeDiseaseList(diseasesResponse));
    };

    const loadData = async () => {
      if (!herbalistId) return;

      setIsLoading(true);
      setError("");

      try {
        const [herbsResponse, recipesResponse] = await Promise.all([
          getAllHerbs(1, 1000),
          getRecipesByHerbalist(herbalistId, 1, 1000),
          loadDiseases(),
        ]);

        setHerbs(extractHerbsArray(herbsResponse));
        setExistingRecipes(
          Array.isArray(recipesResponse) ? recipesResponse : [],
        );
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to load data for recipe management.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [herbalistId]);

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return existingRecipes;
    const query = searchQuery.toLowerCase().trim();
    return existingRecipes.filter(
      (r) =>
        r.description?.toLowerCase().includes(query) ||
        r.instructions?.toLowerCase().includes(query),
    );
  }, [existingRecipes, searchQuery]);

  const addHerbRow = () => {
    setSelectedHerbs((current) => [...current, { ...EMPTY_HERB_ROW }]);
  };

  const removeHerbRow = (index) => {
    setSelectedHerbs((current) =>
      current.length === 1
        ? [{ ...EMPTY_HERB_ROW }]
        : current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const updateHerbRow = (index, field, value) => {
    setSelectedHerbs((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const toggleDisease = (diseaseId) => {
    const normalizedDiseaseId = String(diseaseId);
    setSelectedDiseaseIds((current) =>
      current.includes(normalizedDiseaseId)
        ? current.filter((id) => id !== normalizedDiseaseId)
        : [...current, normalizedDiseaseId],
    );
  };

  const resetForm = () => {
    setDescription("");
    setInstructions("");
    setPrice("");
    setSelectedDiseaseIds([]);
    setSelectedHerbs([{ ...EMPTY_HERB_ROW }]);
    setEditingRecipeId(null);
    setShowCreateForm(false);
    setSearchQuery("");
    setError("");
  };

  const populateFormForEdit = (recipe) => {
    setDescription(recipe.description || "");
    setInstructions(recipe.instructions || "");
    setPrice(recipe.price || "");
    setSelectedDiseaseIds(
      recipe.diseases?.map((d) => String(d.diseaseId ?? d.id ?? "")) || [],
    );
    setSelectedHerbs(
      recipe.herbs?.length > 0
        ? recipe.herbs.map((h) => ({
            herbId: String(h.herbId || h.id || ""),
            quantity: String(h.quantity || h.amount || 1),
          }))
        : [{ ...EMPTY_HERB_ROW }],
    );
    setEditingRecipeId(recipe.recipeId);
    setShowCreateForm(true);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedHerbs = selectedHerbs
      .filter((item) => item.herbId && item.quantity)
      .map((item) => ({
        herbId: Number(item.herbId),
        quantity: Number(item.quantity),
      }));

    if (!description.trim()) {
      setError("Recipe description is required.");
      return;
    }

    if (!instructions.trim()) {
      setError("Recipe instructions are required.");
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a valid positive number.");
      return;
    }

    if (!normalizedHerbs.length) {
      setError("Please add at least one herb with a quantity.");
      return;
    }

    setIsSaving(true);

    const payload = {
      description: description.trim(),
      instructions: instructions.trim(),
      price: priceNum,
      herbs: normalizedHerbs,
      diseaseIds: selectedDiseaseIds
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id)),
    };

    try {
      if (editingRecipeId) {
        await updateRecipe(editingRecipeId, payload);
        toast.success("Recipe updated successfully!");
      } else {
        await createRecipe(payload);
        toast.success("Recipe created successfully!");
      }

      // Refresh list
      if (herbalistId) {
        const recipesResponse = await getRecipesByHerbalist(
          herbalistId,
          1,
          1000,
          "",
          "",
          "",
          null,
        );
        setExistingRecipes(
          Array.isArray(recipesResponse) ? recipesResponse : [],
        );
      }
      resetForm();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        `Failed to ${editingRecipeId ? "update" : "create"} recipe.`;
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateRecipe = async (recipe) => {
    const recipeId = recipe.recipeId;
    const currentlyActive = recipe.isActive !== false;

    const confirmMessage = currentlyActive
      ? "Are you sure you want to deactivate this recipe? It will no longer be visible to patients."
      : "Are you sure you want to activate this recipe? It will be visible to patients.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      await toggleRecipeAvailability(recipeId);
      toast.success(
        currentlyActive
          ? "Recipe deactivated successfully!"
          : "Recipe activated successfully!",
      );

      // Refresh the recipe list for current herbalist
      if (herbalistId) {
        const recipesResponse = await getRecipesByHerbalist(herbalistId);
        setExistingRecipes(
          Array.isArray(recipesResponse) ? recipesResponse : [],
        );
      } else {
        // Fallback: optimistically toggle local state
        setExistingRecipes((current) =>
          current.map((r) =>
            r.recipeId === recipeId ? { ...r, isActive: !currentlyActive } : r,
          ),
        );
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to toggle recipe availability.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
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
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Manage Recipes
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Create and manage your professional herbal preparations.
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
                    placeholder="Search recipes..."
                    className="ps-10 pe-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all w-48 md:w-64"
                  />
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
                >
                  <FaPlus className="text-xs" /> New Recipe
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Form Overlay / Section */}
        <AnimatePresence mode="wait">
          {showCreateForm && (
            <RecipeForm
              show={showCreateForm}
              editingRecipeId={editingRecipeId}
              description={description}
              setDescription={setDescription}
              instructions={instructions}
              setInstructions={setInstructions}
              price={price}
              setPrice={setPrice}
              selectedHerbs={selectedHerbs}
              selectedDiseaseIds={selectedDiseaseIds}
              herbs={herbs}
              diseases={diseases}
              error={error}
              isSaving={isSaving}
              isDeleting={isDeleting}
              addHerbRow={addHerbRow}
              removeHerbRow={removeHerbRow}
              updateHerbRow={updateHerbRow}
              toggleDisease={toggleDisease}
              resetForm={resetForm}
              handleSubmit={handleSubmit}
            />
          )}
        </AnimatePresence>

        {/* Existing Recipes List */}
        {!showCreateForm && (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {!filteredRecipes.length ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-20 text-center flex flex-col items-center justify-center"
                >
                  <div className="h-24 w-24 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 rotate-3">
                    <FaLeaf className="h-10 w-10 text-slate-200 dark:text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {searchQuery
                      ? "No matching recipes found"
                      : "Your recipe book is empty"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mt-3 mb-8">
                    {searchQuery
                      ? "Try adjusting your search terms to find what you're looking for."
                      : "Start growing your professional catalog by creating your first custom herbal recipe."}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-slate-700 px-8 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/10 dark:shadow-slate-900/30 hover:-translate-y-1 transition-all"
                    >
                      <FaPlus /> Define New Recipe
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {filteredRecipes.map((recipe) => (
                    <motion.div
                      layout
                      key={recipe.recipeId}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="group rounded-4xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col"
                    >
                      <div className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-lg shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                            <FaLeaf />
                          </div>
                          <div className="text-end">
                            <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1">
                              Price Point
                            </p>
                            <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                              <span className="text-xs text-slate-400 dark:text-slate-500 me-0.5 font-bold">
                                EGP
                              </span>
                              {recipe.price || 0}
                            </p>
                          </div>
                        </div>

                        <h3 className="font-black text-xl text-slate-900 dark:text-slate-100 line-clamp-2 mb-3 leading-tight group-hover:text-primary transition-colors">
                          {recipe.description}
                        </h3>

                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-3 mb-8 flex-1 leading-relaxed">
                          {recipe.instructions}
                        </p>

                        <div className="space-y-4">
                          <div className="h-px bg-slate-100 dark:bg-slate-700" />
                          <div className="flex flex-wrap gap-1.5">
                            {recipe.herbs?.slice(0, 4).map((herb, idx) => (
                              <span
                                key={idx}
                                className="inline-flex px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter"
                              >
                                {herb.herbName}
                              </span>
                            ))}
                            {recipe.herbs?.length > 4 && (
                              <span className="inline-flex px-2 py-1.5 text-[10px] font-black text-primary bg-primary/5 rounded-lg">
                                +{recipe.herbs.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-100 dark:border-slate-700 p-6 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => setSelectedRecipeForReviews(recipe)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-bold text-amber-600 shadow-sm hover:border-amber-400 hover:text-amber-500 transition-all active:scale-95"
                          title="View patient reviews"
                        >
                          <FaStar className="text-[10px]" />
                          <span>Reviews</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => populateFormForEdit(recipe)}
                          className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 shadow-sm hover:border-primary hover:text-primary transition-all active:scale-95"
                        >
                          <FaEdit className="text-sm" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeactivateRecipe(recipe)}
                          disabled={isDeleting}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-black text-xs transition-colors disabled:opacity-50 ${
                            recipe.isActive === false
                              ? "border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                              : "border border-rose-100 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                          }`}
                          title={
                            recipe.isActive === false
                              ? "Activate Recipe"
                              : "Deactivate Recipe"
                          }
                        >
                          {recipe.isActive === false ? (
                            <>
                              <FaCheckCircle className="text-sm" />
                              <span className="text-xs">Activate</span>
                            </>
                          ) : (
                            <>
                              <FaTimes className="text-sm" />
                              <span className="text-xs">Deactivate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Reviews Modal */}
      <AnimatePresence>
        {selectedRecipeForReviews ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
            onClick={() => setSelectedRecipeForReviews(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-6 py-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600">
                    Patient Feedback
                  </p>
                  <h3 className="mt-1 truncate text-lg font-black text-slate-900 dark:text-slate-100">
                    {selectedRecipeForReviews.description}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRecipeForReviews(null)}
                  className="rounded-full bg-white dark:bg-slate-700 p-2 text-slate-400 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-slate-700 dark:text-slate-300 shrink-0"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto p-6">
                <RecipeReviewsSection
                  recipeId={selectedRecipeForReviews.recipeId}
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default HerbalistManageRecipes;
