import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "motion/react";
import { getHerbWithHerbalist } from "@api/herbs";
import { FaHeart, FaLeaf, FaRegHeart } from "react-icons/fa";

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

function HerbCard({
  herb,
  isFavorite = false,
  onToggleFavorite,
  isFavoriteUpdating = false,
}) {
  const navigate = useNavigate();
  const [herbalistName, setHerbalistName] = useState(null);

  useEffect(() => {
    if (herb?.herbId) {
      getHerbWithHerbalist(herb.herbId)
        .then((data) => {
          if (data?.herbalistName) {
            setHerbalistName(data.herbalistName);
          }
        })
        .catch((err) => console.error("Failed to fetch herbalist info", err));
    }
  }, [herb?.herbId]);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (!onToggleFavorite || isFavoriteUpdating) return;
    onToggleFavorite(herb.herbId);
  };

  const displayName = herb.herbName || herb.name;
  const uses = herb.commonUses?.length
    ? herb.commonUses
    : herb.benefitList?.slice(0, 3) || [];

  return (
    <Motion.button
      variants={itemVariants}
      whileHover={{ y: -6 }}
      type="button"
      onClick={() => navigate(`/patient/home/herbs/${herb.herbId}`)}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-start shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10"
    >
      <div className="relative overflow-hidden">
        {herb.imageURL ? (
          <img
            src={herb.imageURL}
            alt={displayName}
            className="block h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-48"
          />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-linear-to-br from-emerald-50 to-teal-50 sm:h-48">
            <FaLeaf className="text-5xl text-emerald-300/80" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {herb.isApproved === true ? (
          <span className="absolute start-3 top-3 rounded-full border border-emerald-200/80 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 shadow-sm backdrop-blur-sm">
            Approved
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700">
            {displayName}
          </h3>
          {herb.scientificName ? (
            <p className="mt-1 text-xs italic text-slate-500">
              {herb.scientificName}
            </p>
          ) : null}
          {herbalistName ? (
            <p className="mt-2 text-xs font-medium text-slate-500">
              <span className="text-slate-400">By</span> {herbalistName}
            </p>
          ) : null}
        </div>

        {uses.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {uses.slice(0, 3).map((use) => (
              <span
                key={use}
                className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800"
              >
                {use}
              </span>
            ))}
          </div>
        ) : null}

        {herb.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
            {herb.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-xs font-bold text-emerald-700 transition-colors group-hover:text-emerald-600">
            View details →
          </span>
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isFavoriteUpdating}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
              isFavorite
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-slate-200 bg-slate-50 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
            } ${isFavoriteUpdating ? "cursor-not-allowed opacity-60" : ""}`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <FaHeart className="text-sm" />
            ) : (
              <FaRegHeart className="text-sm" />
            )}
          </button>
        </div>
      </div>
    </Motion.button>
  );
}

export default HerbCard;
