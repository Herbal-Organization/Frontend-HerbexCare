import { useCallback, useEffect, useState } from "react";
import {
  deleteMyAiChatRecipeReview,
  getAllAiChatRecipeReviews,
  getMyAiChatRecipeReview,
  submitAiChatRecipeReview,
} from "@api/aiChatRecipeReviews";

export const normalizeAiChatRecipeReview = (review, fallbackKey) => ({
  id:
    review?.id ??
    review?.reviewId ??
    review?.aiChatRecipeReviewId ??
    review?.recipeReviewId ??
    fallbackKey,
  comment: review?.comment || "",
  ratingValue: Number(review?.ratingValue ?? review?.rating ?? 0),
  createdDate:
    review?.ratingDate ||
    review?.createdDate ||
    review?.createdAt ||
    review?.dateCreated ||
    null,
  patientName:
    review?.patientName ||
    review?.patient?.fullName ||
    review?.patient?.name ||
    review?.patient?.userName ||
    review?.userName ||
    review?.username ||
    review?.fullName ||
    review?.name ||
    "Patient",
});

const extractReviewList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.reviews)) return payload.reviews;
  return [];
};

function useAiChatRecipeReviews(recipeId) {
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    const id = Number(recipeId);
    if (!id) {
      setReviews([]);
      setMyReview(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [allReviewsRaw, currentUserReview] = await Promise.all([
        getAllAiChatRecipeReviews(id).catch(() => []),
        getMyAiChatRecipeReview(id).catch(() => null),
      ]);

      const allReviews = extractReviewList(allReviewsRaw);

      setReviews(
        allReviews.map((review, index) =>
          normalizeAiChatRecipeReview(review, index),
        ),
      );
      setMyReview(
        currentUserReview
          ? normalizeAiChatRecipeReview(currentUserReview, "me")
          : null,
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Failed to load recipe reviews.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const submitReview = useCallback(
    async (payload) => {
      const id = Number(recipeId);
      if (!id) return false;

      setIsSubmitting(true);
      setError("");

      try {
        await submitAiChatRecipeReview(id, {
          ratingValue: Number(payload?.ratingValue ?? payload?.rating ?? 0),
          comment: String(payload?.comment ?? "").trim(),
        });
        await loadReviews();
        return true;
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.title ||
          "Failed to submit your review.";
        setError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadReviews, recipeId],
  );

  const removeMyReview = useCallback(async () => {
    const id = Number(recipeId);
    if (!id) return false;

    setIsDeleting(true);
    setError("");

    try {
      await deleteMyAiChatRecipeReview(id);
      await loadReviews();
      return true;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Failed to delete your review.";
      setError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [loadReviews, recipeId]);

  return {
    reviews,
    myReview,
    isLoading,
    isSubmitting,
    isDeleting,
    error,
    reload: loadReviews,
    submitReview,
    removeMyReview,
  };
}

export default useAiChatRecipeReviews;
