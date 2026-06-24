import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FaHeart,
  FaSpinner,
  FaTrash,
  FaArrowLeft,
  FaBrain,
  FaPlus,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import { getMyAIRecipesFavorites, toggleFavorite } from "@api/favorites";
import { normalizeGeneratedRecipe } from "./aiConsultationUtils";
import { useNavigate } from "react-router-dom";
import { fetchCatalogById } from "@api/aiConsultations";
import AiRecipeAddToCartAction from "./AiRecipeAddToCartAction";

function extractFavoritesArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function FavoriteRecipes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail States
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setViewMode("list");
    try {
      const data = await getMyAIRecipesFavorites();
      const favoritesList = extractFavoritesArray(data);
      
      const detailedFavorites = await Promise.all(
        favoritesList.map(async (item) => {
          const targetId = item.targetId;
          if (targetId) {
            try {
              const details = await fetchCatalogById(targetId);
              return { ...item, ...details }; // Merge details into the item
            } catch (err) {
              console.error(`Failed to fetch details for AI recipe ${targetId}:`, err);
              return item;
            }
          }
          return item;
        })
      );
      
      setFavorites(detailedFavorites);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      toast.error(t("aiConsultation.favorites.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId, e) => {
    if (e) e.stopPropagation();
    try {
      const targetId = Number(recipeId || 0);
      if (!targetId) {
        throw new Error("Invalid AI recipe id");
      }

      await toggleFavorite({
        targetId,
        type: "AiRecipe",
      });
      setFavorites((current) =>
        current.filter((f) => {
          const currentId = Number(f.id || f.recipeId || f.targetId || 0);
          return currentId !== targetId;
        }),
      );
      if (
        selectedDetail &&
        Number(selectedDetail.id || selectedDetail.recipeId || 0) === targetId
      ) {
        setViewMode("list");
        setSelectedDetail(null);
      }
      toast.success(t("aiConsultation.favorites.messages.removeSuccess"));
    } catch (error) {
      toast.error(t("aiConsultation.favorites.messages.removeError"));
      console.error(error);
    }
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
      <div className="space-y-4">
        {instructionsList.map((instruction, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-blue-100 text-blue-600 font-bold shrink-0 text-xs shadow-xs border border-blue-200">
              {idx + 1}
            </div>
            <span className="text-slate-700 text-sm leading-relaxed pt-0.5">
              {instruction.replace(/^\d+\.\s*/, "")}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderRecipeContent = (data) => {
    const structured = normalizeGeneratedRecipe(data);
    const recipeData = structured.raw || {};

    return (
      <div className="grid gap-8 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Main Recipe */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden border-b-4 border-b-emerald-500">
            <div className="p-8 sm:p-10 space-y-10">
              {/* Recipe Header */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {structured.title}
                  </h3>
                  {structured.condition && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700 uppercase tracking-widest border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {structured.condition}
                    </div>
                  )}
                </div>
                <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">
                  {t("aiConsultation.result.sections.recipeSubtitle")}
                </p>
              </div>

              {/* Instructions Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                  <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                    <FaPlus className="text-sm" />
                  </div>
                  {t("aiConsultation.result.sections.instructions")}
                </h3>
                <div className="bg-slate-50/50 rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-inner">
                  {structured.preparationInstructions.length > 0 ? (
                    renderInstructions(structured.preparationInstructions)
                  ) : (
                    <p className="text-slate-400 text-sm italic font-medium">
                      {t("aiConsultation.result.empty.instructions")}
                    </p>
                  )}
                </div>
              </div>

              {/* Caution Section */}
              {structured.cautionWarning && (
                <div className="rounded-2xl border-s-8 border-red-500 bg-red-50/50 p-8 shadow-sm group">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-red-900 uppercase tracking-[0.2em] mb-4">
                    <FaExclamationTriangle className="text-red-500 text-sm" />
                    {t("aiConsultation.result.sections.precautions")}
                  </h4>
                  <p className="text-base font-bold text-red-800 leading-relaxed">
                    {structured.cautionWarning}
                  </p>
                </div>
              )}

              {/* Dosage & Benefits Grid */}
              {(recipeData.dosage ||
                recipeData.usage ||
                recipeData.duration ||
                recipeData.benefits ||
                recipeData.expectedBenefits) && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {(recipeData.dosage ||
                    recipeData.usage ||
                    recipeData.duration) && (
                    <div className="rounded-3xl border border-purple-100 bg-purple-50/30 p-6 hover:bg-purple-50/50 transition-colors">
                      <h4 className="text-[10px] font-black text-purple-900 uppercase tracking-[0.2em] mb-4">
                        {t("aiConsultation.result.sections.usage")}
                      </h4>
                      <div className="space-y-3 text-sm text-purple-800 font-bold">
                        {recipeData.dosage && (
                          <p className="flex gap-2">
                            <span>•</span> {recipeData.dosage}
                          </p>
                        )}
                        {recipeData.usage && (
                          <p className="flex gap-2">
                            <span>•</span> {recipeData.usage}
                          </p>
                        )}
                        {recipeData.duration && (
                          <p className="flex gap-2">
                            <span>•</span> {recipeData.duration}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {(recipeData.benefits || recipeData.expectedBenefits) && (
                    <div className="rounded-3xl border border-amber-100 bg-amber-50/30 p-6 hover:bg-amber-50/50 transition-colors">
                      <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-[0.2em] mb-4">
                        {t("aiConsultation.result.sections.benefits")}
                      </h4>
                      <div className="space-y-3 text-sm text-amber-800 font-bold">
                        {Array.isArray(
                          recipeData.benefits || recipeData.expectedBenefits,
                        ) ? (
                          (
                            recipeData.benefits || recipeData.expectedBenefits
                          ).map((b, i) => (
                            <p key={i} className="flex gap-2">
                              <span>•</span> {b}
                            </p>
                          ))
                        ) : (
                          <p className="flex gap-2">
                            <span>•</span>{" "}
                            {recipeData.benefits || recipeData.expectedBenefits}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Detail Removal Action */}
              <div className="pt-8 flex justify-center">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <AiRecipeAddToCartAction
                    recipe={data}
                    recipeTitle={structured.title}
                    buttonClassName="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-black text-white hover:bg-emerald-500 transition-all uppercase tracking-widest"
                  />
                  <button
                    onClick={() => handleRemoveFavorite(data.id)}
                    className="flex items-center gap-2 rounded-2xl bg-red-50 px-8 py-4 text-sm font-black text-red-600 hover:bg-red-100 transition-all uppercase tracking-widest border-2 border-red-100"
                  >
                    <FaTrash />
                    {t("aiConsultation.favorites.actions.remove")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Confidence Score */}
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaBrain className="text-8xl text-emerald-600" />
            </div>

            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">
              {t("aiConsultation.result.sidebar.confidence")}
            </h3>

            <div className="relative inline-flex items-center justify-center">
              <svg className="h-40 w-40 transform -rotate-90">
                <circle
                  className="text-slate-50"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
                <circle
                  className="text-emerald-500 transition-all duration-1500 ease-out"
                  strokeWidth="10"
                  strokeDasharray={439.8}
                  strokeDashoffset={
                    439.8 - (439.8 * (structured.confidenceScore || 78)) / 100
                  }
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-black text-slate-900 tabular-nums">
                  {structured.confidenceScore || 78}
                </span>
                <span className="text-xs font-black text-slate-400 mt-1">
                  %
                </span>
              </div>
            </div>

            <p className="text-xs font-black text-slate-400 mt-8 leading-relaxed px-4">
              {t("aiConsultation.result.sidebar.reliability")}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="rounded-4xl bg-linear-to-br from-red-500 to-pink-600 p-5 text-white shadow-2xl shadow-red-200">
            <FaHeart className="text-3xl" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {t("aiConsultation.favorites.title")}
            </h1>
            <p className="text-slate-500 font-bold mt-1 tracking-wide uppercase text-xs">
              {t("aiConsultation.favorites.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-150">
        {viewMode === "list" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <FaSpinner className="text-6xl text-red-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                  Loading your favorite recipes...
                </p>
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((recipe, idx) => (
                  <div
                    key={recipe.targetId || recipe.recipeId || recipe.id || idx}
                    onClick={() => {
                      setSelectedDetail(recipe);
                      setViewMode("detail");
                    }}
                    className="group relative rounded-[2.5rem] border-2 border-slate-100 bg-white p-10 hover:border-red-500 hover:bg-red-50/30 transition-all cursor-pointer flex flex-col gap-8 shadow-sm hover:shadow-2xl hover:shadow-red-500/10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12 group-hover:scale-110 shadow-inner">
                        <FaHeart className="text-3xl" />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                          Score
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-red-600 tabular-nums">
                            {recipe.confidenceScore || 0}
                          </span>
                          <span className="text-xs font-black text-red-400">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-xl font-black text-slate-900 leading-tight group-hover:text-red-700 transition-colors line-clamp-2">
                        {recipe.recommendedRecipeName ||
                          recipe.name ||
                          recipe.recipeName ||
                          recipe.title ||
                          "Favorite Recipe"}
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        
                        {(() => {
                          const savedDate =
                            recipe.createdAt || recipe.savedAt || recipe.date;
                          if (
                            !savedDate ||
                            Number.isNaN(new Date(savedDate).getTime())
                          ) {
                            return null;
                          }

                          return (
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Saved on{" "}
                              {new Date(savedDate).toLocaleDateString()}
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between group-hover:border-red-200 transition-colors">
                      <button
                        onClick={(e) =>
                          handleRemoveFavorite(
                            recipe.targetId || recipe.recipeId || recipe.id,
                            e,
                          )
                        }
                        className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 uppercase tracking-wider transition-colors hover:bg-red-100"
                      >
                        Remove
                      </button>
                      <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider transition-colors hover:bg-emerald-100">
                        View Recipe
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-4xl bg-slate-50 text-slate-200 mb-8 shadow-inner">
                  <FaHeart className="text-5xl" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-3">
                  No favorite recipes yet
                </p>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                  Save recipes from your AI consultations to see them here.
                </p>
                <button
                  onClick={() => navigate("/patient/dashboard/ai-consultation")}
                  className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-100"
                >
                  <FaPlus />
                  Start Consultation
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setViewMode("list")}
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 hover:text-red-600 hover:border-red-500 transition-all font-black uppercase tracking-widest text-xs shadow-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Favorites
            </button>

            {selectedDetail ? renderRecipeContent(selectedDetail) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoriteRecipes;
