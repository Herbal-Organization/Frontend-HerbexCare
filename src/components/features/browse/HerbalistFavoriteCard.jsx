import { useMemo } from "react";
import { motion } from "motion/react";
import { FaHeart, FaRegHeart, FaStar, FaClock } from "react-icons/fa";
import { cn } from "@utils/cn";

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

function getInitials(name) {
  if (!name) return "H";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "from-emerald-500 to-teal-600",
  "from-teal-500 to-cyan-600",
  "from-emerald-400 to-green-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-indigo-600",
  "from-emerald-600 to-lime-600",
];

function getAvatarColor(id) {
  return AVATAR_COLORS[Math.abs((id || 0)) % AVATAR_COLORS.length];
}

function HerbalistFavoriteCard({
  herbalist,
  isFavorite = false,
  onToggleFavorite,
  isFavoriteUpdating = false,
}) {
  const id = herbalist?.herbalistId;
  const rating =
    herbalist?.averageRating != null && Number.isFinite(herbalist.averageRating)
      ? Number(herbalist.averageRating).toFixed(1)
      : null;

  const initials = useMemo(() => getInitials(herbalist?.fullName), [herbalist?.fullName]);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (!onToggleFavorite || isFavoriteUpdating || !id) return;
    onToggleFavorite(id);
  };

  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ y: -6 }}
      className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-xl hover:shadow-emerald-500/10"
    >
      <div className="relative bg-linear-to-br from-emerald-600 to-teal-700 px-5 pt-5 pb-12">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg shadow-black/10",
                `bg-linear-to-br ${getAvatarColor(id)}`,
              )}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-white">
                {herbalist.fullName}
              </h3>
              {herbalist.licenseNumber ? (
                <p className="truncate text-xs font-medium text-emerald-100/80">
                  License: {herbalist.licenseNumber}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isFavoriteUpdating}
            aria-label={
              isFavorite ? "Remove herbalist from favorites" : "Add herbalist to favorites"
            }
            className={cn(
              "shrink-0 flex h-9 w-9 items-center justify-center rounded-xl border transition-all",
              isFavorite
                ? "border-rose-200/30 bg-rose-400/20 text-rose-200"
                : "border-white/20 bg-white/10 text-white hover:bg-white/20 active:scale-95",
              isFavoriteUpdating && "cursor-not-allowed opacity-60",
            )}
          >
            {isFavorite ? (
              <FaHeart className="text-sm" />
            ) : (
              <FaRegHeart className="text-sm" />
            )}
          </button>
        </div>
      </div>

      <div className="relative -mt-7 mx-4 flex items-center gap-2 flex-wrap">
        {rating ? (
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200/60 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/40 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-sm">
            <FaStar className="text-[10px] text-amber-500" />
            {rating}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 shadow-sm">
            No ratings
          </div>
        )}

        {herbalist.availableFrom && herbalist.availableTo ? (
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shadow-sm">
            <FaClock className="text-[10px]" />
            {herbalist.availableFrom} – {herbalist.availableTo}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        {herbalist.bio ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {herbalist.bio}
          </p>
        ) : (
          <p className="text-sm italic text-slate-400 dark:text-slate-500">
            No bio provided yet.
          </p>
        )}
      </div>
    </motion.article>
  );
}

export default HerbalistFavoriteCard;
