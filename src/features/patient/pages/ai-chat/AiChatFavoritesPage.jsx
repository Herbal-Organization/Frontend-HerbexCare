import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getMyAiChatRecipesFavorites } from "@api/favorites";
import { fetchMyAiChatConsultationById } from "@api/aiChat";
import {
  FaHeart,
  FaSpinner,
  FaArrowLeft,
  FaLeaf,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import AiChatRecipeDetail from "./AiChatRecipeDetail";

function AiChatFavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail States
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    setViewMode("list");
    try {
      const data = await getMyAiChatRecipesFavorites();
      const list = Array.isArray(data?.items) ? data.items : data || [];
      
      // Fetch detailed data for each favorite item to populate the outside cards
      const detailedFavoritesPromises = list.map(async (item) => {
        const targetId = item.targetId || item.id;
        if (!targetId) return item;
        
        try {
          const detail = await fetchMyAiChatConsultationById(targetId);
          return { ...item, ...detail };
        } catch (err) {
          console.error(`Failed to load details for targetId ${targetId}:`, err);
          return item; // Fallback to basic item if detail fetch fails
        }
      });
      
      const detailedFavorites = await Promise.all(detailedFavoritesPromises);
      setFavorites(detailedFavorites);
    } catch (err) {
      console.error("Failed to load AI Chat favorites:", err);
      setError("Failed to load your favorite recipes. Please try again later.");
      toast.error("Failed to load your favorite recipes.");
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (id) => {
    setLoadingDetail(true);
    setViewMode("detail");
    try {
      const detail = await fetchMyAiChatConsultationById(id);
      setSelectedDetail({ ...detail, isFavorite: true });
    } catch (err) {
      console.error("Failed to load consultation detail:", err);
      toast.error("Failed to load recipe details.");
      setViewMode("list");
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex items-center gap-6">
        <div className="rounded-4xl bg-linear-to-br from-rose-500 to-red-600 p-5 text-white shadow-2xl shadow-rose-200">
          <FaHeart className="text-3xl" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Saved AI Recipes
          </h1>
          <p className="text-slate-500 font-bold mt-1 tracking-wide uppercase text-xs">
            Your favorite recipes from AI chat
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[400px]">
        {viewMode === "list" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <FaSpinner className="text-6xl text-rose-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                  Loading Favorites...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-4xl bg-red-50 text-red-400 mb-8 shadow-inner">
                  <FaExclamationTriangle className="text-5xl" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-3">Oops!</p>
                <p className="text-sm font-bold text-slate-500">{error}</p>
                <button
                  onClick={loadFavorites}
                  className="mt-6 inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-500 transition-all shadow-xl shadow-rose-100"
                >
                  Try Again
                </button>
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((item, idx) => {
                  // Extract data, it might be nested if the API returns a favorite wrapper
                  const recipeData = item.aiChatRecipe || item;
                  const targetId = recipeData.aiChatRecipeId || recipeData.id || recipeData.targetId;

                  return (
                    <div
                      key={targetId || idx}
                      onClick={() => handleItemClick(targetId)}
                      className="group relative rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 hover:border-rose-500 hover:bg-rose-50/30 transition-all cursor-pointer flex flex-col shadow-sm hover:shadow-2xl hover:shadow-rose-500/10"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12 group-hover:scale-110 shadow-inner shrink-0">
                          <FaLeaf className="text-2xl" />
                        </div>
                        {recipeData.matchPercentage !== undefined && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 group-hover:text-rose-500 uppercase tracking-[0.2em] mb-1 transition-colors">
                              Score
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-rose-600 tabular-nums">
                                {recipeData.matchPercentage}
                              </span>
                              <span className="text-xs font-black text-rose-400">
                                %
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2 mb-6">
                        {recipeData.category && (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-600 uppercase tracking-widest border border-slate-200">
                            {recipeData.category}
                          </div>
                        )}
                        <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-2 group-hover:text-rose-700 transition-colors">
                          {recipeData.recommendedRecipeName || recipeData.recipeName || "Recommended Recipe"}
                        </h3>
                        <p className="text-sm font-bold text-slate-500 line-clamp-1">
                          {recipeData.scientificName || recipeData.mainHerb}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-4xl bg-slate-50 text-slate-200 mb-8 shadow-inner">
                  <FaClock className="text-5xl" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-3">
                  No Favorites Yet
                </p>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                  Saved recipes will appear here.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => {
                setViewMode("list");
                loadFavorites(); // Refresh the list just in case they unsaved something
              }}
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 hover:text-rose-600 hover:border-rose-500 transition-all font-black uppercase tracking-widest text-xs shadow-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Favorites
            </button>

            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center py-48 gap-6 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <FaSpinner className="text-6xl text-rose-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                  Loading Recipe Details...
                </p>
              </div>
            ) : selectedDetail ? (
              <AiChatRecipeDetail data={selectedDetail} />
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <p className="text-2xl font-black text-slate-900 mb-3">
                  Detail not found
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AiChatFavoritesPage;
