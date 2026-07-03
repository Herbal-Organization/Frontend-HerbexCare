import { FaStar } from "react-icons/fa";
import useRecipeReviews from "./useRecipeReviews";

function RecipeReviewsSection({ recipeId }) {
  const { reviews, isLoading, error } = useRecipeReviews(recipeId);

  if (!recipeId) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Patient Reviews</p>
          <p className="text-[11px] text-slate-400">
            {reviews.length === 0
              ? "No reviews yet for this recipe"
              : `What patients think about this recipe`}
          </p>
        </div>
        {reviews.length > 0 && (
          <p className="pt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </p>
        )}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-6">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          <p className="text-xs text-slate-400">Loading reviews...</p>
        </div>
      ) : null}

      {!isLoading && reviews.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">
          No patient reviews yet. Reviews will appear here once patients rate this recipe.
        </p>
      ) : null}

      {!isLoading && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-sm font-bold text-emerald-700 shadow-inner">
                    {(review.patientName || "P").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-none text-slate-900">
                      {review.patientName || "Patient"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="mb-0.5 flex gap-0.5">
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
                  <p className="text-[10px] font-medium text-slate-400">
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
              {review.comment ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-xs leading-relaxed text-slate-600 italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default RecipeReviewsSection;
