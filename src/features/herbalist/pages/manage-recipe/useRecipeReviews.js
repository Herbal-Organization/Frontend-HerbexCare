import { useCallback, useEffect, useState } from "react";
import { getRecipeFeedbacks } from "@api/feedbacks";

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

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

function useRecipeReviews(recipeId) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    if (!recipeId) {
      setReviews([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const raw = await getRecipeFeedbacks(recipeId);
      const list = extractList(raw);
      setReviews(list.map((review, index) => normalizeReview(review, index)));
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

  return { reviews, isLoading, error, reload: loadReviews };
}

export default useRecipeReviews;
