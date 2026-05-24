import { useCallback, useEffect, useState } from "react";
import {
  deleteMyAiRecipeReview,
  getAllAiRecipeReviews,
  getMyAiRecipeReview,
  submitAiRecipeReview,
} from "@api/aiRecipeReviews";

const resolveReviewerName = (review) =>
  review?.herbalistName ||
  review?.herbalist?.fullName ||
  review?.herbalist?.name ||
  review?.herbalist?.userName ||
  review?.patientName ||
  review?.patient?.fullName ||
  review?.patient?.name ||
  review?.patient?.userName ||
  review?.userName ||
  review?.username ||
  review?.fullName ||
  review?.name ||
  null;

const resolveReviewerRole = (review) => {
  if (review?.herbalistName || review?.herbalistId || review?.herbalist) {
    return "Herbalist";
  }
  return "Patient";
};

export const normalizeAiRecipeReview = (review, fallbackKey) => {
  const reviewerName = resolveReviewerName(review);
  const reviewerRole = resolveReviewerRole(review);

  return {
    id:
      review?.id ??
      review?.reviewId ??
      review?.aiRecipeReviewId ??
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
    reviewerName:
      reviewerName || (reviewerRole === "Herbalist" ? "Herbalist" : "Patient"),
    reviewerRole,
    patientName: reviewerName || "Patient",
  };
};

const extractReviewList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.reviews)) return payload.reviews;
  return [];
};

function useAiRecipeReviews(recipeId) {
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
        getAllAiRecipeReviews(id).catch(() => []),
        getMyAiRecipeReview(id).catch(() => null),
      ]);

      const allReviews = extractReviewList(allReviewsRaw);

      setReviews(
        allReviews.map((review, index) =>
          normalizeAiRecipeReview(review, index),
        ),
      );
      setMyReview(
        currentUserReview
          ? normalizeAiRecipeReview(currentUserReview, "me")
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
        await submitAiRecipeReview(id, {
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
      await deleteMyAiRecipeReview(id);
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

export default useAiRecipeReviews;
