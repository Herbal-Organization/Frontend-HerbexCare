import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaStar } from "react-icons/fa";
import { isAuthenticated } from "@utils/auth";
import useAiChatRecipeReviews from "./useAiChatRecipeReviews";

function AiChatRecipeReviewsSection({ recipeId }) {
  const {
    reviews,
    myReview,
    isLoading,
    isSubmitting,
    isDeleting,
    error,
    submitReview,
    removeMyReview,
  } = useAiChatRecipeReviews(recipeId);

  const [reviewForm, setReviewForm] = useState({ ratingValue: 5, comment: "" });
  const canReview = isAuthenticated();

  useEffect(() => {
    if (!myReview) return;
    setReviewForm({
      ratingValue: myReview.ratingValue || 5,
      comment: myReview.comment || "",
    });
  }, [myReview]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.ratingValue || reviewForm.ratingValue < 1) {
      toast.error("Please select a rating.");
      return;
    }

    const ok = await submitReview({
      ratingValue: Number(reviewForm.ratingValue),
      comment: reviewForm.comment.trim(),
    });

    if (!ok) {
      toast.error("Unable to save your review.");
      return;
    }

    toast.success(myReview ? "Review updated." : "Review added.");
  };

  const handleDelete = async () => {
    const ok = await removeMyReview();
    if (!ok) {
      toast.error("Unable to delete your review.");
      return;
    }
    setReviewForm({ ratingValue: 5, comment: "" });
    toast.success("Review deleted.");
  };

  if (!recipeId) {
    return null;
  }

  return (
    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
      <div className="mb-5 flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <p className="mb-0.5 text-sm font-medium text-slate-900">
            Community reviews
          </p>
          <p className="text-[11px] text-slate-400">
            {reviews.length === 0
              ? "No reviews yet. Be the first to share your experience!"
              : "See what others thought about this recipe"}
          </p>
        </div>
        <p className="pt-2 text-sm font-bold uppercase tracking-widest text-slate-500">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      ) : null}

      {canReview ? (
        <form
          onSubmit={handleReviewSubmit}
          className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4"
        >
          <p className="mb-2.5 text-xs font-medium text-slate-500">Your rating</p>
          <div className="mb-3 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setReviewForm((current) => ({
                    ...current,
                    ratingValue: value,
                  }))
                }
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                  Number(reviewForm.ratingValue) >= value
                    ? "border-[#EF9F27] bg-[#FAEEDA]"
                    : "border-slate-200 bg-white"
                }`}
                aria-label={`Rate ${value} stars`}
              >
                <FaStar
                  className={`text-xs ${
                    Number(reviewForm.ratingValue) >= value
                      ? "text-[#BA7517]"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={reviewForm.comment}
            onChange={(e) =>
              setReviewForm((current) => ({
                ...current,
                comment: e.target.value,
              }))
            }
            rows={3}
            placeholder="Share your experience with this AI recipe..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-emerald-800 px-4 py-2 text-xs font-medium text-emerald-100 transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Submitting..."
                : myReview
                  ? "Update review"
                  : "Publish review"}
            </button>
            {myReview ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            ) : null}
          </div>
        </form>
      ) : (
        <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center text-xs text-slate-400">
          Log in as a patient to leave a review.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-6">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          <p className="text-xs text-slate-400">Loading reviews...</p>
        </div>
      ) : null}

      {!isLoading && reviews.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">
          Be the first to share your experience.
        </p>
      ) : null}

      {!isLoading && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-100 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-sm font-bold text-emerald-700 shadow-inner">
                    {review.patientName?.charAt(0).toUpperCase() || "P"}
                  </div>
                  <div>
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                      Patient
                    </p>
                    <p className="text-sm font-bold leading-none text-slate-900">
                      {review.patientName || "Anonymous"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="mb-1 flex gap-0.5">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={`text-[10px] ${
                          index < review.ratingValue
                            ? "text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-medium italic text-slate-400">
                    {review.createdDate
                      ? new Date(review.createdDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recent"}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-medium leading-relaxed text-slate-600 italic">
                  &ldquo;
                  {review.comment ||
                    "No comment was provided with this rating."}
                  &rdquo;
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default AiChatRecipeReviewsSection;
