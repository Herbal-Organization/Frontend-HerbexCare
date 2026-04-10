import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLeaf,
  FaRobot,
  FaStar,
  FaUserMd,
  FaCalendarAlt,
  FaToggleOn,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import PatientNavbar from "../component/browse/PatientNavbar";
import Footer from "../component/Footer";
import useRecipeDetails from "../hooks/useRecipeDetails";
import useRecipeReviews from "../hooks/useRecipeReviews";
import { isAuthenticated } from "../utils/auth";

function RecipeMetaCard({ label, value, hint, icon, tone = "slate" }) {
  const toneClasses = {
    slate: "border-slate-200 bg-white text-slate-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/80 p-3 text-primary">{icon}</div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-lg font-bold">{value}</p>
          {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

function RecipeDetailsPage() {
  const { recipeId } = useParams();
  const { recipe, herbs, isLoading, error, reload } = useRecipeDetails(recipeId);
  const {
    reviews,
    myReview,
    isLoading: areReviewsLoading,
    isSubmitting,
    isDeleting,
    error: reviewsError,
    submitReview,
    removeMyReview,
  } = useRecipeReviews(recipeId);
  const [reviewForm, setReviewForm] = useState({
    ratingValue: 5,
    comment: "",
  });
  const canReview = isAuthenticated();

  useEffect(() => {
    if (!myReview) {
      return;
    }

    setReviewForm({
      ratingValue: myReview.ratingValue || 5,
      comment: myReview.comment || "",
    });
  }, [myReview]);

  const averageFromReviews = useMemo(() => {
    if (!reviews.length) {
      return null;
    }

    const total = reviews.reduce((sum, review) => sum + review.ratingValue, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    const didSubmit = await submitReview({
      ratingValue: Number(reviewForm.ratingValue),
      comment: reviewForm.comment.trim(),
    });

    if (!didSubmit) {
      toast.error("Unable to save your review.");
      return;
    }

    toast.success(myReview ? "Your review was updated." : "Your review was added.");
  };

  const handleDeleteReview = async () => {
    const didDelete = await removeMyReview();

    if (!didDelete) {
      toast.error("Unable to delete your review.");
      return;
    }

    setReviewForm({
      ratingValue: 5,
      comment: "",
    });
    toast.success("Your review was deleted.");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PatientNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/patient/home/recipes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
        >
          <FaArrowLeft className="text-xs" />
          Back to recipes
        </Link>

        {isLoading ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading recipe details...
            </p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-8 rounded-3xl border border-red-100 bg-red-50 p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-red-800">Unable to load recipe details</h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error && recipe ? (
          <div className="mt-8 space-y-8">
            <section className="overflow-hidden rounded-[32px] border border-emerald-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_32%),linear-gradient(135deg,_#f7fff9_0%,_#eefbf5_45%,_#ffffff_100%)] p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                  {recipe.createdDate}
                </span>
                {recipe.createdByAI ? (
                  <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                    AI Generated
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
                {recipe.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {recipe.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {recipe.targetedDiseases.length ? (
                  recipe.targetedDiseases.map((disease) => (
                    <span
                      key={disease.diseaseId}
                      className="rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700"
                    >
                      {disease.diseaseName}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600">
                    General wellness
                  </span>
                )}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <RecipeMetaCard
                label="Recipe Rating"
                value={
                  recipe.averageRatingLabel
                    ? `${recipe.averageRatingLabel}/5`
                    : "Not rated yet"
                }
                hint={
                  recipe.totalRatings != null
                    ? `${recipe.totalRatings} total rating${recipe.totalRatings === 1 ? "" : "s"}`
                    : "No ratings returned by the API"
                }
                icon={<FaStar />}
                tone="amber"
              />
              <RecipeMetaCard
                label="Herbalist Rating"
                value={
                  recipe.herbalistAverageRatingLabel
                    ? `${recipe.herbalistAverageRatingLabel}/5`
                    : "Unavailable"
                }
                hint={
                  recipe.herbalistTotalRatings != null
                    ? `${recipe.herbalistTotalRatings} herbalist rating${recipe.herbalistTotalRatings === 1 ? "" : "s"}`
                    : "Herbalist review data not returned"
                }
                icon={<FaUserMd />}
                tone="emerald"
              />
              <RecipeMetaCard
                label="Created Date"
                value={recipe.createdDate}
                hint={recipe.rawCreatedDate || "Date not returned by API"}
                icon={<FaCalendarAlt />}
              />
              <RecipeMetaCard
                label="Status"
                value={
                  recipe.isActive == null
                    ? "Unknown"
                    : recipe.isActive
                      ? "Active"
                      : "Inactive"
                }
                hint={
                  recipe.createdByAI
                    ? "Generated with AI support"
                    : "Created manually"
                }
                icon={recipe.createdByAI ? <FaRobot /> : <FaToggleOn />}
              />
            </section>

            <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">Preparation</h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {recipe.instructions}
                  </p>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">Herb Details</h2>
                  <div className="mt-6 space-y-5">
                    {herbs.map((herb) => (
                      <div
                        key={herb.herbId}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {herb.herbName}
                            </h3>
                            <p className="text-sm italic text-slate-500">
                              {herb.scientificName}
                            </p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            Quantity: {herb.quantity}
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-600">
                          {herb.description}
                        </p>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl bg-white p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                              Benefits
                            </p>
                            <p className="mt-2 text-sm text-slate-700">
                              {herb.benefits || "No benefits listed"}
                            </p>
                          </div>
                          <div className="rounded-xl bg-white p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                              Dosage
                            </p>
                            <p className="mt-2 text-sm text-slate-700">
                              {herb.dosage || "No dosage guidance listed"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">Recipe Record</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Recipe ID
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {recipe.id}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Herbalist ID
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {recipe.herbalistId ?? "Not returned"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Created By AI
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {recipe.createdByAI ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Is Active
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {recipe.isActive == null ? "Not returned" : recipe.isActive ? "True" : "False"}
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Recipe Reviews</h2>
                      <p className="mt-2 text-sm text-slate-500">
                        Share your experience with this recipe and see what other patients think.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 px-4 py-3 text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                        Community Rating
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {averageFromReviews ? `${averageFromReviews}/5` : "No ratings yet"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {reviews.length} review{reviews.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  {reviewsError ? (
                    <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {reviewsError}
                    </div>
                  ) : null}

                  {canReview ? (
                    <form onSubmit={handleReviewSubmit} className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {myReview ? "Update your review" : "Write a review"}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Choose a rating from 1 to 5 and add an optional comment.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                              className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                                Number(reviewForm.ratingValue) === value
                                  ? "bg-primary text-white"
                                  : "bg-white text-slate-600 border border-slate-200"
                              }`}
                            >
                              {value} <FaStar className="inline text-xs" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={reviewForm.comment}
                        onChange={(event) =>
                          setReviewForm((current) => ({
                            ...current,
                            comment: event.target.value,
                          }))
                        }
                        rows={4}
                        placeholder="Tell other patients what you liked, what to watch out for, or how it worked for you."
                        className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSubmitting
                            ? "Saving..."
                            : myReview
                              ? "Update Review"
                              : "Submit Review"}
                        </button>
                        {myReview ? (
                          <button
                            type="button"
                            onClick={handleDeleteReview}
                            disabled={isDeleting}
                            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeleting ? "Deleting..." : "Delete My Review"}
                          </button>
                        ) : null}
                      </div>
                    </form>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Sign in as a patient to add your review.
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    {areReviewsLoading ? (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                        Loading reviews...
                      </div>
                    ) : null}

                    {!areReviewsLoading && !reviews.length ? (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                        No reviews yet. Be the first patient to share feedback.
                      </div>
                    ) : null}

                    {!areReviewsLoading &&
                      reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {review.userName}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {review.createdDate
                                  ? new Date(review.createdDate).toLocaleString("en-US")
                                  : "Date not available"}
                              </p>
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-amber-600">
                              <FaStar />
                              <span>{review.ratingValue}/5</span>
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-6 text-slate-700">
                            {review.comment || "No written comment was provided."}
                          </p>
                        </div>
                      ))}
                  </div>
                </article>
              </div>

              <div className="space-y-8">
                <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-600" />
                    <h2 className="text-xl font-bold text-slate-900">Advantages</h2>
                  </div>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                    {recipe.advantages.map((item) => (
                      <li key={item} className="flex gap-3">
                        <FaLeaf className="mt-1 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <FaExclamationTriangle className="text-amber-600" />
                    <h2 className="text-xl font-bold text-slate-900">Disadvantages</h2>
                  </div>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                    {recipe.disadvantages.map((item) => (
                      <li key={item} className="flex gap-3">
                        <FaExclamationTriangle className="mt-1 shrink-0 text-amber-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </section>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default RecipeDetailsPage;
