import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FaCheckCircle,
  FaSpinner,
  FaPlus,
  FaBookmark,
  FaRegBookmark,
  FaLeaf,
  FaExclamationTriangle,
  FaBrain,
} from "react-icons/fa";
import { toggleFavorite } from "@api/favorites";
import { normalizeGeneratedRecipe } from "./aiConsultationUtils";
import AiRecipeAddToCartAction from "./AiRecipeAddToCartAction";

function AiConsultationResult({ result, onNewConsultation }) {
  const { t } = useTranslation();
  const [isSaved, setIsSaved] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);

  const handleSaveRecipe = async () => {
    if (savingRecipe) return;
    setSavingRecipe(true);
    try {
      const targetId = Number(
        result?.aiRecipeId ||
          result?.recipeId ||
          result?.id ||
          result?.consultationId ||
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
      setIsSaved(!isSaved);
      toast.success(
        isSaved
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

  if (!result) return null;

  const structured = normalizeGeneratedRecipe(result);
  const recipeData = structured.raw || {};

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="rounded-3xl bg-linear-to-br from-emerald-500 to-teal-500 p-5 text-white shadow-xl shadow-emerald-200">
            <FaCheckCircle className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {t("aiConsultation.result.successTitle")}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {t("aiConsultation.result.successSubtitle")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AiRecipeAddToCartAction
            recipe={result}
            recipeTitle={structured.title}
            buttonClassName="flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold text-sm bg-emerald-600 text-white transition hover:bg-emerald-500"
          />
          <button
            onClick={handleSaveRecipe}
            disabled={savingRecipe}
            className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold text-sm transition-all transform hover:scale-105 active:scale-95 ${
              isSaved
                ? "bg-amber-100 text-amber-700 border-2 border-amber-200 shadow-lg shadow-amber-100"
                : "bg-white border-2 border-slate-100 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 shadow-md"
            } ${savingRecipe ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {savingRecipe ? (
              <>
                <FaSpinner className="text-amber-500 animate-spin" />
                {t("aiConsultation.result.actions.saving")}
              </>
            ) : isSaved ? (
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
      </div>

      {/* Result Display */}
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

      {/* Action Footer */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={onNewConsultation}
          className="group relative inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-10 py-4 font-black text-sm text-white transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95"
        >
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </div>
          <FaPlus className="text-xs group-hover:rotate-90 transition-transform duration-300" />
          <span className="uppercase tracking-widest">
            {t("aiConsultation.result.actions.another")}
          </span>
        </button>
      </div>
    </div>
  );
}

export default AiConsultationResult;
