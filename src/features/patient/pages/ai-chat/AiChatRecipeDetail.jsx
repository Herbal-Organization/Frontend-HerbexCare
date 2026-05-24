import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaInfoCircle,
  FaExclamationTriangle,
  FaLeaf,
  FaBookmark,
  FaRegBookmark,
  FaSpinner,
} from "react-icons/fa";
import AiRecipeAddToCartAction from "../ai-pages/AiRecipeAddToCartAction";
import { toggleFavorite } from "@api/favorites";
import AiChatRecipeReviewsSection from "./AiChatRecipeReviewsSection";

function AiChatRecipeDetail({ data }) {
  // We assume data may have `isFavorite` or `saved` boolean.
  const [isSavedRecipe, setIsSavedRecipe] = useState(
    Boolean(data?.isFavorite || data?.saved || false)
  );
  const [savingRecipe, setSavingRecipe] = useState(false);

  // Ensure we map the ID properly so the AddToCart works
  const targetId = data?.aiChatRecipeId || data?.id;
  const recipeItem = { ...data, aiRecipeId: targetId };

  const handleSaveRecipe = async () => {
    if (savingRecipe || !targetId) return;
    setSavingRecipe(true);
    try {
      await toggleFavorite({
        targetId: Number(targetId),
        type: "AiChatRecipe",
      });
      setIsSavedRecipe((prev) => !prev);
      toast.success(
        isSavedRecipe ? "Removed from favorites." : "Saved to favorites."
      );
    } catch (error) {
      toast.error("Failed to update favorites.");
      console.error(error);
    } finally {
      setSavingRecipe(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden border-b-4 border-b-emerald-500">
          <div className="p-8 sm:p-10 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {data.recommendedRecipeName || data.recipeName || "Recommended Recipe"}
                </h3>
              </div>
              <div className="inline-flex flex-wrap items-center gap-3">
                <AiRecipeAddToCartAction
                  recipe={recipeItem}
                  recipeTitle={data.recommendedRecipeName || data.recipeName}
                  buttonClassName="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-sm bg-emerald-600 text-white transition hover:bg-emerald-500 shadow-md"
                />
                <button
                  onClick={handleSaveRecipe}
                  disabled={savingRecipe}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-sm transition-all transform hover:scale-105 active:scale-95 ${
                    isSavedRecipe
                      ? "bg-amber-100 text-amber-700 border-2 border-amber-200 shadow-lg shadow-amber-100"
                      : "bg-white border-2 border-slate-100 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 shadow-md"
                  } ${savingRecipe ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {savingRecipe ? (
                    <>
                      <FaSpinner className="text-amber-500 animate-spin" />
                      Saving...
                    </>
                  ) : isSavedRecipe ? (
                    <>
                      <FaBookmark className="text-amber-500" />
                      Saved
                    </>
                  ) : (
                    <>
                      <FaRegBookmark />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tags and Main Herb */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {data.category && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700 uppercase tracking-widest border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    {data.category}
                  </div>
                )}
              </div>
              <div>
                <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">
                  Main Herb
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {data.mainHerb}{" "}
                  {data.scientificName && (
                    <span className="text-slate-500 italic text-base">
                      ({data.scientificName})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Preparation */}
            {data.preparation && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                  <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                    <FaInfoCircle className="text-sm" />
                  </div>
                  Preparation Instructions
                </h3>
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 shadow-inner">
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">
                    {data.preparation}
                  </p>
                </div>
              </div>
            )}

            {/* Dosage and Contraindications */}
            <div className="grid gap-6 sm:grid-cols-2">
              {data.dosage && (
                <div className="rounded-3xl border border-purple-100 bg-purple-50/30 p-6 hover:bg-purple-50/50 transition-colors">
                  <h4 className="text-[10px] font-black text-purple-900 uppercase tracking-[0.2em] mb-4">
                    Usage & Dosage
                  </h4>
                  <p className="text-sm text-purple-800 font-bold leading-relaxed">
                    {data.dosage}
                  </p>
                </div>
              )}

              {data.contraindications && (
                <div className="rounded-3xl border border-red-100 bg-red-50/30 p-6 hover:bg-red-50/50 transition-colors">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-red-900 uppercase tracking-[0.2em] mb-4">
                    <FaExclamationTriangle className="text-red-500" />
                    Caution / Contraindications
                  </h4>
                  <p className="text-sm text-red-800 font-bold leading-relaxed">
                    {data.contraindications}
                  </p>
                </div>
              )}
            </div>

            {/* Other Possibilities */}
            {Array.isArray(data.otherPossibilities) && data.otherPossibilities.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                  Other Possibilities Discussed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.otherPossibilities.map((possibility, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200"
                    >
                      {possibility}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="space-y-8">
        {/* Confidence/Match Score */}
        {data.matchPercentage !== undefined && (
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaLeaf className="text-8xl text-emerald-600" />
            </div>

            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">
              Match Score
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
                    439.8 - (439.8 * data.matchPercentage) / 100
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
                  {data.matchPercentage}
                </span>
                <span className="text-xs font-black text-slate-400 mt-1">%</span>
              </div>
            </div>

            <p className="text-xs font-black text-slate-400 mt-8 leading-relaxed px-4">
              How well this recipe matches your reported symptoms and profile.
            </p>
          </div>
        )}
      </div>

      <div className="lg:col-span-3">
        <AiChatRecipeReviewsSection recipeId={targetId} />
      </div>
    </div>
  );
}

export default AiChatRecipeDetail;
