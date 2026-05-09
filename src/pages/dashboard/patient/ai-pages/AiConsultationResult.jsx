import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaCheckCircle,
  FaSpinner,
  FaPlus,
  FaBookmark,
  FaRegBookmark,
  FaClock,
  FaLeaf,
} from "react-icons/fa";
import { myAllConsultations } from "../../../../api/aiConsultations";
import {
  toggleFavorite,
  getMyAIRecipesFavorites,
} from "../../../../api/favorites";
import { normalizeGeneratedRecipe } from "./aiConsultationUtils";

function AiConsultationResult({ result, onNewConsultation }) {
  const [activeTab, setActiveTab] = useState("recipe");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await myAllConsultations();
      setHistory(data || []);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const renderIngredientsList = (ingredients) => {
    if (!ingredients) return null;

    // Handle different ingredient formats
    let ingredientsList = [];

    if (Array.isArray(ingredients)) {
      ingredientsList = ingredients;
    } else if (typeof ingredients === "string") {
      ingredientsList = ingredients
        .split(/[\n,;]/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0);
    } else if (typeof ingredients === "object") {
      ingredientsList = Object.entries(ingredients).map(
        ([key, value]) => `${key}: ${value}`,
      );
    }

    return (
      <div className="space-y-2">
        {ingredientsList.map((ingredient, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <span className="text-emerald-600 font-bold text-lg mt-1">✓</span>
            <span className="text-slate-700">{ingredient}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderInstructions = (instructions) => {
    if (!instructions) return null;

    let instructionsList = [];

    if (Array.isArray(instructions)) {
      instructionsList = instructions;
    } else if (typeof instructions === "string") {
      instructionsList = instructions
        .split(/[\n]/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0);
    }

    return (
      <div className="space-y-3">
        {instructionsList.map((instruction, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold shrink-0">
              {idx + 1}
            </div>
            <span className="text-slate-700 pt-0.5">
              {instruction.replace(/^\d+\.\s*/, "")}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const handleSaveRecipe = async () => {
    if (savingRecipe) return;
    setSavingRecipe(true);
    try {
      const payload = {
        recipeId: result.id || result.consultationId,
        type: "AI_RECIPE",
      };
      await toggleFavorite(payload);
      setIsSaved(!isSaved);
      toast.success(
        isSaved ? "Recipe removed from favorites" : "Recipe saved to favorites!",
      );
    } catch (error) {
      toast.error("Failed to save recipe");
      console.error(error);
    } finally {
      setSavingRecipe(false);
    }
  };

  if (!result) return null;

  const structuredRecipe = normalizeGeneratedRecipe(result);

  const recipeContent =
    typeof result === "string" ? result : JSON.stringify(result, null, 2);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 p-4 text-white shadow-lg">
            <FaCheckCircle className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Recipe Generated Successfully
            </h1>
            <p className="text-slate-600">
              Your personalized herbal remedy recommendation
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveRecipe}
          disabled={savingRecipe}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition ${
            isSaved
              ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          } ${savingRecipe ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {savingRecipe ? (
            <>
              <FaSpinner className="text-amber-500 animate-spin" />
              Saving...
            </>
          ) : isSaved ? (
            <>
              <FaBookmark className="text-amber-500" />
              Saved to Favorites
            </>
          ) : (
            <>
              <FaRegBookmark />
              Save Recipe
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("recipe")}
          className={`px-4 py-3 font-semibold text-sm transition border-b-2 ${
            activeTab === "recipe"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <FaLeaf className="inline mr-2" />
          Generated Recipe
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-3 font-semibold text-sm transition border-b-2 ${
            activeTab === "history"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <FaClock className="inline mr-2" />
          History
        </button>
      </div>

      {/* Recipe Tab */}
      {activeTab === "recipe" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Recipe */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-linear-to-r from-emerald-50 to-teal-50 border-b border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Herbal Recipe Recommendation
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Based on your health profile and symptoms
                </p>
              </div>

              {/* Recipe Content */}
              <div className="p-6 sm:p-8 space-y-8">
                {(() => {
                  const recipeData = structuredRecipe.raw || {};

                  return (
                    <>
                      {/* Recipe Name */}
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900">
                          {structuredRecipe.title}
                        </h3>
                      </div>

                      {/* Ingredients Section */}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <span className="text-2xl">🌿</span>
                          Ingredients
                        </h3>
                        <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                          {structuredRecipe.ingredients.length > 0 ? (
                            renderIngredientsList(structuredRecipe.ingredients)
                          ) : (
                            <p className="text-slate-700">
                              No ingredients were returned for this recipe.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Instructions Section */}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <span className="text-2xl">📋</span>
                          Preparation Instructions
                        </h3>
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                          {structuredRecipe.preparationInstructions.length >
                          0 ? (
                            renderInstructions(
                              structuredRecipe.preparationInstructions,
                            )
                          ) : (
                            <p className="text-slate-700">
                              Preparation instructions were not returned by the
                              AI response.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Dosage Section */}
                      {(recipeData.dosage ||
                        recipeData.usage ||
                        recipeData.duration) && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">⏱️</span>
                            Usage & Dosage
                          </h3>
                          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200 space-y-3">
                            {recipeData.dosage && (
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-purple-900 mb-2">
                                  Dosage
                                </p>
                                <p className="text-slate-700">
                                  {recipeData.dosage}
                                </p>
                              </div>
                            )}
                            {recipeData.usage && (
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-purple-900 mb-2">
                                  Usage
                                </p>
                                <p className="text-slate-700">
                                  {recipeData.usage}
                                </p>
                              </div>
                            )}
                            {recipeData.duration && (
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-purple-900 mb-2">
                                  Duration
                                </p>
                                <p className="text-slate-700">
                                  {recipeData.duration}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Benefits Section */}
                      {(recipeData.benefits || recipeData.expectedBenefits) && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            Expected Benefits
                          </h3>
                          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                            {Array.isArray(
                              recipeData.benefits ||
                                recipeData.expectedBenefits,
                            ) ? (
                              <ul className="space-y-2">
                                {(
                                  recipeData.benefits ||
                                  recipeData.expectedBenefits
                                ).map((benefit, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 text-slate-700"
                                  >
                                    <span className="text-yellow-600 font-bold">
                                      →
                                    </span>
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-slate-700">
                                {recipeData.benefits ||
                                  recipeData.expectedBenefits}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Precautions Section */}
                      {(recipeData.precautions ||
                        recipeData.warnings ||
                        recipeData.contraindications) && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">⚠️</span>
                            Precautions & Warnings
                          </h3>
                          <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                            <p className="text-slate-700">
                              {recipeData.precautions ||
                                recipeData.warnings ||
                                recipeData.contraindications}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Additional Info */}
                      {(recipeData.storageInstructions ||
                        recipeData.storage ||
                        recipeData.notes) && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">💡</span>
                            Additional Information
                          </h3>
                          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 space-y-3">
                            {(recipeData.storageInstructions ||
                              recipeData.storage) && (
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-2">
                                  Storage
                                </p>
                                <p className="text-slate-700">
                                  {recipeData.storageInstructions ||
                                    recipeData.storage}
                                </p>
                              </div>
                            )}
                            {recipeData.notes && (
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-2">
                                  Notes
                                </p>
                                <p className="text-slate-700">
                                  {recipeData.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Disclaimer */}
                      <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 mt-6">
                        <p className="text-sm font-semibold text-yellow-900 mb-2">
                          ⚕️ Important Medical Disclaimer
                        </p>
                        <p className="text-sm text-yellow-800">
                          This is an AI-generated recommendation and should not
                          be considered professional medical advice. Always
                          consult with a qualified healthcare provider or
                          registered herbalist before starting any new
                          treatment, especially if you are pregnant, nursing,
                          taking medications, or have underlying health
                          conditions. Discontinue use immediately if you
                          experience any adverse reactions.
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Confidence Score */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-900 mb-3">
                Confidence Score
              </h3>
              <div className="flex items-end gap-4">
                <div className="text-4xl font-bold text-emerald-600">
                  {structuredRecipe.confidenceScore || 78}
                </div>
                <div className="text-sm text-emerald-700 mb-1">%</div>
              </div>
              <div className="mt-4 h-2 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all"
                  style={{
                    width: `${structuredRecipe.confidenceScore || 78}%`,
                  }}
                />
              </div>
              <p className="text-xs text-emerald-700 mt-3">
                Reliability of this recommendation
              </p>
            </div>

            {/* Quick Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                Key Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span className="text-slate-600">
                    <strong>Type:</strong> Herbal Blend
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span className="text-slate-600">
                    <strong>Safety:</strong> Natural ingredients
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span className="text-slate-600">
                    <strong>Duration:</strong> 2-4 weeks typical
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Consultation History
            </h2>
          </div>

          <div className="p-6">
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <FaSpinner className="text-3xl text-emerald-600 animate-spin" />
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          Consultation #{idx + 1}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                        View
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">No previous consultations</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3 justify-center">
        <button
          onClick={onNewConsultation}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500 transition shadow-lg hover:shadow-xl"
        >
          <FaPlus className="text-sm" />
          Generate Another Recipe
        </button>
      </div>
    </div>
  );
}

export default AiConsultationResult;
