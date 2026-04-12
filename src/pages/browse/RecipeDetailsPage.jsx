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
import { motion } from "motion/react";
import PatientNavbar from "../../components/browse/PatientNavbar";
import Footer from "../../components/landing/Footer";
import useRecipeDetails from "../../hooks/useRecipeDetails";
import useRecipeReviews from "../../hooks/useRecipeReviews";
import { isAuthenticated } from "../../utils/auth";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

function RecipeMetaCard({ label, value, hint, icon, tone = "slate" }) {
  const toneClasses = {
    slate: "border-slate-200 bg-white text-slate-900 group-hover:border-slate-300",
    emerald: "border-emerald-200 bg-emerald-50/50 text-emerald-900 group-hover:border-emerald-300",
    amber: "border-amber-200 bg-amber-50/50 text-amber-900 group-hover:border-amber-300",
  };

  const iconTones = {
    slate: "text-slate-500 bg-slate-100 group-hover:bg-slate-200",
    emerald: "text-emerald-600 bg-emerald-100 group-hover:bg-emerald-200",
    amber: "text-amber-600 bg-amber-100 group-hover:bg-amber-200",
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -4 }}
      className={`group rounded-[2rem] border p-6 shadow-sm transition-all duration-300 ${toneClasses[tone]}`}
    >
      <div className="flex items-start gap-4">
        <div className={`rounded-xl p-3.5 transition-colors ${iconTones[tone]}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-500 transition-colors">
            {label}
          </p>
          <p className="mt-1 text-2xl font-extrabold">{value}</p>
          {hint ? <p className="mt-1.5 text-xs font-semibold text-slate-500/80">{hint}</p> : null}
        </div>
      </div>
    </motion.div>
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
    if (!reviews.length) return null;
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
    setReviewForm({ ratingValue: 5, comment: "" });
    toast.success("Your review was deleted.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PatientNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
        <Link
          to="/patient/home/recipes"
          className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:text-emerald-600 hover:shadow-md hover:-translate-y-0.5"
        >
          <FaArrowLeft className="text-xs" />
          Back to recipes
        </Link>

        {isLoading ? (
          <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
            <p className="mt-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
              Loading recipe...
            </p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-10 rounded-[2rem] border border-red-100 bg-red-50 p-16 text-center shadow-sm">
            <h2 className="text-xl font-extrabold text-red-800">Unable to load recipe details</h2>
            <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-6 rounded-full bg-red-600 px-8 py-3 text-sm font-bold text-white hover:bg-red-700 hover:shadow-lg transition-all"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error && recipe ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-10 space-y-10"
          >
            <motion.section 
              variants={itemVariants}
              className="relative overflow-hidden rounded-[2.5rem] border border-emerald-100 bg-white p-10 lg:p-14 shadow-md bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),_transparent_40%),linear-gradient(135deg,_#f1fdf6_0%,_#ffffff_60%,_#f8fafc_100%)]"
            >
              <div className="relative z-10 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-900 border border-slate-700 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white shadow-sm">
                  {recipe.createdDate}
                </span>
                {recipe.createdByAI ? (
                  <span className="rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700 shadow-sm flex flex-row items-center gap-1">
                    <MdVerified className="text-sm" /> AI Curation
                  </span>
                ) : null}
              </div>

              <h1 className="relative z-10 mt-8 text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-4xl">
                {recipe.title}
              </h1>
              <p className="relative z-10 mt-6 max-w-3xl text-lg leading-relaxed font-medium text-slate-600">
                {recipe.description}
              </p>

              <div className="relative z-10 mt-10 flex flex-wrap gap-3">
                {recipe.targetedDiseases.length ? (
                  recipe.targetedDiseases.map((disease) => (
                    <span
                      key={disease.diseaseId}
                      className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 shadow-sm border border-emerald-100"
                    >
                      {disease.diseaseName}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200">
                    General Wellness Support
                  </span>
                )}
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <RecipeMetaCard
                label="Recipe Rating"
                value={
                  recipe.averageRatingLabel
                    ? `${recipe.averageRatingLabel}`
                    : "New"
                }
                hint={
                  recipe.totalRatings != null
                    ? `${recipe.totalRatings} Patient Reviews`
                    : "No ratings returned"
                }
                icon={<FaStar className="text-2xl" />}
                tone="amber"
              />
              <RecipeMetaCard
                label="Herbalist Rating"
                value={
                  recipe.herbalistAverageRatingLabel
                    ? `${recipe.herbalistAverageRatingLabel}`
                    : "N/A"
                }
                hint={
                  recipe.herbalistTotalRatings != null
                    ? `${recipe.herbalistTotalRatings} Pro Reviews`
                    : "Review data not returned"
                }
                icon={<FaUserMd className="text-2xl" />}
                tone="emerald"
              />
              <RecipeMetaCard
                label="Created Date"
                value={recipe.createdDate}
                hint="Original publication date"
                icon={<FaCalendarAlt className="text-2xl" />}
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
                hint="Current availability"
                icon={<FaToggleOn className="text-2xl" />}
              />
            </motion.section>

            <section className="grid gap-8 lg:grid-cols-[1fr] xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <motion.article variants={itemVariants} className="rounded-[2.5rem] border border-slate-200 bg-white p-8 lg:p-10 shadow-sm">
                  <h2 className="text-2xl font-extrabold text-slate-900">Preparation & Usage</h2>
                  <div className="mt-8 rounded-3xl bg-slate-50 border border-slate-100 p-8">
                    <p className="whitespace-pre-line text-base leading-relaxed font-medium text-slate-700">
                      {recipe.instructions || "No specific instructions provided. Consult an expert."}
                    </p>
                  </div>
                </motion.article>

                <motion.article variants={itemVariants} className="rounded-[2.5rem] border border-slate-200 bg-white p-8 lg:p-10 shadow-sm">
                  <h2 className="text-2xl font-extrabold text-slate-900">Herb Composition</h2>
                  <div className="mt-8 space-y-6">
                    {herbs.map((herb) => (
                      <div
                        key={herb.herbId}
                        className="group rounded-3xl border border-slate-100 bg-slate-50 p-6 lg:p-8 hover:bg-white hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {herb.herbName}
                            </h3>
                            <p className="mt-1 text-sm italic font-medium text-slate-500">
                              {herb.scientificName}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
                            Quantity: {herb.quantity}
                          </span>
                        </div>

                        <p className="mt-5 text-sm leading-relaxed font-medium text-slate-600">
                          {herb.description}
                        </p>

                        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                              Benefits
                            </p>
                            <p className="mt-2 text-sm font-bold text-slate-700">
                              {herb.benefits || "No benefits listed"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                              Dosage
                            </p>
                            <p className="mt-2 text-sm font-bold text-slate-700">
                              {herb.dosage || "No guidance listed"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.article>
              </div>

              <div className="space-y-8">
                <motion.div variants={itemVariants} className="space-y-6">
                   <article className="rounded-[2.5rem] border border-emerald-200 bg-emerald-50/50 p-8 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                         <FaCheckCircle className="text-xl" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Advantages</h2>
                    </div>
                    <ul className="mt-6 space-y-4 text-sm leading-relaxed font-medium text-slate-700 bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm">
                      {recipe.advantages.map((item) => (
                        <li key={item} className="flex gap-4">
                          <FaLeaf className="mt-1 shrink-0 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {recipe.advantages.length === 0 && (
                        <li className="text-slate-400 italic font-semibold">No noted advantages.</li>
                      )}
                    </ul>
                  </article>

                  <article className="rounded-[2.5rem] border border-amber-200 bg-amber-50/50 p-8 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                         <FaExclamationTriangle className="text-xl" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Disadvantages</h2>
                    </div>
                    <ul className="mt-6 space-y-4 text-sm leading-relaxed font-medium text-slate-700 bg-white rounded-3xl border border-amber-100 p-6 shadow-sm">
                      {recipe.disadvantages.map((item) => (
                        <li key={item} className="flex gap-4">
                          <FaExclamationTriangle className="mt-1.5 shrink-0 text-amber-500 text-xs" />
                          <span>{item}</span>
                        </li>
                      ))}
                       {recipe.disadvantages.length === 0 && (
                        <li className="text-slate-400 italic font-semibold">No noted disadvantages.</li>
                      )}
                    </ul>
                  </article>
                </motion.div>

                <motion.article variants={itemVariants} className="rounded-[2.5rem] border border-slate-200 bg-white p-8 lg:p-10 shadow-sm flex flex-col gap-8">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-100">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Community Feedback</h2>
                      <p className="mt-2 text-sm font-medium text-slate-500 max-w-sm">
                        Share your experience with this recipe and see what others think.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-right w-full sm:w-auto">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Overall Average
                      </p>
                      <p className="mt-1 text-3xl font-extrabold text-slate-900 flex items-center justify-end gap-2">
                        {averageFromReviews ? `${averageFromReviews}` : "—"}
                        <FaStar className="text-amber-400 text-xl" />
                      </p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        {reviews.length} Patient Review{reviews.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  {reviewsError ? (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 font-bold">
                      {reviewsError}
                    </div>
                  ) : null}

                  {canReview ? (
                    <form onSubmit={handleReviewSubmit} className="rounded-3xl border border-slate-100 bg-slate-50 p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {myReview ? "Update your feedback" : "Write a review"}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setReviewForm((c) => ({ ...c, ratingValue: value }))}
                              className={`rounded-xl w-10 h-10 flex items-center justify-center text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 ${
                                Number(reviewForm.ratingValue) >= value
                                  ? "bg-amber-400 text-amber-900 border border-amber-500"
                                  : "bg-white text-slate-400 border border-slate-200"
                              }`}
                            >
                              <FaStar />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((c) => ({ ...c, comment: e.target.value }))}
                        rows={3}
                        placeholder="Detail your experience with this curation..."
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
                      />

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                          {isSubmitting ? "Sumbitting..." : myReview ? "Update Review" : "Publish Feedback"}
                        </button>
                        {myReview ? (
                          <button
                            type="button"
                            onClick={handleDeleteReview}
                            disabled={isDeleting}
                            className="rounded-full bg-red-50 text-red-600 px-6 py-2.5 text-sm font-bold shadow-sm hover:bg-red-100 transition-all disabled:opacity-50"
                          >
                            {isDeleting ? "Deleting..." : "Erase"}
                          </button>
                        ) : null}
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-bold text-slate-500 shadow-sm">
                      Please log in as a patient to leave your feedback.
                    </div>
                  )}

                  <div className="space-y-5">
                    {areReviewsLoading ? (
                      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-emerald-500" />
                        <p className="text-sm font-bold text-slate-400">Loading reviews...</p>
                      </div>
                    ) : null}

                    {!areReviewsLoading && !reviews.length ? (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center shadow-sm">
                         <p className="text-sm font-bold text-slate-500">Waitlist is empty! Be the first to share feedback.</p>
                      </div>
                    ) : null}

                    {!areReviewsLoading &&
                      reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold shadow-inner">
                                {review.userName?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-extrabold text-slate-900">
                                  {review.userName}
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                  {review.createdDate
                                    ? new Date(review.createdDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric'})
                                    : "Past Patient"}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={`text-[10px] ${i < review.ratingValue ? "text-amber-500" : "text-amber-200"}`} />
                              ))}
                            </div>
                          </div>

                          <p className="mt-5 text-sm leading-relaxed font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl">
                            {review.comment || "No written statement provided."}
                          </p>
                        </div>
                      ))}
                  </div>
                </motion.article>
              </div>
            </section>
          </motion.div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default RecipeDetailsPage;
