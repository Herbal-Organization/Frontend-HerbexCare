import { useEffect, useMemo, useState } from "react";
import {
  FaLeaf,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaEye,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { getAllHerbs } from "../../../api/herbs";
import { getAllDiseases } from "../../../api/diseases";
import {
  createRecipe,
  getAllRecipes,
  updateRecipe,
  deleteRecipe,
} from "../../../api/recipes";

const EMPTY_HERB_ROW = {
  herbId: "",
  quantity: "",
};

function HerbalistManageRecipes() {
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState([]);
  const [selectedHerbs, setSelectedHerbs] = useState([{ ...EMPTY_HERB_ROW }]);
  const [herbs, setHerbs] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [existingRecipes, setExistingRecipes] = useState([]);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [herbsResponse, diseasesResponse, recipesResponse] =
          await Promise.all([getAllHerbs(), getAllDiseases(), getAllRecipes()]);

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
  }, []);

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
    setSelectedDiseaseIds([]);
    setSelectedHerbs([{ ...EMPTY_HERB_ROW }]);
    setEditingRecipeId(null);
    setShowCreateForm(false);
  };

  const populateFormForEdit = (recipe) => {
    console.log("Populating form for edit with recipe:", recipe);
    console.log("Recipe herbs:", recipe.herbs);
    console.log("Recipe diseases:", recipe.diseases);

    setDescription(recipe.description || "");
    setInstructions(recipe.instructions || "");
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

    if (!normalizedHerbs.length) {
      setError("Please add at least one herb with a quantity.");
      return;
    }

    if (
      normalizedHerbs.some(
        (item) => Number.isNaN(item.quantity) || item.quantity <= 0,
      )
    ) {
      setError("Herb quantities must be numbers greater than 0.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingRecipeId) {
        console.log("Updating recipe:", editingRecipeId, {
          description: description.trim(),
          instructions: instructions.trim(),
          herbs: normalizedHerbs,
          targetedDiseases: selectedDiseaseIds,
        });

        await updateRecipe(editingRecipeId, {
          description: description.trim(),
          instructions: instructions.trim(),
          herbs: normalizedHerbs,
          targetedDiseases: selectedDiseaseIds,
        });
        toast.success("Recipe updated successfully!");

        // Clear editing state but keep form open for further edits
        setEditingRecipeId(null);
        setDescription("");
        setInstructions("");
        setSelectedDiseaseIds([]);
        setSelectedHerbs([{ ...EMPTY_HERB_ROW }]);
      } else {
        await createRecipe({
          description: description.trim(),
          instructions: instructions.trim(),
          herbs: normalizedHerbs,
          targetedDiseases: selectedDiseaseIds,
        });
        toast.success("Recipe created successfully!");

        // Reset form after creating
        resetForm();
      }

      // Reload recipes
      console.log("Reloading recipes after update...");
      const recipesResponse = await getAllRecipes();
      console.log("Recipes response:", recipesResponse);
      setExistingRecipes(Array.isArray(recipesResponse) ? recipesResponse : []);
      console.log("Recipes updated in state");

      if (!editingRecipeId) {
        setShowCreateForm(false);
      }
    } catch (err) {
      console.error("Recipe operation failed:", err);
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

  const handleDeleteRecipe = async (recipeId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this recipe? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRecipe(recipeId);
      toast.success("Recipe deleted successfully!");

      // Remove from local state
      setExistingRecipes((current) =>
        current.filter((recipe) => recipe.recipeId !== recipeId),
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to delete recipe.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Manage Recipes</h1>
          <p className="text-slate-600 mt-1">
            Create, edit, and manage herbal recipes.
          </p>
        </div>

        <div className="p-6">
          {error && !showCreateForm ? (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {/* Existing Recipes List */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Your Recipes
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                <FaPlus className="text-xs" />
                {showCreateForm ? "Cancel" : "Add Recipe"}
              </button>
            </div>

            {!existingRecipes.length ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <FaLeaf className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="text-slate-600">
                  No recipes found. Create your first recipe!
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {existingRecipes.map((recipe) => (
                  <div
                    key={recipe.recipeId}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4">
                      <h3 className="font-semibold text-slate-900 line-clamp-2">
                        {recipe.description}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                        {recipe.instructions}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Herbs ({recipe.herbs?.length || 0})
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {recipe.herbs?.slice(0, 3).map((herb, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                          >
                            <FaLeaf className="text-xs" />
                            {herb.herbName || `Herb ${herb.herbId}`}
                          </span>
                        ))}
                        {recipe.herbs?.length > 3 && (
                          <span className="text-xs text-slate-500">
                            +{recipe.herbs.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => populateFormForEdit(recipe)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <FaEdit className="text-xs" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecipe(recipe.recipeId)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <FaTrashAlt className="text-xs" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              {error ? (
                <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingRecipeId ? "Edit Recipe" : "Create New Recipe"}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <FaTimes className="text-xs" />
                  Cancel
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Recipe Content
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Describe the herbal recipe and what it is for."
                      className="block w-full rounded-xl border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium min-h-[110px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Instructions
                    </label>
                    <textarea
                      value={instructions}
                      onChange={(event) => setInstructions(event.target.value)}
                      placeholder="Write clear preparation and usage instructions."
                      className="block w-full rounded-xl border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium min-h-[140px]"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Herbs and Quantities
                  </h3>
                  <button
                    type="button"
                    onClick={addHerbRow}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FaPlus className="text-xs" />
                    Add Herb
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedHerbs.map((item, index) => (
                    <div
                      key={`herb-row-${index}`}
                      className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_180px_auto]"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Herb
                        </label>
                        <select
                          value={item.herbId}
                          onChange={(event) =>
                            updateHerbRow(index, "herbId", event.target.value)
                          }
                          className="block w-full rounded-xl border-slate-200 bg-white py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
                        >
                          <option value="">Select herb</option>
                          {herbs.map((herb) => {
                            const herbId = String(herb.herbId);
                            const isDisabled =
                              usedHerbIds.includes(herbId) &&
                              item.herbId !== herbId;

                            return (
                              <option
                                key={herb.herbId}
                                value={herb.herbId}
                                disabled={isDisabled}
                              >
                                {herb.herbName}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateHerbRow(index, "quantity", event.target.value)
                          }
                          className="block w-full rounded-xl border-slate-200 bg-white py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 text-sm border font-medium"
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeHerbRow(index)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <FaTrashAlt className="text-xs" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Target Diseases
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {diseases.map((disease) => {
                    const isSelected = selectedDiseaseIds.includes(
                      disease.diseaseId,
                    );

                    return (
                      <label
                        key={disease.diseaseId}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDisease(disease.diseaseId)}
                          className="mt-1"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {disease.diseaseName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {disease.diseaseType}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {disease.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {!diseases.length ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    No diseases were returned by the API.
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingRecipeId ? "Updating..." : "Creating..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaSave className="text-xs" />
                      {editingRecipeId ? "Update Recipe" : "Create Recipe"}
                    </div>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default HerbalistManageRecipes;
