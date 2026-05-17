import { useCallback, useEffect, useState } from "react";
import {
  deleteMyAiRecipeFeedback,
  getMyAiRecipeFeedback,
  getAiRecipeFeedbacks,
  submitAiRecipeFeedback,
} from "@api/feedbacks";

const normalizeReview = (review, fallbackKey) => ({
  id:
    review?.id ??
    review?.reviewId ??
    review?.recipeReviewId ??
    review?.feedbackId ??
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

function useAiRecipeFeedbacks(recipeId) {
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    if (!recipeId) {
      setReviews([]);
      setMyReview(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [allReviewsRaw, currentUserReview] = await Promise.all([
        getAiRecipeFeedbacks(recipeId).catch(() => []),
        getMyAiRecipeFeedback(recipeId).catch(() => null),
      ]);

      const allReviews = Array.isArray(allReviewsRaw)
        ? allReviewsRaw
        : Array.isArray(allReviewsRaw?.items)
          ? allReviewsRaw.items
          : Array.isArray(allReviewsRaw?.data)
            ? allReviewsRaw.data
            : [];

      setReviews(
        allReviews.map((review, index) => normalizeReview(review, index)),
      );
      setMyReview(
        currentUserReview ? normalizeReview(currentUserReview, "me") : null,
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
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
      setIsSubmitting(true);
      setError("");

      try {
        await submitAiRecipeFeedback(recipeId, payload);
        await loadReviews();
        return true;
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.title ||
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
    setIsDeleting(true);
    setError("");

    try {
      await deleteMyAiRecipeFeedback(recipeId);
      await loadReviews();
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
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

export default useAiRecipeFeedbacks;
