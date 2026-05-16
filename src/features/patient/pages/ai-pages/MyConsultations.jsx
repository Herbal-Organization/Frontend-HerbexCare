import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FaBrain,
  FaSpinner,
  FaClock,
  FaArrowLeft,
  FaSearch,
  FaPlus,
  FaLeaf,
  FaBookmark,
  FaRegBookmark,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  myAllConsultations,
  fetchMyConsultationById,
} from "@api/aiConsultations";
import { toggleFavorite } from "@api/favorites";
import { normalizeGeneratedRecipe } from "./aiConsultationUtils";
import { useNavigate } from "react-router-dom";

function MyConsultations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(6);

  // Detail States
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isSavedRecipe, setIsSavedRecipe] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);

  useEffect(() => {
    loadHistory(currentPage);
  }, [currentPage]);

  const loadHistory = async (page) => {
    setLoading(true);
    setViewMode("list");
    try {
      const data = await myAllConsultations(page, pageSize);
      const list = Array.isArray(data) ? data : data?.items || [];
      setHistory(list);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load history:", error);
      toast.error(t("aiConsultation.result.messages.historyError"));
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (id) => {
    setLoadingDetail(true);
    try {
      const detail = await fetchMyConsultationById(id);
      setSelectedDetail(detail);
      setIsSavedRecipe(
        Boolean(detail?.isFavorite || detail?.isSaved || detail?.saved),
      );
      setViewMode("detail");
    } catch (error) {
      console.error("Failed to load consultation detail:", error);
      toast.error(t("aiConsultation.myConsultations.messages.detailError"));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveRecipe = async (data) => {
    if (savingRecipe) return;
    setSavingRecipe(true);
    try {
      const targetId = Number(
        data?.aiRecipeId ||
          data?.recipeId ||
          data?.id ||
          data?.consultationId ||
          0,
      );
      if (!targetId) {
        throw new Error("Invalid AI recipe id");
      }

      const payload = {
        targetId,
        type: "AiRecipe",
      };
      await toggleFavorite(payload);
      setIsSavedRecipe((prev) => !prev);
      toast.success(
        isSavedRecipe
          ? t("aiConsultation.result.messages.removeSuccess")
          : t("aiConsultation.result.messages.saveSuccess"),
      );
    } catch (error) {
      toast.error(t("aiConsultation.result.messages.saveError"));
      console.error(error);
    } finally {
      setSavingRecipe(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const term = search.toLowerCase();
    const title = (
      item.recommendedRecipeName ||
      item.recipeName ||
      item.title ||
      ""
    ).toLowerCase();
    return title.includes(term);
  });

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {structured.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleSaveRecipe(selectedDetail)}
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
                      {t("aiConsultation.result.actions.saving")}
                    </>
                  ) : isSavedRecipe ? (
                    <>
                      <FaBookmark className="text-amber-500" />
                      {t("aiConsultation.result.actions.saved")}
                    </>
                  ) : (
                    <>
                      <FaRegBookmark />
                      {t("aiConsultation.result.actions.save")}
                    </>
                  )}
                </button>
              </div>
              {/* Recipe Header */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
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
                  className="text-emerald-500 transition-all duration-[1500ms] ease-out"
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="rounded-[2rem] bg-linear-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-2xl shadow-indigo-200">
            <FaBrain className="text-3xl" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {t("aiConsultation.myConsultations.title")}
            </h1>
            <p className="text-slate-500 font-bold mt-1 tracking-wide uppercase text-xs">
              {t("aiConsultation.myConsultations.subtitle")}
            </p>
          </div>
        </div>

        {viewMode === "list" && (
          <div className="relative group max-w-md w-full">
            <FaSearch className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder={t(
                "aiConsultation.myConsultations.searchPlaceholder",
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-12 pe-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="min-h-[600px]">
        {viewMode === "list" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <FaSpinner className="text-6xl text-indigo-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                  {t("aiConsultation.myConsultations.loading")}
                </p>
              </div>
            ) : filteredHistory.length > 0 ? (
              <div className="space-y-12">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredHistory.map((item, idx) => (
                    <div
                      key={item.id || item.consultationId || idx}
                      onClick={() =>
                        handleItemClick(
                          item.recipeId || item.id || item.consultationId,
                        )
                      }
                      className="group relative rounded-[2.5rem] border-2 border-slate-100 bg-white p-10 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer flex flex-col gap-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12 group-hover:scale-110 shadow-inner">
                          <FaBrain className="text-3xl" />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                            Score
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-indigo-600 tabular-nums">
                              {item.score || item.confidenceScore || 0}
                            </span>
                            <span className="text-xs font-black text-indigo-400">
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors line-clamp-2">
                          {item.recommendedRecipeName ||
                            item.recipeName ||
                            item.title ||
                            `Consultation #${idx + 1}`}
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {new Date(
                              item.createdAt || item.date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between group-hover:border-indigo-200 transition-colors">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                          Open Analysis
                        </span>
                        <FaArrowLeft className="text-indigo-500 transform rotate-180 group-hover:translate-x-2 transition-transform duration-300" />
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
                      className="h-12 w-12 flex items-center justify-center rounded-2xl border-2 border-slate-100 bg-white text-slate-400 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all shadow-sm"
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
                                ? "bg-indigo-600 text-white shadow-indigo-100"
                                : "border-2 border-slate-100 bg-white text-slate-600 hover:border-indigo-500 hover:text-indigo-600"
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
                      className="h-12 w-12 flex items-center justify-center rounded-2xl border-2 border-slate-100 bg-white text-slate-400 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all shadow-sm"
                    >
                      <FaArrowLeft className="transform rotate-180" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-50 text-slate-200 mb-8 shadow-inner">
                  <FaClock className="text-5xl" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-3">
                  {t("aiConsultation.result.messages.noHistory")}
                </p>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                  {t("aiConsultation.myConsultations.startNew")}
                </p>
                <button
                  onClick={() => navigate("/patient/dashboard/ai-consultation")}
                  className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-100"
                >
                  <FaPlus />
                  New Consultation
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setViewMode("list")}
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 hover:text-indigo-600 hover:border-indigo-500 transition-all font-black uppercase tracking-widest text-xs shadow-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Analysis List
            </button>

            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center py-48 gap-6 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm">
                <FaSpinner className="text-6xl text-indigo-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                  Processing Analysis Data...
                </p>
              </div>
            ) : selectedDetail ? (
              renderRecipeContent(selectedDetail)
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyConsultations;
