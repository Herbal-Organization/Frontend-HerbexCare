import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { fetchMyAiChatConsultations, fetchMyAiChatConsultationById } from "@api/aiChat";
import {
  FaComments,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaClock,
  FaLeaf,
  FaExclamationTriangle,
} from "react-icons/fa";
import AiChatRecipeDetail from "./AiChatRecipeDetail";

function AiChatHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10); // Display 10 per page

  // Detail States
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadHistory(currentPage);
  }, [currentPage]);

  const loadHistory = async (page) => {
    setLoading(true);
    setError(null);
    setViewMode("list");
    try {
      const data = await fetchMyAiChatConsultations(page, pageSize);
      const list = Array.isArray(data?.items) ? data.items : data || [];
      setHistory(list);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load AI Chat history:", err);
      setError("Failed to load your chat history. Please try again later.");
      toast.error("Failed to load your chat history.");
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (id) => {
    setLoadingDetail(true);
    setViewMode("detail");
    try {
      const detail = await fetchMyAiChatConsultationById(id);
      setSelectedDetail(detail);
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
        <div className="rounded-4xl bg-linear-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-2xl shadow-emerald-200">
          <FaComments className="text-3xl" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            AI Chat History
          </h1>
          <p className="text-slate-500 font-bold mt-1 tracking-wide uppercase text-xs">
            Review your past AI recommended recipes
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[400px]">
        {viewMode === "list" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <FaSpinner className="text-6xl text-emerald-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                  Loading History...
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
                  onClick={() => loadHistory(currentPage)}
                  className="mt-6 inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-100"
                >
                  Try Again
                </button>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {history.map((item, idx) => (
                    <div
                      key={item.aiChatRecipeId || idx}
                      onClick={() => handleItemClick(item.aiChatRecipeId || item.id)}
                      className="group relative rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12 group-hover:scale-110 shadow-inner shrink-0">
                          <FaLeaf className="text-2xl" />
                        </div>
                        {item.matchPercentage !== undefined && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-500 uppercase tracking-[0.2em] mb-1 transition-colors">
                              Score
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-emerald-600 tabular-nums">
                                {item.matchPercentage}
                              </span>
                              <span className="text-xs font-black text-emerald-400">
                                %
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2 mb-6">
                        {item.category && (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-600 uppercase tracking-widest border border-slate-200">
                            {item.category}
                          </div>
                        )}
                        <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                          {item.recommendedRecipeName || "Recommended Recipe"}
                        </h3>
                        <p className="text-sm font-bold text-slate-500 line-clamp-1">
                          {item.scientificName || item.mainHerb}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between group-hover:border-emerald-200 transition-colors">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                          View Details
                        </span>
                        <FaArrowRight className="text-emerald-500 transform group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-12 w-12 flex items-center justify-center rounded-2xl border-2 border-slate-100 bg-white text-slate-400 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all shadow-sm"
                    >
                      <FaArrowLeft />
                    </button>

                    <div className="flex items-center gap-2">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = currentPage === pageNum;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-12 w-12 flex items-center justify-center rounded-2xl font-black transition-all shadow-sm ${
                              isCurrent
                                ? "bg-emerald-600 text-white shadow-emerald-100"
                                : "border-2 border-slate-100 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="h-12 w-12 flex items-center justify-center rounded-2xl border-2 border-slate-100 bg-white text-slate-400 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all shadow-sm"
                    >
                      <FaArrowRight />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-4xl bg-slate-50 text-slate-200 mb-8 shadow-inner">
                  <FaClock className="text-5xl" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-3">
                  No Chat History
                </p>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                  You haven't requested any AI recipes yet.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setViewMode("list")}
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 hover:text-emerald-600 hover:border-emerald-500 transition-all font-black uppercase tracking-widest text-xs shadow-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to History
            </button>

            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center py-48 gap-6 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <FaSpinner className="text-6xl text-emerald-600 animate-spin" />
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
export default AiChatHistoryPage;
