import { useCallback, useEffect, useState } from "react";
import {
  deleteMyRecipeReview,
  getMyRecipeReview,
  getRecipeReviews,
  submitRecipeReview,
} from "../api/recipes";

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
    review?.createdDate || review?.createdAt || review?.dateCreated || null,
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

function useRecipeReviews(recipeId) {
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
      const [allReviews, currentUserReview] = await Promise.all([
        getRecipeReviews(recipeId).catch(() => []),
        getMyRecipeReview(recipeId).catch(() => null),
      ]);

      setReviews(
        Array.isArray(allReviews)
          ? allReviews.map((review, index) => normalizeReview(review, index))
          : [],
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
        await submitRecipeReview(recipeId, payload);
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
      await deleteMyRecipeReview(recipeId);
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

export default useRecipeReviews;
