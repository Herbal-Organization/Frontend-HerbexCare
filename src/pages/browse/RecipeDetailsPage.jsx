import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLeaf,
  FaStar,
  FaUserMd,
  FaCalendarAlt,
  FaToggleOn,
  FaRobot,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import Skeleton from "react-loading-skeleton";
import PatientNavbar from "../../components/browse/PatientNavbar";
import Footer from "../../components/landing/Footer";
import useRecipeDetails from "../../hooks/useRecipeDetails";
import useRecipeReviews from "../../hooks/useRecipeReviews";
import { isAuthenticated } from "../../utils/auth";

import { useCart } from "../../context/CartContext";

/* ── Shared section card ── */
function SectionCard({
  title,
  icon,
  iconBg = "bg-slate-100",
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-6 ${className}`}
    >
      <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
        <div
          className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
        <h2 className="text-sm font-medium text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, hint, accent }) {
  const accentMap = {
    amber: "bg-[#FAEEDA] border-[#EF9F27]",
    green: "bg-[#EAF3DE] border-[#97C459]",
    default: "bg-white border-slate-100",
  };
  const valueColor = {
    amber: "text-[#633806]",
    green: "text-[#27500A]",
    default: "text-slate-900",
  };
  return (
    <div
      className={`rounded-xl border p-4 ${accentMap[accent] ?? accentMap.default}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
      </p>
      <p
        className={`font-['Instrument_Serif',serif] text-2xl leading-none mb-1 ${valueColor[accent] ?? valueColor.default}`}
      >
        {value}
      </p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

/* ── Herb item ── */
function HerbItem({ herb }) {
  return (
    <div className="border border-slate-100 rounded-xl p-4 mb-3 last:mb-0 transition-colors hover:bg-slate-50">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-base text-slate-900"
          >
            {herb.herbName}
          </p>
          <p
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-xs italic text-slate-400 mt-0.5"
          >
            {herb.scientificName}
          </p>
        </div>
        <span className="text-[11px] font-medium bg-[#EAF3DE] text-[#27500A] border border-[#97C459] rounded-full px-3 py-1 shrink-0">
          {herb.quantity}g
        </span>
      </div>
      <p className="text-xs leading-relaxed text-slate-500 mb-3">
        {herb.description}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1">
            Benefits
          </p>
          <p className="text-xs font-medium text-slate-700">
            {herb.benefits || "—"}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1">
            Dosage
          </p>
          <p className="text-xs font-medium text-slate-700">
            {herb.dosage || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Review card ── */
function ReviewCard({ review }) {
  return (
    <div className="border border-slate-100 rounded-xl p-4 bg-white mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center text-[#27500A] text-sm font-medium shrink-0">
            {review.patientName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {review.patientName}
            </p>
            <p className="text-[11px] text-slate-400">
              {review.createdDate
                ? new Date(review.createdDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Patient"}
            </p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`text-[10px] ${i < review.ratingValue ? "text-[#BA7517]" : "text-slate-200"}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 mb-2">
        <span className="rounded-full bg-[#FAEEDA] px-2.5 py-1 text-[#854F0B]">
          Rating: {review.ratingValue}/5
        </span>
      </div>
      <p className="text-xs leading-relaxed text-slate-500 bg-slate-50 rounded-lg p-3">
        {review.comment || "No comment provided."}
      </p>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

function RecipeDetailsPage() {
  const { recipeId } = useParams();
  const { addRecipeToCart } = useCart();
  const { recipe, herbs, isLoading, error, reload } =
    useRecipeDetails(recipeId);
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

  const [reviewForm, setReviewForm] = useState({ ratingValue: 5, comment: "" });
  const canReview = isAuthenticated();

  const [recipeQuantity, setRecipeQuantity] = useState(1);

  useEffect(() => {
    if (!myReview) return;
    setReviewForm({
      ratingValue: myReview.ratingValue || 5,
      comment: myReview.comment || "",
    });
  }, [myReview]);

  const averageFromReviews = useMemo(() => {
    if (!reviews.length) return null;
    return (
      reviews.reduce((s, r) => s + r.ratingValue, 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PatientNavbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 flex-1 w-full">
        <Link
          to="/patient/home/recipes"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-2 mb-8 hover:text-[#3B6D11] transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back to recipes
        </Link>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-100 bg-white p-8 lg:p-10">
              <div className="flex flex-wrap gap-2 mb-5">
                <Skeleton width={110} height={24} borderRadius={9999} />
                <Skeleton width={92} height={24} borderRadius={9999} />
              </div>
              <Skeleton height={58} width="72%" className="mb-4" />
              <Skeleton count={2} className="mb-6" />
              <div className="flex flex-wrap gap-2">
                <Skeleton width={90} height={28} borderRadius={9999} />
                <Skeleton width={120} height={28} borderRadius={9999} />
                <Skeleton width={100} height={28} borderRadius={9999} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`recipe-detail-stat-${index}`}
                  className="rounded-xl border border-slate-100 bg-white p-4"
                >
                  <Skeleton width="55%" height={10} />
                  <Skeleton width="70%" height={24} className="mt-3" />
                  <Skeleton width="45%" height={12} className="mt-2" />
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] items-start">
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <Skeleton width="35%" height={18} className="mb-5" />
                  <Skeleton count={4} className="mb-3" />
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <Skeleton width="30%" height={18} className="mb-5" />
                  <Skeleton count={3} className="mb-3" />
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <Skeleton width="32%" height={18} className="mb-5" />
                  <Skeleton count={3} className="mb-3" />
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <Skeleton width="28%" height={18} className="mb-5" />
                  <Skeleton height={52} className="mb-4" />
                  <Skeleton height={52} className="mb-4" />
                  <Skeleton height={52} />
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <Skeleton width="28%" height={18} className="mb-5" />
                  <Skeleton count={4} className="mb-3" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-14 text-center">
            <h2 className="text-lg font-medium text-red-800 mb-2">
              Unable to load recipe
            </h2>
            <p className="text-sm text-red-500 mb-7">{error}</p>
            <button
              onClick={reload}
              className="rounded-full bg-red-600 text-white text-sm font-medium px-6 py-2.5 hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && recipe && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {/* Hero */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-slate-100 bg-white p-8 lg:p-10"
            >
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-[10px] font-medium uppercase tracking-wider bg-[#1a2e1a] text-[#a8d878] border border-[#3B6D11] rounded-full px-3 py-1">
                  {recipe.createdDate}
                </span>
                {recipe.createdByAI && (
                  <span className="text-[10px] font-medium uppercase tracking-wider bg-[#EAF3DE] text-[#27500A] border border-[#97C459] rounded-full px-3 py-1 flex items-center gap-1">
                    <FaRobot className="text-[9px]" /> AI curation
                  </span>
                )}
              </div>

              <h1
                style={{ fontFamily: "'Instrument Serif', serif" }}
                className="text-4xl lg:text-5xl text-slate-900 leading-tight mb-4"
              >
                {recipe.title}
              </h1>
              <p className="text-sm leading-relaxed text-slate-500 max-w-2xl mb-6">
                {recipe.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {recipe.targetedDiseases?.length ? (
                  recipe.targetedDiseases.map((d) => (
                    <span
                      key={d.diseaseId}
                      className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-slate-700"
                    >
                      {d.diseaseName}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-slate-700">
                    General wellness
                  </span>
                )}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              <StatCard
                label="Patient rating"
                value={
                  recipe.averageRatingLabel
                    ? `${recipe.averageRatingLabel} ★`
                    : "New"
                }
                hint={
                  recipe.totalRatings != null
                    ? `${recipe.totalRatings} reviews`
                    : undefined
                }
                accent="amber"
              />
              <StatCard
                label="Herbalist rating"
                value={
                  recipe.herbalistAverageRatingLabel
                    ? `${recipe.herbalistAverageRatingLabel} ★`
                    : "N/A"
                }
                hint={
                  recipe.herbalistTotalRatings != null
                    ? `${recipe.herbalistTotalRatings} pro reviews`
                    : undefined
                }
                accent="green"
              />
              <StatCard
                label="Created"
                value={recipe.createdDate}
                hint="Publication date"
              />
              <StatCard
                label="Status"
                value={
                  recipe.isActive == null
                    ? "Unknown"
                    : recipe.isActive
                      ? "Active"
                      : "Inactive"
                }
                hint="Availability"
              />
            </motion.div>

            {/* Body */}
            <motion.div
              variants={itemVariants}
              className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] items-start"
            >
              {/* Left */}
              <div className="space-y-5">
                <SectionCard
                  title="Preparation & usage"
                  icon={
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <rect
                        x="1"
                        y="2"
                        width="13"
                        height="11"
                        rx="2"
                        stroke="#185FA5"
                        strokeWidth="1.2"
                      />
                      <line
                        x1="4"
                        y1="6"
                        x2="11"
                        y2="6"
                        stroke="#185FA5"
                        strokeWidth="1"
                      />
                      <line
                        x1="4"
                        y1="9"
                        x2="9"
                        y2="9"
                        stroke="#185FA5"
                        strokeWidth="1"
                      />
                    </svg>
                  }
                  iconBg="bg-[#E6F1FB]"
                >
                  <pre className="whitespace-pre-line text-xs leading-relaxed text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-4 font-sans">
                    {recipe.instructions ||
                      "No specific instructions provided. Consult an expert."}
                  </pre>
                </SectionCard>

                <SectionCard
                  title="Herb composition"
                  icon={
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path
                        d="M7.5 1.5C10.5 4.5 11.5 9.5 7.5 14C3.5 9.5 4.5 4.5 7.5 1.5Z"
                        fill="#3B6D11"
                      />
                    </svg>
                  }
                  iconBg="bg-[#EAF3DE]"
                >
                  {herbs.map((h) => (
                    <HerbItem key={h.herbId} herb={h} />
                  ))}
                </SectionCard>
              </div>

              {/* Right */}
              <div className="space-y-5">
                {/* Order Recipe Section */}
                <SectionCard
                  title="Order Recipe"
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 2C4 2 5 12 12 12C19 12 20 2 20 2"
                        stroke="#3B6D11"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 12V22M12 22L8 18M12 22L16 18"
                        stroke="#3B6D11"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                  iconBg="bg-[#EAF3DE]"
                >
                  <p className="text-xs text-slate-500 mb-4">
                    Get a freshly customized package of this recipe's herbs,
                    properly measured out.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={recipeQuantity}
                      onChange={(e) => setRecipeQuantity(e.target.value)}
                      placeholder="Orders"
                      className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#3B6D11] focus:ring-2 focus:ring-[#3B6D11]/10 transition"
                    />
                    <button
                      disabled={!recipeQuantity || Number(recipeQuantity) <= 0}
                      onClick={() => {
                        const qty = parseInt(recipeQuantity, 10);
                        if (!qty || qty <= 0) return;
                        const unitPrice = Number(recipe.price || 0);
                        addRecipeToCart({
                          recipeId: recipe.recipeId || recipe.id,
                          quantity: qty,
                          unitPrice,
                          price: unitPrice,
                          totalPrice: unitPrice * qty,
                          _previewName: recipe.title,
                        });
                        setRecipeQuantity(1); // reset after adding
                      }}
                      className="flex-1 rounded-lg bg-[#1a2e1a] text-[#a8d878] px-4 py-2.5 text-xs font-bold transition hover:bg-[#3B6D11] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Add to Cart
                    </button>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Advantages"
                  icon={<FaCheckCircle className="text-[#3B6D11] text-xs" />}
                  iconBg="bg-[#EAF3DE]"
                >
                  <div className="bg-[#EAF3DE] border border-[#C0DD97] rounded-xl p-4 space-y-3">
                    {recipe.advantages?.length ? (
                      recipe.advantages.map((item) => (
                        <div key={item} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B6D11] shrink-0 mt-1.5" />
                          <span className="text-xs leading-relaxed text-[#27500A]">
                            {item}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#3B6D11] italic">
                        No noted advantages.
                      </p>
                    )}
                  </div>
                </SectionCard>

                <SectionCard
                  title="Disadvantages"
                  icon={
                    <FaExclamationTriangle className="text-[#854F0B] text-xs" />
                  }
                  iconBg="bg-[#FAEEDA]"
                >
                  <div className="bg-[#FAEEDA] border border-[#FAC775] rounded-xl p-4 space-y-3">
                    {recipe.disadvantages?.length ? (
                      recipe.disadvantages.map((item) => (
                        <div key={item} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#854F0B] shrink-0 mt-1.5" />
                          <span className="text-xs leading-relaxed text-[#412402]">
                            {item}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#412402] italic">
                        No noted disadvantages.
                      </p>
                    )}
                  </div>
                </SectionCard>

                {/* Reviews */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-0.5">
                        Community feedback
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Share your experience
                      </p>
                    </div>
                    <div className="text-right bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                      <p
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                        className="text-2xl text-slate-900 leading-none"
                      >
                        {averageFromReviews ? `${averageFromReviews} ★` : "—"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {reviewsError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600 mb-4">
                      {reviewsError}
                    </div>
                  )}

                  {canReview ? (
                    <form
                      onSubmit={handleReviewSubmit}
                      className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5"
                    >
                      <p className="text-xs font-medium text-slate-500 mb-2.5">
                        Your rating
                      </p>
                      <div className="flex gap-1.5 mb-3">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() =>
                              setReviewForm((c) => ({ ...c, ratingValue: v }))
                            }
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                              Number(reviewForm.ratingValue) >= v
                                ? "bg-[#FAEEDA] border-[#EF9F27]"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <FaStar
                              className={`text-xs ${Number(reviewForm.ratingValue) >= v ? "text-[#BA7517]" : "text-slate-300"}`}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm((c) => ({
                            ...c,
                            comment: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Share your experience..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-[#3B6D11] focus:ring-2 focus:ring-[#3B6D11]/10 resize-none transition"
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-[#1a2e1a] text-[#a8d878] text-xs font-medium rounded-lg px-4 py-2 hover:bg-[#3B6D11] transition-colors disabled:opacity-50"
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : myReview
                              ? "Update review"
                              : "Publish feedback"}
                        </button>
                        {myReview && (
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-xs font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="text-xs text-center text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5">
                      Log in as a patient to leave feedback.
                    </div>
                  )}

                  {areReviewsLoading && (
                    <div className="flex items-center justify-center gap-2 py-6">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#3B6D11]" />
                      <p className="text-xs text-slate-400">
                        Loading reviews...
                      </p>
                    </div>
                  )}

                  {!areReviewsLoading && reviews.length === 0 && (
                    <p className="text-xs text-center text-slate-400 py-6">
                      Be the first to share your experience.
                    </p>
                  )}

                  {!areReviewsLoading &&
                    reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default RecipeDetailsPage;
