import { useEffect, useMemo, useState } from "react";
import {
  FaLeaf,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaDollarSign,
  FaSearch,
  FaFilter,
  FaChevronRight,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { getAllHerbs } from "../../../api/herbs";
import { getAllDiseases } from "../../../api/diseases";
import {
  createRecipe,
  getRecipesByHerbalist,
  updateRecipe,
  deactivateRecipe,
} from "../../../api/recipes";

const EMPTY_HERB_ROW = {
  herbId: "",
  quantity: "",
};

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
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
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

  const herbalistId = useMemo(() => {
    return dashboardData?.herbalistProfile?.id || user?.id;
  }, [dashboardData?.herbalistProfile?.id, user?.id]);

  useEffect(() => {
    const loadData = async () => {
      if (!herbalistId) return;

      setIsLoading(true);
      setError("");

      try {
        const [herbsResponse, diseasesResponse, recipesResponse] =
          await Promise.all([
            getAllHerbs(),
            getAllDiseases(),
            getRecipesByHerbalist(herbalistId),
          ]);

        setHerbs(Array.isArray(herbsResponse) ? herbsResponse : []);
        setDiseases(Array.isArray(diseasesResponse) ? diseasesResponse : []);
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
    return existingRecipes.filter(r => 
      r.description?.toLowerCase().includes(query) || 
      r.instructions?.toLowerCase().includes(query)
    );
  }, [existingRecipes, searchQuery]);

  const usedHerbIds = useMemo(
    () => selectedHerbs.map((item) => String(item.herbId)).filter(Boolean),
    [selectedHerbs],
  );

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
    setSelectedDiseaseIds((current) =>
      current.includes(diseaseId)
        ? current.filter((id) => id !== diseaseId)
        : [...current, diseaseId],
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
    setError("");
  };

  const populateFormForEdit = (recipe) => {
    setDescription(recipe.description || "");
    setInstructions(recipe.instructions || "");
    setPrice(recipe.price || "");
    setSelectedDiseaseIds(recipe.diseases?.map((d) => d.diseaseId) || []);
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
      diseaseIds: selectedDiseaseIds,
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
        const recipesResponse = await getRecipesByHerbalist(herbalistId);
        setExistingRecipes(Array.isArray(recipesResponse) ? recipesResponse : []);
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

  const handleDeactivateRecipe = async (recipeId) => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate this recipe? It will no longer be visible to patients.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deactivateRecipe(recipeId);
      toast.success("Recipe deactivated successfully!");

      setExistingRecipes((current) =>
        current.filter((recipe) => recipe.recipeId !== recipeId),
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to deactivate recipe.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Recipes</h1>
            <p className="text-slate-500 font-medium">Create and manage your professional herbal preparations.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {!showCreateForm && (
              <>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <FaSearch className="text-sm" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search recipes..."
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all w-48 md:w-64"
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
            <motion.form
              key="recipe-form"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden"
            >
              <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl">
                    {editingRecipeId ? <FaEdit /> : <FaPlus />}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {editingRecipeId ? "Update Recipe" : "Recipe Builder"}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Step-by-step Configuration</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 md:p-10">
                <div className="max-w-4xl mx-auto space-y-12">
                  {error && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      {error}
                    </motion.div>
                  )}

                  {/* 1. Basic Details */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">1</span>
                      <h3 className="text-lg font-bold text-slate-900">General Information</h3>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="group">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary transition-colors">
                          Recipe Identity
                        </label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="e.g. Lavender Sleep Elixir"
                          className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-sm border font-bold transition-all hover:bg-white"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary transition-colors">
                          Execution Instructions
                        </label>
                        <textarea
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          placeholder="Detail the preparation steps precisely..."
                          className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-sm border font-medium transition-all hover:bg-white resize-none min-h-[140px]"
                        />
                      </div>
                      
                      <div className="group md:max-w-xs">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-primary transition-colors">
                          Set Market Price
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 group-focus-within:text-primary transition-colors">
                            <FaDollarSign />
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-4 pl-12 pr-16 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-lg border font-black transition-all hover:bg-white"
                          />
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 border-l border-slate-200 ml-4 pl-4 uppercase text-[10px] font-black text-slate-400">
                            EGP
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 2. Composition */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">2</span>
                        <h3 className="text-lg font-bold text-slate-900">Active Ingredients</h3>
                      </div>
                      <button
                        type="button"
                        onClick={addHerbRow}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
                      >
                        <FaPlus /> Add Component
                      </button>
                    </div>

                    <div className="grid gap-3">
                      <AnimatePresence initial={false}>
                        {selectedHerbs.map((item, index) => (
                          <motion.div
                            key={`herb-row-${index}`}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10, scale: 0.95 }}
                            className="group flex flex-col md:flex-row gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all items-center"
                          >
                            <div className="relative flex-1 w-full">
                              <select
                                value={item.herbId}
                                onChange={(e) => updateHerbRow(index, "herbId", e.target.value)}
                                className="block w-full rounded-xl border-slate-200 bg-white py-3 pl-4 pr-10 outline-none focus:border-primary text-slate-900 text-sm border font-bold cursor-pointer appearance-none shadow-sm"
                              >
                                <option value="">Select an ingredient...</option>
                                {herbs.map((herb) => {
                                  const herbId = String(herb.herbId);
                                  const isDisabled = usedHerbIds.includes(herbId) && item.herbId !== herbId;
                                  return (
                                    <option key={herb.herbId} value={herb.herbId} disabled={isDisabled}>
                                      {herb.herbName}
                                    </option>
                                  );
                                })}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                                <FaChevronRight className="rotate-90 text-[10px]" />
                              </div>
                            </div>

                            <div className="relative w-full md:w-32">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateHerbRow(index, "quantity", e.target.value)}
                                placeholder="Qty"
                                className="block w-full rounded-xl border-slate-200 bg-white py-3 px-4 outline-none focus:border-primary text-slate-900 text-sm border font-black shadow-sm"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => removeHerbRow(index)}
                              className="flex-none h-11 w-11 flex items-center justify-center rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                            >
                              <FaTrashAlt />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>

                  {/* 3. Diseases */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">3</span>
                      <h3 className="text-lg font-bold text-slate-900">Target Conditions</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {diseases.map((disease) => {
                        const isSelected = selectedDiseaseIds.includes(disease.diseaseId);
                        return (
                          <button
                            type="button"
                            key={disease.diseaseId}
                            onClick={() => toggleDisease(disease.diseaseId)}
                            className={`relative text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-24 ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                            }`}
                          >
                            <span className={`text-xs font-extrabold line-clamp-2 ${isSelected ? 'text-primary' : 'text-slate-900'}`}>
                              {disease.diseaseName}
                            </span>
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                              {disease.diseaseType}
                            </span>
                            {isSelected && (
                              <FaCheckCircle className="absolute top-3 right-3 text-primary text-sm" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl px-8 py-4 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-primary px-10 py-4 text-sm font-black text-white hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent" />
                  ) : (
                    <FaSave className="text-base" />
                  )}
                  {editingRecipeId ? "Commit Updates" : "Publish Recipe"}
                </button>
              </div>
            </motion.form>
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
                  className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white p-20 text-center flex flex-col items-center justify-center"
                >
                  <div className="h-24 w-24 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 rotate-3">
                    <FaLeaf className="h-10 w-10 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {searchQuery ? "No matching recipes found" : "Your recipe book is empty"}
                  </h3>
                  <p className="text-slate-500 font-medium max-w-sm mt-3 mb-8">
                    {searchQuery 
                      ? "Try adjusting your search terms to find what you're looking for." 
                      : "Start growing your professional catalog by creating your first custom herbal recipe."}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/10 hover:-translate-y-1 transition-all"
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
                      className="group rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col"
                    >
                      <div className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-[1rem] flex items-center justify-center text-lg shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                            <FaLeaf />
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Price Point</p>
                            <p className="text-xl font-black text-slate-900">
                              <span className="text-xs text-slate-400 mr-0.5 font-bold">EGP</span>
                              {recipe.price || 0}
                            </p>
                          </div>
                        </div>
                        
                        <h3 className="font-black text-xl text-slate-900 line-clamp-2 mb-3 leading-tight group-hover:text-primary transition-colors">
                          {recipe.description}
                        </h3>
                        
                        <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-8 flex-1 leading-relaxed">
                          {recipe.instructions}
                        </p>

                        <div className="space-y-4">
                          <div className="h-px bg-slate-100" />
                          <div className="flex flex-wrap gap-1.5">
                            {recipe.herbs?.slice(0, 4).map((herb, idx) => (
                              <span
                                key={idx}
                                className="inline-flex px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-tighter"
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
                      
                      <div className="bg-slate-50/50 backdrop-blur-sm border-t border-slate-100 p-6 flex gap-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => populateFormForEdit(recipe)}
                          className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 text-xs font-black text-slate-700 shadow-sm hover:border-primary hover:text-primary transition-all active:scale-95"
                        >
                          <FaEdit className="text-sm" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeactivateRecipe(recipe.recipeId)}
                          disabled={isDeleting}
                          className="inline-flex justify-center items-center h-11 w-11 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-100 hover:text-red-500 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                          title="Deactivate Recipe"
                        >
                          <FaTrashAlt />
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
    </div>
  );
}

export default HerbalistManageRecipes;
