import { FaHeart } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function RecipeCard({
  id,
  title,
  description,
  herbs,
  targetedDiseases,
  createdByAI,
  createdDate,
  averageRating,
  totalRatings,
  isActive,
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/patient/home/recipes/${id}`)}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative flex min-h-[180px] flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.25),_transparent_30%),linear-gradient(135deg,_#effcf5_0%,_#ffffff_65%,_#f8fafc_100%)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <div className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {createdDate}
              </div>
              <div className="rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                {targetedDiseases.length} condition
                {targetedDiseases.length === 1 ? "" : "s"}
              </div>
              {isActive === false ? (
                <div className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Inactive
                </div>
              ) : null}
            </div>
            {createdByAI ? (
              <div className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                <MdVerified className="text-xs" />
                <span>AI Generated</span>
              </div>
            ) : null}
          </div>

          <span
            type="button"
            className="rounded-full bg-white/90 p-2 text-slate-500 shadow-sm transition-colors hover:text-red-500"
          >
            <FaHeart className="text-sm" />
          </span>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Herbal Recipe
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-primary">
            {title}
          </h3>
        </div>
      </div>

      <div className="p-5">
        <p className="line-clamp-3 text-sm text-slate-600">{description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {herbs.length ? (
            herbs.map((herb) => (
              <span
                key={`${herb.herbId}-${herb.herbName}`}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              >
                {herb.herbName}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              No herbs listed
            </span>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Targets
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {targetedDiseases.length
                ? targetedDiseases.map((disease) => disease.diseaseName).join(", ")
                : "General wellness"}
            </p>
          </div>
          <div className="grid gap-2 text-right">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Herbs
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {herbs.length}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Rating
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {averageRating != null ? `${averageRating}/5` : "N/A"}
              </p>
              <p className="text-[11px] text-slate-500">
                {totalRatings != null ? `${totalRatings} reviews` : "No reviews"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default RecipeCard;
