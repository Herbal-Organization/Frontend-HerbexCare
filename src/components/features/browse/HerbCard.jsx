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
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-start shadow-sm transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-xl hover:shadow-emerald-500/10"
    >
      <div className="relative overflow-hidden">
        {herb.imageURL ? (
          <img
            src={herb.imageURL}
            alt={displayName}
            className="block h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-48"
          />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 sm:h-48">
            <FaLeaf className="text-5xl text-emerald-300/80" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {herb.isApproved === true ? (
          <span className="absolute start-3 top-3 rounded-full border border-emerald-200/80 dark:border-emerald-700 bg-white/95 dark:bg-slate-800/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 shadow-sm backdrop-blur-sm">
            Approved
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-slate-100 transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
            {displayName}
          </h3>
          {herb.scientificName ? (
            <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">
              {herb.scientificName}
            </p>
          ) : null}
          {herbalistName ? (
            <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-slate-400 dark:text-slate-500">By</span> {herbalistName}
            </p>
          ) : null}
        </div>

        {uses.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {uses.slice(0, 3).map((use) => (
              <span
                key={use}
                className="rounded-full border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300"
              >
                {use}
              </span>
            ))}
          </div>
        ) : null}

        {herb.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {herb.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
            View details →
          </span>
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isFavoriteUpdating}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
              isFavorite
                ? "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
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
