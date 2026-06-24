import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMyFeedbackHistory } from "@api/feedbacks";
import { getRecipeById } from "@api/recipes";
import { fetchMyConsultationById } from "@api/aiConsultations";
import { fetchMyChatConsultationById } from "@api/aiChat";
import {
  FaStar,
  FaRegStar,
  FaCommentAlt,
  FaCalendarAlt,
  FaHistory,
  FaLeaf,
  FaMagic,
  FaComments,
} from "react-icons/fa";
import { motion } from "motion/react";
import Pagination from "@components/common/Pagination";
import { Link } from "react-router-dom";

const FeedbackHistoryPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [itemNames, setItemNames] = useState({});
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0, // We'll estimate this as we don't have totalItems directly
  });

  const fetchItemNames = async (items) => {
    const names = { ...itemNames };
    const promises = items.map(async (feedback) => {
      try {
        if (feedback.recipeId && !names[`recipe_${feedback.recipeId}`]) {
          const data = await getRecipeById(feedback.recipeId);
          names[`recipe_${feedback.recipeId}`] =
            data?.description ||
            data?.recipeTitle ||
            data?.title ||
            data?.name ||
            `${t("feedbackHistoryPage.recipe")} #${feedback.recipeId}`;
        } else if (
          feedback.aiRecipeId &&
          !names[`aiRecipe_${feedback.aiRecipeId}`]
        ) {
          const data = await fetchMyConsultationById(feedback.aiRecipeId);
          names[`aiRecipe_${feedback.aiRecipeId}`] =
            data?.recommendedRecipeName ||
            data?.recipeTitle ||
            data?.title ||
            data?.name ||
            data?.preparationInstructions?.substring(0, 50) + "..." ||
            `${t("feedbackHistoryPage.aiRecipe")} #${feedback.aiRecipeId}`;
        } else if (
          feedback.aiChatRecipeId &&
          !names[`aiChat_${feedback.aiChatRecipeId}`]
        ) {
          const data = await fetchMyChatConsultationById(
            feedback.aiChatRecipeId,
          );
          names[`aiChat_${feedback.aiChatRecipeId}`] =
            data?.recommendedRecipeName ||
            data?.recipeTitle ||
            data?.title ||
            data?.name ||
            `${t("feedbackHistoryPage.aiChatRecipe")} #${feedback.aiChatRecipeId}`;
        }
      } catch (error) {
        console.error("Error fetching item name:", error);
      }
    });

    if (promises.length > 0) {
      await Promise.all(promises);
      setItemNames(names);
    }
  };

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getMyFeedbackHistory(page, pagination.pageSize);
      setFeedbacks(data.items || []);
      setPagination((prev) => ({
        ...prev,
        pageNumber: data.pageNumber,
        totalPages: data.totalPages,
        // Estimate totalItems for Pagination component
        totalItems: data.totalPages * pagination.pageSize,
      }));

      if (data.items && data.items.length > 0) {
        await fetchItemNames(data.items);
      }
    } catch (error) {
      console.error("Error fetching feedback history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePageChange = (newPage) => {
    fetchHistory(newPage);
  };

  const getFeedbackTypeInfo = (feedback) => {
    let title = "";
    if (feedback.recipeId) {
      title =
        itemNames[`recipe_${feedback.recipeId}`] ||
        t("feedbackHistoryPage.recipe");
      return {
        label: title,
        typeLabel: t("feedbackHistoryPage.recipe"),
        icon: FaLeaf,
        color: "text-emerald-600 bg-emerald-50",
        link: `/patient/home/recipes/${feedback.recipeId}`,
      };
    }
    if (feedback.aiRecipeId) {
      title =
        itemNames[`aiRecipe_${feedback.aiRecipeId}`] ||
        t("feedbackHistoryPage.aiRecipe");
      return {
        label: title,
        typeLabel: t("feedbackHistoryPage.aiRecipe"),
        icon: FaMagic,
        color: "text-purple-600 bg-purple-50",
        link: null,
      };
    }
    if (feedback.aiChatRecipeId) {
      title =
        itemNames[`aiChat_${feedback.aiChatRecipeId}`] ||
        t("feedbackHistoryPage.aiChatRecipe");
      return {
        label: title,
        typeLabel: t("feedbackHistoryPage.aiChatRecipe"),
        icon: FaComments,
        color: "text-blue-600 bg-blue-50",
        link: null,
      };
    }
    return {
      label: t("feedbackHistoryPage.type"),
      typeLabel: t("feedbackHistoryPage.type"),
      icon: FaHistory,
      color: "text-slate-600 bg-slate-50",
      link: null,
    };
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <FaStar key={star} className="text-amber-400 w-4 h-4" />
          ) : (
            <FaRegStar key={star} className="text-slate-300 w-4 h-4" />
          ),
        )}
      </div>
    );
  };

  if (loading && feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium">
          {t("common.loading", "Loading...")}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {t("feedbackHistoryPage.title")}
          </h1>
          <p className="text-slate-500">
            {t("feedbackHistoryPage.description")}
          </p>
        </div>
        <div className="hidden md:block">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FaHistory />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                {t("feedbackHistoryPage.totalFeedbacks", "Total Feedbacks")}
              </p>
              <p className="text-lg font-bold text-slate-900">
                {pagination.totalItems || feedbacks.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FaCommentAlt className="text-4xl" />
          </div>
          <p className="text-slate-500 text-lg">
            {t("feedbackHistoryPage.noFeedback")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback, index) => {
            const typeInfo = getFeedbackTypeInfo(feedback);
            const TypeIcon = typeInfo.icon;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={feedback.feedbackId}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 rounded-xl ${typeInfo.color} shrink-0`}
                    >
                      <TypeIcon className="text-xl" />
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {typeInfo.link ? (
                          <Link
                            to={typeInfo.link}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                          >
                            {typeInfo.label}
                          </Link>
                        ) : (
                          <span className="font-bold text-slate-900">
                            {typeInfo.label}
                          </span>
                        )}
                        <span className="text-slate-300">•</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${typeInfo.color}`}
                        >
                          {typeInfo.typeLabel}
                        </span>
                        <span className="text-slate-300">•</span>
                        {renderStars(feedback.ratingValue)}
                      </div>

                      {feedback.comment && (
                        <p className="text-slate-600 leading-relaxed italic">
                          "{feedback.comment}"
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="opacity-70" />
                          {new Date(feedback.ratingDate).toLocaleDateString(
                            i18n.language,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={pagination.pageNumber}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackHistoryPage;
